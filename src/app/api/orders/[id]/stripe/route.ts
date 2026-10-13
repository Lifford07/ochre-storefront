import { getOrder, saveOrder } from "@/lib/orders-store"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"
import { stripe, stripeReady, type CheckoutSession } from "@/lib/stripe"

export const dynamic = "force-dynamic"

function origin(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") || "https"
  return host ? `${proto}://${host}` : "https://ochre-storefront.vercel.app"
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await rateLimit(`stripe:${clientIp(request)}`, 10, 600))) return tooMany()
  if (!stripeReady()) return Response.json({ error: "Card checkout is not connected yet. Nothing was charged." }, { status: 503 })
  const { id } = await params
  const { t } = (await request.json().catch(() => ({}))) as { t?: string }
  const order = await getOrder(id)
  if (!order || !t || order.viewToken !== t) return Response.json({ error: "Order not found." }, { status: 404 })
  if (order.status === "paid, awaiting Ochré check") return Response.json({ error: "This order is already paid." }, { status: 409 })
  const base = origin(request)
  const name = `${order.artworkTitle ?? "Your image"} · ${order.materialName}, ${order.sizeName}`
  try {
    const session = await stripe<CheckoutSession>("/checkout/sessions", {
      idempotencyKey: `ochre-${order.id}-${order.pricePence}`,
      body: {
        mode: "payment",
        "line_items[0][quantity]": 1,
        "line_items[0][price_data][currency]": "gbp",
        "line_items[0][price_data][unit_amount]": order.pricePence,
        "line_items[0][price_data][product_data][name]": name.slice(0, 250),
        "line_items[0][price_data][product_data][description]": `${order.editionLabel}. Certificate of authenticity included. Delivery included.`,
        allow_promotion_codes: "true",
        "payment_method_types[0]": "card",
        customer_email: order.email,
        client_reference_id: order.id,
        "metadata[order_id]": order.id,
        "payment_intent_data[metadata][order_id]": order.id,
        success_url: `${base}/orders/${order.id}?t=${encodeURIComponent(t)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${base}/orders/${order.id}?t=${encodeURIComponent(t)}&cancelled=1`,
      },
    })
    await saveOrder({ ...order, paymentMethod: "card", stripeSessionId: session.id })
    return Response.json({ url: session.url })
  } catch (error) {
    console.error("stripe-session", error instanceof Error ? error.message : "failed")
    return Response.json({ error: "Card checkout could not be opened. Nothing was charged." }, { status: 502 })
  }
}
