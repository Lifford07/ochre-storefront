import { settleStripe, verifyWebhook } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return Response.json({ error: "Webhook not configured." }, { status: 503 })
  const payload = await request.text()
  if (!verifyWebhook(payload, request.headers.get("stripe-signature"), secret)) {
    return Response.json({ error: "Bad signature." }, { status: 400 })
  }
  const event = JSON.parse(payload) as { type: string; data: { object: { id: string; metadata?: { order_id?: string } } } }
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const orderId = event.data.object.metadata?.order_id
    if (orderId) await settleStripe(orderId, event.data.object.id)
  }
  return Response.json({ received: true })
}
