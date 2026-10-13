import Link from "next/link"
import { AccountShell } from "@/components/account/account-shell"
import { currentUser } from "@/lib/account-auth"
import { listOrders, type StoredOrder } from "@/lib/orders-store"

export const dynamic = "force-dynamic"
export const metadata = { title: "My orders · OCHRÉ" }

export default async function OrdersPage() {
  const user = await currentUser()
  let orders: StoredOrder[] = []
  let failed = false
  if (user) {
    try {
      orders = (await listOrders()).filter((o) => o.email?.trim().toLowerCase() === user.email)
    } catch {
      failed = true
    }
  }
  return (
    <AccountShell user={user} active="/account/orders" title="My orders">
      {failed ? (
        <p className="text-sm text-[var(--navy)]/70">Your orders cannot be shown just now. Please try again shortly.</p>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-[var(--navy)]/25 p-10 text-center">
          <p className="font-display text-2xl">No orders yet</p>
          <p className="mt-2 text-sm text-[var(--navy)]/70">Orders placed with {user?.email} appear here.</p>
          <Link href="/make" className="mt-6 inline-block bg-[var(--navy)] px-6 py-3 text-[12px] font-semibold tracking-[0.2em] text-[#F3EFE7] uppercase">Begin a piece</Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--navy)]/10 border-y border-[var(--navy)]/10">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-display text-xl">{o.artworkTitle ?? `${o.materialName}, ${o.sizeName}`}</p>
                <p className="text-sm text-[var(--navy)]/65">{new Date(o.createdAt).toLocaleDateString("en-GB")} · {o.editionLabel} · {o.status}</p>
              </div>
              <Link href={`/orders/${o.id}${o.viewToken ? `?t=${o.viewToken}` : ""}`} className="text-sm text-[var(--gold-ink)] underline underline-offset-4">View order</Link>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  )
}
