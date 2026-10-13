"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ConnectionProvider, useWallet, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletAdapterNetwork, WalletReadyState, type WalletName } from "@solana/wallet-adapter-base"
import { buildWalletAdapters, walletConnectProjectId } from "@/lib/wallet-adapters"

/**
 * Header wallet. Uses the same adapter set and the same localStorage key ("walletName")
 * as the checkout PayPanel, so a wallet chosen here auto-connects at payment.
 * Wallet Standard wallets (Backpack, MetaMask Solana, Coinbase, etc.) are auto-detected.
 */

const sw = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" className="size-[18px] shrink-0" aria-hidden {...sw}>
    <rect x="3" y="6" width="18" height="13" rx="1.5" />
    <path d="M3 9.5h18" />
    <path d="M6 6V4.5h11V6" />
    <circle cx="16.5" cy="14" r="1" />
  </svg>
)

const CATALOGUE: { name: string; match: string[]; install: string; note?: string }[] = [
  { name: "Phantom", match: ["phantom"], install: "https://phantom.com/download" },
  { name: "Solflare", match: ["solflare"], install: "https://solflare.com/download" },
  { name: "Backpack", match: ["backpack"], install: "https://backpack.app/downloads" },
  { name: "MetaMask", match: ["metamask"], install: "https://metamask.io/download/", note: "Solana support in MetaMask" },
  { name: "Coinbase Wallet", match: ["coinbase"], install: "https://www.coinbase.com/wallet/downloads" },
]

export function openWalletPicker() {
  window.dispatchEvent(new Event("ochre:wallet"))
}

export function HeaderWallet({ className = "" }: { className?: string }) {
  const network = process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet
  const wallets = useMemo(() => buildWalletAdapters(network), [network])
  const endpoint = typeof window === "undefined" ? "https://api.mainnet-beta.solana.com" : `${window.location.origin}/api/rpc`
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={() => undefined}>
        <WalletButton className={className} />
      </WalletProvider>
    </ConnectionProvider>
  )
}

function short(key: string) {
  return `${key.slice(0, 4)}…${key.slice(-4)}`
}

function WalletButton({ className }: { className: string }) {
  const { publicKey, wallet, disconnect, connecting } = useWallet()
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const show = () => setOpen(true)
    window.addEventListener("ochre:wallet", show)
    return () => window.removeEventListener("ochre:wallet", show)
  }, [])

  useEffect(() => {
    if (!menu) return
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setMenu(false)
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [menu])

  const address = publicKey?.toBase58()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-testid="wallet-trigger"
        className={className}
        onClick={() => (address ? setMenu((v) => !v) : setOpen(true))}
        aria-haspopup="dialog"
      >
        <WalletIcon /> {address ? <span className="normal-case tracking-[0.08em]">{short(address)}</span> : connecting ? "Connecting…" : "Wallet"}
      </button>
      {address && menu ? (
        <div className="absolute right-0 z-50 mt-2 w-60 border border-[var(--navy)]/15 bg-[#F3EFE7] p-3 text-[var(--navy)] shadow-[0_18px_40px_-18px_rgba(11,19,50,0.45)]">
          <p className="text-[11px] tracking-[0.14em] text-[var(--navy)]/60 uppercase">{wallet?.adapter.name} connected</p>
          <p className="mt-1 font-mono text-xs break-all">{address}</p>
          <button
            type="button"
            className="mt-3 w-full border border-[var(--navy)] py-2 text-[11px] font-semibold tracking-[0.2em] uppercase hover:bg-[var(--navy)] hover:text-[#F3EFE7]"
            onClick={() => {
              setMenu(false)
              void disconnect()
            }}
          >
            Disconnect
          </button>
        </div>
      ) : null}
      {open ? <WalletPicker onClose={() => setOpen(false)} /> : null}
    </div>
  )
}

