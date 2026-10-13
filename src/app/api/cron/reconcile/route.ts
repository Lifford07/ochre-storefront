import { OrderStoreError } from "@/lib/orders-store"
import { reconcileUnpaid } from "@/lib/record-payment"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim()
  const header = request.headers.get("authorization") ?? ""
  if (!secret || header !== `Bearer ${secret}`) {
    return Response.json({ error: "This check is locked." }, { status: 401 })
  }
  try {
    const paid = await reconcileUnpaid()
    return Response.json({ checked: true, paid: paid.map((order) => order.id) })
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: "The order store did not answer." }, { status: 503 })
    }
    throw error
  }
}
