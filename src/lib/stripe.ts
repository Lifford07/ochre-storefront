import crypto from "node:crypto"
import { alertFounder } from "@/lib/mail"
import { getOrder, markPaid } from "@/lib/orders-store"
import type { StoredOrder } from "@/lib/order-types"

const API = "https://api.stripe.com/v1"

export function stripeReady() {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

function encode(data: Record<string, string | number | undefined>) {
  const form = new URLSearchParams()
  for (const [key, value] of Object.entries(data)) if (value !== undefined) form.append(key, String(value))
  return form
}

export async function stripe<T>(path: string, init?: { method?: string; body?: Record<string, string | number | undefined>; idempotencyKey?: string }) {
  const headers: Record<string, string> = { authorization: `Bearer ${process.env.STRIPE_SECRET_KEY ?? ""}` }
  if (init?.body) headers["content-type"] = "application/x-www-form-urlencoded"
  if (init?.idempotencyKey) headers["idempotency-key"] = init.idempotencyKey
  const response = await fetch(`${API}${path}`, {
    method: init?.method ?? (init?.body ? "POST" : "GET"),
    headers,
    body: init?.body ? encode(init.body) : undefined,
    cache: "no-store",
  })
  const json = (await response.json()) as T & { error?: { message?: string } }
  if (!response.ok) throw new Error(json.error?.message || `Stripe answered ${response.status}`)
  return json
}

export type CheckoutSession = {
  id: string
  url?: string
  payment_status: "paid" | "unpaid" | "no_payment_required"
  amount_total: number | null
  amount_subtotal: number | null
  currency: string | null
  payment_intent?: string | null
  metadata?: Record<string, string>
  customer_details?: { email?: string | null } | null
}

/** Marks the order paid only when Stripe itself says the session for this order and amount is paid. */
export async function settleStripe(orderId: string, sessionId: string): Promise<StoredOrder | null> {
  const order = await getOrder(orderId)
  if (!order) return null
  if (order.status === "paid, awaiting Ochré check") return order
  if (!order.stripeSessionId || order.stripeSessionId !== sessionId) return order
  const session = await stripe<CheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`)
  if (
    session.payment_status !== "paid" ||
    session.metadata?.order_id !== order.id ||
    session.amount_subtotal !== order.pricePence ||
    session.currency !== "gbp"
  ) {
    return order
  }
  const paid = await markPaid({
    ...order,
    status: "paid, awaiting Ochré check",
    paymentMethod: "card",
    stripePaymentIntent: session.payment_intent ?? undefined,
    paidAt: new Date().toISOString(),
    payer: session.customer_details?.email ?? order.email,
  })
  const ship = [paid.fullName, paid.address, paid.city, paid.postcode, paid.country, paid.email, paid.phone].filter(Boolean).join("\n")
  try {
    await alertFounder({
      id: paid.id,
      summary: `${paid.materialName}, ${paid.sizeName}, ${paid.editionLabel}, paid by card (Stripe)`,
      ship,
      payer: paid.payer || "card",
    })
  } catch {}
  return paid
}

export function verifyWebhook(payload: string, header: string | null, secret: string) {
  if (!header) return false
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]))
  const signatures = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3))
  const t = Number(parts.t)
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex")
  return signatures.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)))
}
