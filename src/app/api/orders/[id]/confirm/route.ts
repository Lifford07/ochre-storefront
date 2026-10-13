import { buyerOrder } from "@/lib/order-public"
import { getOrder, OrderStoreError } from "@/lib/orders-store"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"
import { recordPayment } from "@/lib/record-payment"

export const dynamic = "force-dynamic"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const ip = clientIp(request)
  if (!(await rateLimit(`confirm:${ip}`, 40, 600))) return tooMany()
  const { id } = await context.params
  if (!(await rateLimit(`confirm-order:${id}`, 30, 600))) return tooMany()

  let existing
  try {
    existing = await getOrder(id)
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: "The order store did not answer." }, { status: 503 })
    }
    throw error
  }
  if (!existing) return Response.json({ error: "No order with that id." }, { status: 404 })
  if (existing.status === "paid, awaiting Ochré check") {
    return Response.json({ found: true, order: buyerOrder(existing) })
  }

  try {
    const paid = await recordPayment(existing)
    if (!paid) return Response.json({ found: false, order: buyerOrder(existing) })
    return Response.json({ found: true, order: buyerOrder(paid) })
  } catch (error) {
    const message = error instanceof Error ? error.message : "The network did not answer."
    console.error("confirm", id, message)
    return Response.json({ found: false, error: message, order: buyerOrder(existing) }, { status: 502 })
  }
}
