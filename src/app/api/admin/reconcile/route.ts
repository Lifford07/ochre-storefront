import { adminRequired } from "@/lib/admin-auth"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"
import { OrderStoreError } from "@/lib/orders-store"
import { reconcileUnpaid } from "@/lib/record-payment"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  if (!(await rateLimit(`admin-reconcile:${clientIp(request)}`, 6, 600))) return tooMany()
  const denied = adminRequired(request)
  if (denied) return denied
  try {
    const paid = await reconcileUnpaid()
    return Response.json({ paid: paid.map((order) => order.id) })
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: "The order store did not answer." }, { status: 503 })
    }
    throw error
  }
}
