import BigNumber from "bignumber.js"

export type ChainHit = {
  signature: string
  failed: boolean
  matches: boolean
  payer: string | null
}

export type TransferHit = {
  signature: string
  failed: boolean
  /** USDC this transaction added for this order. Null when it is unrelated. */
  amount: string | null
  payer: string | null
  /** Higher means the transfer happened later. */
  newer: number
}

export type PaymentDecision = {
  settled: boolean
  signature: string | null
  payer: string | null
  received: string
  /** Some USDC arrived, and it is still short of the order. */
  partial: boolean
  /** The total received is above the order amount. */
  overpaid: boolean
  /** More than one transaction each covered the full amount. */
  duplicate: boolean
  /** The amount was met by adding more than one transfer. */
  split: boolean
}

/** Skip a failed or unrelated transaction that happens to name the reference. */
export function firstMatchingPayment(hits: ChainHit[]): ChainHit | null {
  for (const hit of hits) {
    if (hit.failed || !hit.matches) continue
    return hit
  }
  return null
}

/**
 * Credit the order from every relevant transfer, newest or oldest.
 * One short payment does not block a later full payment.
 * Several short payments count once their sum covers the order.
 */
export function decidePayment(hits: TransferHit[], expected: string): PaymentDecision {
  const expectedBn = new BigNumber(expected)
  const none: PaymentDecision = {
    settled: false,
    signature: null,
    payer: null,
    received: "0.00",
    partial: false,
    overpaid: false,
    duplicate: false,
    split: false,
  }
  if (!expectedBn.isFinite() || expectedBn.lte(0)) return none
  const live = hits
    .filter((hit) => !hit.failed && hit.amount != null && new BigNumber(hit.amount).gt(0))
    .sort((a, b) => a.newer - b.newer)
  if (live.length === 0) return none

  let sum = new BigNumber(0)
  let crossing: TransferHit | null = null
  for (const hit of live) {
    sum = sum.plus(hit.amount as string)
    if (!crossing && sum.gte(expectedBn)) crossing = hit
  }
  const received = sum.decimalPlaces(2, BigNumber.ROUND_HALF_UP).toFixed(2)
  if (sum.lt(expectedBn)) {
    return { ...none, received, partial: true }
  }
  const covers = live.filter((hit) => new BigNumber(hit.amount as string).gte(expectedBn))
  return {
    settled: true,
    signature: crossing?.signature ?? live[live.length - 1].signature,
    payer: crossing?.payer ?? live[live.length - 1].payer,
    received,
    partial: false,
    overpaid: sum.minus(expectedBn).gt(0.009),
    duplicate: covers.length > 1,
    split: covers.length === 0,
  }
}
