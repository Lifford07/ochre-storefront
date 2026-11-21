import { abortOnce, beginOnce, finishOnce } from "@/lib/once"
import { settleStripe, verifyWebhook } from "@/lib/stripe"

export const dynamic = "force-dynamic"

type StripeEvent = {
  id?: string
  type?: string
  data?: { object?: { id?: string; metadata?: { order_id?: string } } }
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return Response.json({ error: "Webhook not configured." }, { status: 503 })
  const payload = await request.text()
  if (!verifyWebhook(payload, request.headers.get("stripe-signature"), secret)) {
    return Response.json({ error: "Bad signature." }, { status: 400 })
  }
  let event: StripeEvent
  try {
    event = JSON.parse(payload) as StripeEvent
  } catch {
    return Response.json({ error: "The event was not readable." }, { status: 400 })
  }
  if (!event.id) return Response.json({ error: "The event had no id." }, { status: 400 })
  const paid =
    event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded"
  if (!paid) return Response.json({ received: true })

  const key = `stripe:${event.id}`
  const state = await beginOnce(key)
  if (state === "done") return Response.json({ received: true })
  if (state === "busy") return Response.json({ error: "This event is already being recorded." }, { status: 500 })

  try {
    const orderId = event.data?.object?.metadata?.order_id
    const sessionId = event.data?.object?.id
    if (orderId && sessionId) await settleStripe(orderId, sessionId)
    else console.error("stripe-webhook", event.id, "paid event had no order id")
    await finishOnce(key)
    return Response.json({ received: true })
  } catch (error) {
    await abortOnce(key)
    console.error("stripe-webhook", event.id, error instanceof Error ? error.message : "failed")
    return Response.json({ error: "The payment could not be recorded." }, { status: 500 })
  }
}
