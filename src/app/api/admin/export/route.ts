import { adminRequired } from "@/lib/admin-auth"
import { listOrders, OrderStoreError } from "@/lib/orders-store"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const denied = adminRequired(request)
  if (denied) return denied
  let orders
  try {
    orders = await listOrders()
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: "The order store did not answer." }, { status: 503 })
    }
    throw error
  }
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), orders }, null, 2)
  return new Response(body, {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="ochre-orders-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
