import BigNumber from "bignumber.js"

/** Used when no configured rate and no price feed is available. USDC tracks the US dollar. */
export const FALLBACK_GBP_USDC = 1.27

/** Extra USDC so a small move in the pound does not leave the order short. */
export const FX_BUFFER = 0.015

export type FxSource = "configured" | "pyth" | "ecb" | "fallback"

export function usdcFromPence(pence: number, gbpToUsdc: number): string {
  if (!Number.isFinite(pence) || pence < 0) throw new Error("Price in pence is not valid")
  if (!Number.isFinite(gbpToUsdc) || gbpToUsdc <= 0) throw new Error("GBP to USDC rate is not valid")
  return new BigNumber(pence)
    .dividedBy(100)
    .multipliedBy(gbpToUsdc)
    .multipliedBy(1 + FX_BUFFER)
    .decimalPlaces(2, BigNumber.ROUND_HALF_UP)
    .toFixed(2)
}

/** Pyth publishes an integer price and an exponent. 127000000 with expo -8 is 1.27. */
export function rateFromPyth(price: string, expo: number): number {
  const rate = new BigNumber(price).multipliedBy(new BigNumber(10).exponentiatedBy(expo))
  if (!rate.isFinite() || rate.lte(0) || rate.gt(10)) {
    throw new Error("Pyth GBP rate was not usable")
  }
  return rate.decimalPlaces(4, BigNumber.ROUND_HALF_UP).toNumber()
}
