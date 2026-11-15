"use client"

import Link from "next/link"
import { type ReactNode } from "react"
import { Wordmark } from "@/components/brand/mark"
import { HouseFooter, HouseHeader } from "@/components/house/chrome"

export function SiteHeader() {
  return <HouseHeader />
}

export function SiteFooter() {
  return <HouseFooter />
}

/** Checkout for a basket of house works: no upload steps, just the way back and the mark. */
export function CheckoutHeader() {
  return (
    <header className="bg-[var(--navy)] text-[var(--porcelain)]">
      <div className="mx-auto grid h-16 max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-4 md:h-20 md:px-8">
        <Link href="/basket" className="eyebrow inline-flex min-h-11 items-center justify-self-start !text-[10px] !text-[var(--porcelain)] md:!text-[11px]">
          ← Basket
        </Link>
        <Link href="/" aria-label="Ochré home">
          <Wordmark />
        </Link>
        <p className="eyebrow justify-self-end !text-[10px] !text-[var(--foil)] md:!text-[11px]">Checkout</p>
      </div>
    </header>
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
          <button type="button" onClick={onBack} className="eyebrow !text-[11px] text-[var(--porcelain)] md:!text-xs">
            ← {step === "upload" ? "Continue browsing" : "Back"}
          </button>
        ) : (
          <Link href="/" className="eyebrow !text-[11px] !text-[var(--gold)] md:!text-xs">
            ← Continue browsing
          </Link>
        )}
        <Link href="/" aria-label="Ochré home">
          <Wordmark />
        </Link>
        <p className="eyebrow !text-[11px] !text-[var(--gold)] md:!text-xs">Card · USDC</p>
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
                  current ? "text-[var(--foil)] underline decoration-[var(--gold)] underline-offset-4" : done ? "text-[var(--porcelain)]" : "text-[var(--porcelain)]/75"
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
            <span className="text-[var(--gold-ink)]">—</span> Secure payment
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
