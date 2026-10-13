import { createHash } from "node:crypto"
import { checkPassword, clearedCookie, userFromRequest } from "@/lib/account-auth"
import { listKeys, remove } from "@/lib/account-store"
import { deleteOrder, listOrders } from "@/lib/orders-store"

export const dynamic = "force-dynamic"

/** Delete my account: profile, email index, saved images, and any unpaid orders. Paid orders are kept as records. */
export async function DELETE(request: Request) {
  const user = await userFromRequest(request)
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  if (!(await checkPassword(String(body.password ?? ""), user.passwordHash))) {
    return Response.json({ error: "Enter your password to delete your account." }, { status: 401 })
  }
  for (const key of await listKeys(`images/${user.id}/`)) await remove(key)
  await remove(`email/${createHash("sha256").update(user.email).digest("hex")}.json`)
  await remove(`users/${user.id}.json`)
  let removedOrders = 0
  try {
    for (const order of await listOrders()) {
      if (order.email?.trim().toLowerCase() === user.email && order.status === "awaiting payment") {
        await deleteOrder(order.id)
        removedOrders++
      }
    }
  } catch {
    // Order store unavailable; the account itself is gone.
  }
  return Response.json({ deleted: true, removedOrders }, { headers: { "set-cookie": clearedCookie() } })
}
