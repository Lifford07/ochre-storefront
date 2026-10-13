import type { StoredOrder } from "./order-types.ts"

/** What the paying browser needs. No RPC URL and no other customer's record. */
export function buyerOrder(order: StoredOrder) {
  return {
    id: order.id,
    status: order.status,
    editionLabel: order.editionLabel,
    editionNumber: order.editionNumber,
    editionSize: order.editionSize,
    usdcAmount: order.usdcAmount,
    pricePence: order.pricePence,
    materialName: order.materialName,
    sizeName: order.sizeName,
    cluster: order.cluster,
    payUrl: order.payUrl,
    recipient: order.recipient,
    mint: order.mint,
    reference: order.reference,
    memo: order.memo,
    signature: order.signature,
    solscanUrl: order.solscanUrl,
    payer: order.payer,
    paidAt: order.paidAt,
    viewToken: order.viewToken,
    label: order.label,
    message: order.message,
  }
}
