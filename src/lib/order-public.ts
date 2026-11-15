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

/** What the paying browser needs for a basket. No other customer's record, and no child tokens until paid. */
export function buyerBasket(basket: import("./order-types.ts").StoredBasket) {
  return {
    id: basket.id,
    status: basket.status,
    pieces: basket.pieces,
    paymentMethod: basket.paymentMethod,
    totalPence: basket.totalPence,
    usdcAmount: basket.usdcAmount,
    cluster: basket.cluster,
    payUrl: basket.payUrl,
    recipient: basket.recipient,
    mint: basket.mint,
    reference: basket.reference,
    memo: basket.memo,
    signature: basket.signature,
    solscanUrl: basket.solscanUrl,
    paidAt: basket.paidAt,
    viewToken: basket.viewToken,
    label: basket.label,
    message: basket.message,
    lines: basket.lines.map((line) => ({
      slug: line.slug,
      title: line.title,
      materialName: line.materialName,
      sizeName: line.sizeName,
      qty: line.qty,
      unitPence: line.unitPence,
    })),
  }
}

export type BuyerBasket = ReturnType<typeof buyerBasket>
