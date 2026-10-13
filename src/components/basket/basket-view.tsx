"use client"

import Link from "next/link"
import { formatPrice } from "@/config/catalogue"
import { removeItem, setQty, useBasket, type BasketItem } from "@/lib/basket"
import { DeliveryNote } from "@/components/checkout/delivery-note"

const MARKS = ["VISA", "Mastercard", "AMEX", "Apple Pay", "G Pay", "USDC"]

function checkoutHref(item: BasketItem) {
  return `/collect/${item.slug}?material=${item.materialId}&size=${item.sizeId}`
}

export function BasketView({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { items, count, subtotal } = useBasket()

  if (items.length === 0) {
    return (
      <div className={`flex flex-col items-center text-center ${compact ? "px-6 py-16" : "py-24"}`} data-testid="basket-empty">
        <svg viewBox="0 0 48 48" className="size-14 text-[#C6B849]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="8" y="6" width="32" height="36" />
          <rect x="13" y="11" width="22" height="26" />
          <path d="M18 31l5-7 4 5 3-3 5 5" />
        </svg>
        <p className="mt-6 font-mono text-[10px] tracking-[0.24em] text-[#C6B849] uppercase">Your basket</p>
        <h2 className="font-display mt-2 text-4xl italic">The walls are waiting.</h2>
        <p className="mt-3 max-w-sm text-sm text-[var(--navy)]/65">Nothing has been chosen yet. Every piece is made to order, numbered and certified.</p>
        <div className="mt-6 h-px w-16 bg-[#C6B849]" />
        <Link href="/collection" onClick={onNavigate} className="btn-foil mt-8 inline-flex px-10">
          Explore the collection
        </Link>
      </div>
    )
  }

  const first = items[0]
  return (
    <div className={compact ? "flex h-full flex-col" : "grid gap-12 lg:grid-cols-[1.4fr_1fr]"}>
      <ul className={`border-t border-[#C6B849]/60 ${compact ? "flex-1 overflow-y-auto px-6" : ""}`} data-testid="basket-items">
        {items.map((item) => (
          <li key={item.key} className="flex gap-5 border-b border-[#C6B849]/40 py-6">
            <div className={`${compact ? "w-24" : "w-32"} aspect-[4/5] shrink-0 overflow-hidden bg-[var(--navy)] shadow-[0_10px_30px_-12px_rgba(11,19,50,0.45)]`}>
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`font-display italic leading-tight ${compact ? "text-xl" : "text-2xl"}`}>{item.title}</p>
                  <p className="mt-1 text-xs tracking-[0.16em] text-[var(--navy)]/60 uppercase">{item.artist}</p>
                </div>
                <p className="font-display text-lg whitespace-nowrap">{formatPrice(item.pricePence * item.qty)}</p>
              </div>
              <p className="mt-2 text-sm text-[var(--navy)]/75">
                {item.materialName} · {item.sizeName}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-[#9a8c2e] uppercase">
                No. {item.editionNumber}
                {item.qty > 1 ? `–${Math.min(item.editionSize, item.editionNumber + item.qty - 1)}` : ""} of {item.editionSize}
              </p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex items-center border border-[var(--navy)]/20">
                  <button type="button" aria-label="Fewer" className="size-8" onClick={() => setQty(item.key, item.qty - 1)}>−</button>
                  <span className="w-8 text-center text-sm" data-testid="basket-qty">{item.qty}</span>
                  <button type="button" aria-label="More" className="size-8" onClick={() => setQty(item.key, item.qty + 1)}>+</button>
                </div>
                <button type="button" className="text-[11px] tracking-[0.16em] text-[var(--navy)]/60 uppercase underline-offset-4 hover:underline" onClick={() => removeItem(item.key)}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className={compact ? "border-t border-[#C6B849]/60 bg-[#F3EFE7] px-6 py-5" : "self-start border border-[#C6B849]/60 bg-white/40 p-7"}>
        {compact ? null : <p className="font-mono text-[10px] tracking-[0.24em] text-[#9a8c2e] uppercase">Summary</p>}
        <div className="flex items-baseline justify-between">
          <span className="text-sm tracking-[0.12em] uppercase">Subtotal · {count} {count === 1 ? "piece" : "pieces"}</span>
          <span className="font-display text-3xl" data-testid="basket-subtotal">{formatPrice(subtotal)}</span>
        </div>
        <p className="mt-1 text-xs text-[var(--navy)]/60">VAT and delivery included. Members of The Ochré Letter can use their code at card checkout.</p>
        <DeliveryNote materialId={first.materialId} className="mt-4" />
        <div className="mt-4 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/certificate-of-authenticity.webp" alt="" className="h-14 w-11 border border-[#C6B849]/60 object-cover" />
          <p className="text-sm">
            <span className="text-[#9a8c2e]">Certificate of authenticity included</span>
            <br />
            <span className="text-xs text-[var(--navy)]/60">Signed and numbered, issued with every piece.</span>
          </p>
        </div>
        <Link href={checkoutHref(first)} onClick={onNavigate} className="btn-foil mt-5 flex w-full justify-center" data-testid="basket-checkout">
          Proceed to checkout
        </Link>
        {items.length > 1 ? (
          <p className="mt-2 text-xs text-[var(--navy)]/60">Pieces check out one at a time, starting with {first.title}. The rest stay in your basket.</p>
        ) : null}
        <ul className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Accepted payment methods">
          {MARKS.map((mark) => (
            <li key={mark} className="border border-[#C6B849]/50 px-2 py-1 font-sans text-[10px] font-semibold tracking-[0.08em] text-[var(--navy)]">
              {mark}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center font-mono text-[9px] tracking-[0.2em] text-[var(--navy)]/55 uppercase">Secure payment · card by Stripe · USDC on Solana</p>
      </aside>
    </div>
  )
}
