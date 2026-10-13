import { FALLBACK_GBP_USDC, rateFromPyth, type FxSource } from "@/lib/usdc"

const PYTH_GBP_USD = "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1"

export type FxQuote = {
  gbpToUsdc: number
  source: FxSource
}

export async function gbpToUsdc(): Promise<FxQuote> {
  const configured = Number(process.env.GBP_USDC_RATE)
  if (Number.isFinite(configured) && configured > 0) {
    return { gbpToUsdc: configured, source: "configured" }
  }

  try {
    const url = `https://hermes.pyth.network/v2/updates/price/latest?ids[]=${PYTH_GBP_USD}&parsed=true`
    const response = await fetch(url, { cache: "no-store" })
    if (!response.ok) throw new Error(`Pyth answered ${response.status}`)
    const body = (await response.json()) as {
      parsed?: { price?: { price?: string; expo?: number } }[]
    }
    const price = body.parsed?.[0]?.price
    if (!price?.price || price.expo == null) throw new Error("Pyth price was empty")
    return { gbpToUsdc: rateFromPyth(price.price, price.expo), source: "pyth" }
  } catch {
    // Pyth's price endpoint currently refuses anonymous calls. The ECB rate is the next public feed.
  }

  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=GBP&to=USD", { cache: "no-store" })
    if (!response.ok) throw new Error(`Rate feed answered ${response.status}`)
    const body = (await response.json()) as { rates?: { USD?: number } }
    const usd = body.rates?.USD
    if (!usd || usd <= 0) throw new Error("GBP rate was empty")
    return { gbpToUsdc: usd, source: "ecb" }
  } catch {
    return { gbpToUsdc: FALLBACK_GBP_USDC, source: "fallback" }
  }
}
