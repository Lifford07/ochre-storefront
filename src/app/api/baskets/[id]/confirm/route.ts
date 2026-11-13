import { getBasket } from "@/lib/baskets-store"
import { buyerBasket } from "@/lib/order-public"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"
import { recordBasketPayment } from "@/lib/settle-basket"

export const dynamic = "force-dynamic"

/** The paying browser asks here until the USDC transfer for the basket is found on Solana. */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await rateLimit(`confirm:${clientIp(request)}`, 40, 600))) return tooMany()
  const { id } = await context.params
  if (!(await rateLimit(`confirm-basket:${id}`, 30, 600))) return tooMany()
  let basket
  try {
    basket = await getBasket(id)
  } catch {
    return Response.json({ error: "The order store did not answer." }, { status: 503 })
  }
  if (!basket) return Response.json({ error: "No basket with that id." }, { status: 404 })
  if (basket.status === "paid, awaiting Ochré check") return Response.json({ found: true, basket: buyerBasket(basket) })
  try {
    const paid = await recordBasketPayment(basket)
    if (!paid || paid.status !== "paid, awaiting Ochré check") return Response.json({ found: false, basket: buyerBasket(paid ?? basket) })
    return Response.json({ found: true, basket: buyerBasket(paid) })
  } catch (error) {
    const message = error instanceof Error ? error.message : "The network did not answer."
    console.error("confirm-basket", id, message)
    return Response.json({ found: false, error: message, basket: buyerBasket(basket) }, { status: 502 })
  }
}
