"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useState, type ReactNode } from "react"
import { AccountMenu } from "@/components/account/account-menu"
import { Crest, Wordmark } from "@/components/brand/mark"
import { BasketButton } from "@/components/basket/basket-drawer"
import { NewsletterBand } from "@/components/shell/newsletter-band"

const HeaderWallet = dynamic(() => import("@/components/wallet/header-wallet").then((m) => m.HeaderWallet), { ssr: false })

const lines = [
  { href: "/collection", label: "Walls", live: true },
  { href: "/collection", label: "Home", live: false },
  { href: "/collection", label: "Garments", live: false },
  { href: "/collection", label: "Jewellery", live: false },
]

const ico = "size-[18px] shrink-0"
const sw = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
const HouseIcon = () => (<svg viewBox="0 0 24 24" className={ico} aria-hidden {...sw}><path d="M3 11 12 4l9 7" /><path d="M5.5 9.5V20h13V9.5" /><path d="M10 20v-5h4v5" /></svg>)
const BagIcon = () => (<svg viewBox="0 0 24 24" className={ico} aria-hidden {...sw}><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></svg>)
const MenuIcon = () => (<svg viewBox="0 0 24 24" className={ico} aria-hidden {...sw}><path d="M4 7h16M4 12h16M4 17h16" /></svg>)

