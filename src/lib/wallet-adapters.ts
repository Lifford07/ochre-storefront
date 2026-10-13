import { WalletAdapterNetwork, type Adapter } from "@solana/wallet-adapter-base"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom"
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare"
import { WalletConnectWalletAdapter } from "@solana/wallet-adapter-walletconnect"

export function walletConnectProjectId() {
  return process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() || ""
}

/** One adapter list for the header and the checkout, so both see the same wallets. */
export function buildWalletAdapters(network: WalletAdapterNetwork): Adapter[] {
  const list: Adapter[] = [new PhantomWalletAdapter(), new SolflareWalletAdapter({ network })]
  const projectId = walletConnectProjectId()
  if (projectId && typeof window !== "undefined") {
    try {
      list.push(
        new WalletConnectWalletAdapter({
          network: network === WalletAdapterNetwork.Devnet ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet,
          options: {
            projectId,
            metadata: {
              name: "Ochré",
              description: "Your image, made into an object. Pay by card or USDC.",
              url: window.location.origin,
              icons: [`${window.location.origin}/icon.svg`],
            },
          },
        }),
      )
    } catch (error) {
      console.error("walletconnect", error instanceof Error ? error.message : "failed")
    }
  }
  return list
}
