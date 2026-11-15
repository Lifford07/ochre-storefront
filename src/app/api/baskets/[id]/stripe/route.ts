import { getBasket, saveBasket } from "@/lib/baskets-store"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"
import { stripe, stripeReady, type CheckoutSession } from "@/lib/stripe"

export const dynamic = "force-dynamic"

function origin(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") || "https"
  return host ? `${proto}://${host}` : "https://ochre-storefront.vercel.app"
}

/** One Stripe Checkout session for the whole basket: one line per piece, one card payment. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await rateLimit(`stripe:${clientIp(request)}`, 10, 600))) return tooMany()
  if (!stripeReady()) return Response.json({ error: "Card checkout is not connected yet. Nothing was charged." }, { status: 503 })
  const { id } = await params
  const { t } = (await request.json().catch(() => ({}))) as { t?: string }
  let basket
  try {
    basket = await getBasket(id)
  } catch {
    return Response.json({ error: "The order store did not answer. Nothing was charged." }, { status: 503 })
  }
  if (!basket || !t || basket.viewToken !== t) return Response.json({ error: "Basket not found." }, { status: 404 })
  if (basket.status === "paid, awaiting Ochré check") return Response.json({ error: "This basket is already paid." }, { status: 409 })

  const base = origin(request)
  const back = `${base}/baskets/${basket.id}?t=${encodeURIComponent(t)}`
  const body: Record<string, string | number> = {
    mode: "payment",
    allow_promotion_codes: "true",
    "payment_method_types[0]": "card",
    customer_email: basket.email,
    client_reference_id: basket.id,
    "metadata[basket_id]": basket.id,
    "payment_intent_data[metadata][basket_id]": basket.id,
    success_url: `${back}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/checkout?cancelled=1`,
  }
  basket.lines.forEach((line, index) => {
    const at = `line_items[${index}]`
    body[`${at}[quantity]`] = line.qty
    body[`${at}[price_data][currency]`] = "gbp"
    body[`${at}[price_data][unit_amount]`] = line.unitPence
    body[`${at}[price_data][product_data][name]`] = `${line.title} · ${line.materialName}, ${line.sizeName}`.slice(0, 250)
    body[`${at}[price_data][product_data][description]`] = "Numbered edition. Certificate of authenticity included. Delivery included."
  })
  try {
    const session = await stripe<CheckoutSession>("/checkout/sessions", {
      idempotencyKey: `ochre-${basket.id}-${basket.totalPence}`,
      body,
    })
    await saveBasket({ ...basket, paymentMethod: "card", stripeSessionId: session.id })
    return Response.json({ url: session.url })
  } catch (error) {
    console.error("stripe-basket", error instanceof Error ? error.message : "failed")
    return Response.json({ error: "Card checkout could not be opened. Nothing was charged." }, { status: 502 })
  }
}