const sideBase = "min-h-11 items-center gap-2 font-sans text-[11px] font-medium tracking-[0.2em] uppercase text-[var(--navy)] hover:text-[var(--gold-ink)]"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative bg-[#F3EFE7] text-[var(--navy)]">
      <div className="mx-auto grid h-[72px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 md:h-[104px] md:px-10">
        <div className="flex items-center">
          <button type="button" className="inline-flex min-h-11 min-w-11 items-center md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <MenuIcon />
          </button>
          <Link href="/" className={`hidden md:inline-flex ${sideBase}`}>
            <HouseIcon /> Home
          </Link>
        </div>
        <Link href="/" className="flex min-h-11 items-center justify-center" aria-label="Ochré home">
          <Wordmark tone="gold" className="!text-[#C6B849] !text-[32px] md:!text-[56px] font-semibold !tracking-[0.2em] [text-shadow:0_0_0.6px_#A89A35,0_1px_0_rgba(168,154,53,0.35)]" />
        </Link>
        <nav className="flex items-center justify-end gap-6" aria-label="Shop">
          <span className="hidden md:block"><AccountMenu className={`inline-flex cursor-pointer ${sideBase}`} /></span>
          <span className="hidden min-w-[92px] md:block"><HeaderWallet className={`inline-flex cursor-pointer ${sideBase}`} /></span>
          <BasketButton className={`inline-flex cursor-pointer ${sideBase}`} icon={<BagIcon />} />
        </nav>
      </div>
      <div className="mx-auto h-px max-w-[1440px] bg-[var(--navy)]/15" />
      <nav aria-label="The house" className="overflow-x-auto">
        <ul className="mx-auto flex w-max min-w-full items-end justify-center gap-10 px-5 py-4 md:gap-20">
          {lines.map((line) => {
            const inner = (
              <>
                <span className="font-display text-2xl md:text-[32px]">{line.label}</span>
                {line.live ? null : <span className="ml-1 font-mono text-[9px] tracking-[0.14em] uppercase opacity-60">soon</span>}
              </>
            )
            return (
              <li key={line.label} className="whitespace-nowrap">
                {line.live ? (
                  <Link href={line.href} className="inline-flex min-h-11 items-baseline hover:text-[var(--gold-ink)]">{inner}</Link>
                ) : (
                  <span className="inline-flex min-h-11 items-baseline text-[var(--navy)]/55">{inner}</span>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      {open ? (
        <div className="space-y-1 border-t border-[var(--navy)]/10 px-5 py-4 md:hidden">
          <Link href="/" className={`flex ${sideBase}`}><HouseIcon /> Home</Link>
          <AccountMenu compact className={`flex cursor-pointer ${sideBase}`} />
          <HeaderWallet className={`flex cursor-pointer ${sideBase}`} />
          <Link href="/artists/example-artist" className={`flex ${sideBase}`}>Artists</Link>
        </div>
      ) : null}
      <p className="bg-[var(--navy)] px-4 py-2 text-center font-mono text-[10px] tracking-[0.14em] text-[var(--foil)] uppercase sm:tracking-[0.18em]">
        Every piece is numbered. A certificate of authenticity is issued for every piece. Pay by card or USDC.
      </p>
    </header>
  )
}

export function SiteFooter() {
  return (
    <>
    <NewsletterBand />
    <PaymentStrip />
    <footer className="bg-[var(--navy)] text-[var(--porcelain)]">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 md:grid-cols-[1.1fr_1fr_1fr_1fr_1.2fr] md:px-10">
        <div>
          <Crest className="size-16 text-[var(--gold)]" />
          <Wordmark className="mt-3 block text-sm" />
          <p className="font-display mt-4 text-xl italic text-[var(--foil)]">One house. Four lines.</p>
        </div>
        <FooterCol
          title="The house"
          links={[
            ["Art", "/collection"],
            ["Home · soon", "/collection"],
            ["Ochré Atelier · soon", "/collection"],
            ["Jewellery · soon", "/collection"],
          ]}
        />
        <FooterCol
          title="Collect"
          links={[
            ["Begin with your image", "/make"],
            ["The collection", "/collection"],
            ["SJ", "/artists/sj"],
            ["Certificates", "/orders/preview"],
          ]}
        />
        <FooterCol
          title="Care"
          links={[
            ["Image guide", "/guide"],
            ["Image rights", "/terms#image-rights"],
            ["Shipping", "/shipping"],
            ["Returns", "/returns"],
            ["Contact", "/contact"],
          ]}
        />
        <div>
          <p className="eyebrow text-[var(--gold)]">The house</p>
          <p className="mt-3 text-sm text-[var(--porcelain)]/70">Questions about an order, a file, or a delivery.</p>
          <Link href="/contact" className="mt-4 inline-block text-sm text-[var(--gold)]">
            Write to us
          </Link>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4 font-mono text-[10px] tracking-[0.14em] text-[var(--porcelain)]/60 uppercase md:px-10">
        <span>© Ochré 2026</span>
        <span className="inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[var(--ok)]" />
          {process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "Solana mainnet" : "Solana devnet"} · USDC on Solana
        </span>
        <span className="inline-flex items-center gap-4">
          <Link href="/terms" className="inline-flex min-h-11 items-center">
            Terms
          </Link>
          <Link href="/privacy" className="inline-flex min-h-11 items-center">
            Privacy
          </Link>
        </span>
      </div>
    </footer>
    </>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow text-[var(--gold)]">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--porcelain)]/80">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="inline-flex min-h-11 items-center hover:text-[var(--foil)]">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function FlowHeader({
  step,
  onBack,
}: {
  step: "upload" | "preview" | "material" | "size" | "checkout"
  onBack?: () => void
}) {
  const steps = [
    ["upload", "Upload"],
    ["material", "Material"],
    ["size", "Size"],
    ["preview", "Edit"],
    ["checkout", "Ready"],
  ] as const
  const index = steps.findIndex((item) => item[0] === step)

  return (
    <header className="bg-[var(--navy)] text-[var(--porcelain)]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:h-20 md:px-8">
        {onBack ? (
          <button type="button" onClick={onBack} className="eyebrow !text-[10px] text-[var(--porcelain)] md:!text-[11px]">
            ← {step === "upload" ? "Continue browsing" : "Back"}
          </button>
        ) : (
          <Link href="/" className="eyebrow !text-[10px] md:!text-[11px]">
            ← Continue browsing
          </Link>
        )}
        <Link href="/" aria-label="Ochré home">
          <Wordmark />
        </Link>
        <p className="eyebrow !text-[10px] md:!text-[11px]">Card · USDC</p>
      </div>
      <p className="py-3 text-center font-mono text-[11px] tracking-[0.18em] text-[var(--foil)] uppercase md:hidden">
        {String(index + 1).padStart(2, "0")} {steps[index][1]}
      </p>
      <ol className="mx-auto hidden max-w-3xl items-center justify-center gap-4 px-3 py-4 md:flex">
        {steps.map(([id, label], itemIndex) => {
          const done = itemIndex < index
          const current = id === step
          return (
            <li key={id} className="flex items-center gap-2 md:gap-4">
              <span
                className={`font-mono text-[10px] tracking-[0.14em] uppercase md:text-[11px] ${
                  current ? "text-[var(--foil)] underline decoration-[var(--gold)] underline-offset-4" : done ? "text-[var(--porcelain)]" : "text-[var(--porcelain)]/40"
                }`}
              >
                {done ? "✓ " : ""}
                {String(itemIndex + 1).padStart(2, "0")} {label}
              </span>
              {itemIndex < steps.length - 1 ? <span className="hidden h-px w-6 bg-white/20 sm:block md:w-10" /> : null}
            </li>
          )
        })}
      </ol>
    </header>
  )
}

const PAYMENT_MARKS: Array<{ name: string; mark: ReactNode }> = [
  { name: "Visa", mark: <span className="font-sans text-[15px] font-black italic tracking-[0.02em]">VISA</span> },
  {
    name: "Mastercard",
    mark: (
      <svg viewBox="0 0 38 24" className="h-5 w-auto" aria-hidden>
        <circle cx="14" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="24" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  { name: "American Express", mark: <span className="border border-current px-1 font-sans text-[10px] font-bold tracking-[0.08em]">AMEX</span> },
  { name: "Apple Pay", mark: <span className="font-sans text-[13px] font-medium">Apple Pay</span> },
  { name: "Google Pay", mark: <span className="font-sans text-[13px] font-medium">G Pay</span> },
  { name: "USDC", mark: <span className="font-sans text-[12px] font-semibold tracking-[0.1em]">USDC</span> },
]

export function PaymentStrip() {
  return (
    <div className="bg-[#F3EFE7] text-[var(--navy)]">
      <div className="mx-auto max-w-[1440px] border-y border-[#C6B849]/70 px-5 py-6 md:px-10">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase">
            <span className="text-[#C6B849]">—</span> Secure payment
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3" aria-label="Accepted payment methods">
            {PAYMENT_MARKS.map((item) => (
              <li
                key={item.name}
                title={item.name}
                className="flex h-9 min-w-16 items-center justify-center border border-[#C6B849]/60 bg-white/40 px-3 text-[var(--navy)]"
              >
                {item.mark}
                <span className="sr-only">{item.name}</span>
              </li>
            ))}
          </ul>
          <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--navy)]/70 uppercase">Card by Stripe · USDC on Solana</p>
        </div>
      </div>
    </div>
  )
}