function WalletPicker({ onClose }: { onClose: () => void }) {
  const { wallets, select, connect, wallet, publicKey } = useWallet()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", esc)
    return () => document.removeEventListener("keydown", esc)
  }, [onClose])

  useEffect(() => {
    if (publicKey) onClose()
  }, [publicKey, onClose])

  // Once a wallet is selected, connect to it.
  useEffect(() => {
    if (!pending || !wallet || wallet.adapter.name !== pending) return
    connect().catch((reason: unknown) => {
      setError(reason instanceof Error && reason.message ? reason.message : "The wallet did not connect.")
      setPending(null)
    })
  }, [pending, wallet, connect])

  const installed = (w: (typeof wallets)[number]) =>
    w.readyState === WalletReadyState.Installed || w.readyState === WalletReadyState.Loadable

  const rows = CATALOGUE.map((entry) => {
    const found = wallets.find((w) => entry.match.some((m) => w.adapter.name.toLowerCase().includes(m)))
    return { entry, found, ready: found ? installed(found) : false }
  })
  const extras = wallets.filter(
    (w) => (installed(w) || w.adapter.name === "WalletConnect") && !CATALOGUE.some((c) => c.match.some((m) => w.adapter.name.toLowerCase().includes(m))),
  )
  const walletConnectReady = Boolean(walletConnectProjectId())
  const wcAdapter = wallets.find((w) => w.adapter.name === "WalletConnect")

  function choose(name: string) {
    setError(null)
    setPending(name)
    select(name as WalletName)
  }

  const row = "flex w-full items-center justify-between gap-3 border border-[var(--navy)]/12 bg-white/70 px-4 py-3 text-left transition hover:border-[#C6B849]"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1332]/55 p-4 backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Connect a wallet" className="relative max-h-[92vh] w-full max-w-[420px] overflow-y-auto bg-[#F3EFE7] px-7 pt-8 pb-7 text-[var(--navy)] shadow-2xl">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute top-3 right-3 inline-flex size-10 items-center justify-center text-xl text-[var(--navy)]/70 hover:text-[var(--navy)]">
          ×
        </button>
        <p className="text-center font-display text-[28px] leading-none tracking-[0.2em] text-[#C6B849]">OCHRÉ</p>
        <h2 className="mt-4 text-center font-display text-2xl">Connect a wallet</h2>
        <p className="mt-1 text-center text-sm text-[var(--navy)]/65">Pay in USDC on Solana. The same wallet is used at checkout.</p>
        <ul className="mt-6 space-y-2">
          {[...rows.map(({ entry, found, ready }) => ({ key: entry.name, name: entry.name, icon: found?.adapter.icon, ready, install: entry.install, note: entry.note, id: found?.adapter.name })),
            ...extras.map((w) => ({ key: w.adapter.name, name: w.adapter.name, icon: w.adapter.icon, ready: true, install: "", note: undefined, id: w.adapter.name }))].map((item) => (
            <li key={item.key}>
              {item.ready && item.id ? (
                <button type="button" className={row} onClick={() => choose(item.id!)} disabled={pending !== null}>
                  <span className="flex items-center gap-3">
                    <WalletLogo src={item.icon} name={item.name} />
                    <span>{item.name}</span>
                  </span>
                  <span className="text-[10px] tracking-[0.16em] text-[var(--gold-ink)] uppercase">{pending === item.id ? "Connecting…" : "Detected"}</span>
                </button>
              ) : (
                <a href={item.install} target="_blank" rel="noreferrer" className={row}>
                  <span className="flex items-center gap-3">
                    <WalletLogo src={item.icon} name={item.name} />
                    <span>
                      {item.name}
                      {item.note ? <span className="block text-[11px] text-[var(--navy)]/55">{item.note}</span> : null}
                    </span>
                  </span>
                  <span className="text-[10px] tracking-[0.16em] text-[var(--navy)]/55 uppercase">Install ↗</span>
                </a>
              )}
            </li>
          ))}
          {wcAdapter ? null : (
            <li>
              <div className={`${row} cursor-default opacity-70 hover:border-[var(--navy)]/12`} aria-disabled>
                <span className="flex items-center gap-3">
                  <WalletLogo name="WalletConnect" />
                  <span>
                    WalletConnect
                    <span className="block text-[11px] text-[var(--navy)]/55">Scan with a mobile wallet</span>
                  </span>
                </span>
                <span className="text-[10px] tracking-[0.16em] text-[var(--navy)]/55 uppercase">{walletConnectReady ? "Loading" : "Needs setup"}</span>
              </div>
            </li>
          )}
        </ul>
        {error ? <p role="alert" className="mt-3 text-sm text-[#a33a2b]">{error}</p> : null}
        <p className="mt-5 text-center text-[11px] text-[var(--navy)]/55">On a phone, open ochre-storefront.vercel.app inside your wallet app’s browser, or pay by QR code at checkout.</p>
      </div>
    </div>
  )
}

function WalletLogo({ src, name }: { src?: string; name: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="size-7 rounded-md" />
  }
  return (
    <span className="inline-flex size-7 items-center justify-center rounded-md bg-[var(--navy)] font-display text-sm text-[#C6B849]" aria-hidden>
      {name[0]}
    </span>
  )
}
