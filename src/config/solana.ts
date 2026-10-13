import { PublicKey } from "@solana/web3.js"

/** Circle USDC on Solana devnet. Override with NEXT_PUBLIC_USDC_MINT. */
export const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"

/** Circle USDC on Solana mainnet. */
export const MAINNET_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

/**
 * Public receive address for the local demo. A public key is not a secret.
 * Payments land here on devnet unless NEXT_PUBLIC_MERCHANT_WALLET replaces it.
 */
export const DEMO_MERCHANT = "7WeLc3qZEnnYWfXGxCeRTSqbKkHaeAmUb741wbkSGMAP"

export type SolanaCluster = "devnet" | "mainnet-beta"

export type SolanaSettings = {
  cluster: SolanaCluster
  rpc: string
  merchant: string
  mint: string
}

/**
 * Circle USDC for the cluster.
 * Mainnet ignores a leftover devnet mint so a copied local env cannot take the wrong token.
 */
export function usdcMintFor(cluster: SolanaCluster, override?: string): string {
  const trimmed = override?.trim()
  if (cluster === "mainnet-beta") {
    if (!trimmed || trimmed === DEVNET_USDC_MINT) return MAINNET_USDC_MINT
    return trimmed
  }
  return trimmed || DEVNET_USDC_MINT
}

/**
 * Server-only RPC. SOLANA_RPC_URL is never sent to the browser.
 * On Vercel, a missing URL refuses the call. Locally, the public cluster URL is the fallback.
 */
export function serverRpc(cluster: SolanaCluster): string | null {
  const dedicated = process.env.SOLANA_RPC_URL?.trim()
  if (dedicated) return dedicated
  if (process.env.VERCEL) return null
  return cluster === "devnet" ? "https://api.devnet.solana.com" : "https://api.mainnet-beta.solana.com"
}

export function solanaSettings(): SolanaSettings {
  const cluster: SolanaCluster =
    process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "mainnet-beta" : "devnet"
  const rpc = serverRpc(cluster) ?? ""
  const merchant = process.env.NEXT_PUBLIC_MERCHANT_WALLET?.trim() || DEMO_MERCHANT
  const mint = usdcMintFor(cluster, process.env.NEXT_PUBLIC_USDC_MINT)

  try {
    new PublicKey(merchant)
    new PublicKey(mint)
  } catch {
    throw new Error("The merchant wallet or USDC mint in the environment is not a Solana address")
  }

  return { cluster, rpc, merchant, mint }
}

export function solscanTx(signature: string, cluster: SolanaCluster): string {
  const base = `https://solscan.io/tx/${signature}`
  return cluster === "devnet" ? `${base}?cluster=devnet` : base
}
