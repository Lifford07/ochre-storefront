import { Connection } from "@solana/web3.js"
import { serverRpc, solscanTx } from "@/config/solana"
import { findPayment } from "@/lib/find-payment"
import { notifyFounderOnce } from "@/lib/paid-alert"
import { getOrder, listUnpaid, markPaid } from "@/lib/orders-store"
import type { StoredOrder } from "@/lib/order-types"

export async function recordPayment(order: StoredOrder) {
  if (order.status === "paid, awaiting Ochré check") {
    await notifyFounderOnce(order)
    return order
  }
  const rpc = serverRpc(order.cluster)
  if (!rpc) throw new Error("Set SOLANA_RPC_URL on the server before payments can be checked.")
  const decision = await findPayment(new Connection(rpc, "confirmed"), order)
  if (!decision.settled || !decision.signature) return null
  const paymentFlags = (
    [
      decision.overpaid ? "overpaid" : null,
      decision.duplicate ? "duplicate" : null,
      decision.split ? "split" : null,
    ] as const
  ).filter((flag): flag is "overpaid" | "duplicate" | "split" => flag !== null)
  const paid = await markPaid({
    ...order,
    status: "paid, awaiting Ochré check",
    signature: decision.signature,
    solscanUrl: solscanTx(decision.signature, order.cluster),
    paidAt: new Date().toISOString(),
    payer: decision.payer ?? order.payer,
    paymentFlags: paymentFlags.length > 0 ? paymentFlags : undefined,
  })
  await notifyFounderOnce(paid)
  return paid
}

export async function reconcileUnpaid() {
  const waiting = await listUnpaid()
  const paid: StoredOrder[] = []
  for (const order of waiting) {
    const current = (await getOrder(order.id)) ?? order
    if (current.status === "paid, awaiting Ochré check") continue
    try {
      const result = await recordPayment(current)
      if (result) paid.push(result)
    } catch (error) {
      console.error("reconcile", order.id, error instanceof Error ? error.message : "failed")
    }
  }
  return paid
}
