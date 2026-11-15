"use client"

import Link from "next/link"
import { formatPrice } from "@/config/catalogue"
import { checkoutHref, removeItem, setQty, useBasket } from "@/lib/basket"
import { DeliveryNote } from "@/components/checkout/delivery-note"

const MARKS = ["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay", "USDC"]

export function BasketView({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { items, count, subtotal } = useBasket()

  if (items.length === 0) {
    return (
      <div className={compact ? "px-6 py-14" : "max-w-lg py-10"} data-testid="basket-empty">
        <h2 className="font-display text-4xl md:text-5xl">
          Nothing <span className="italic">yet</span>
        </h2>
        <p className="mt-3 text-[var(--navy)]/70">Pieces you choose are kept here while you look around. Every one is made to order and comes with a certificate.</p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/collection" onClick={onNavigate} className="btn-foil inline-flex">
            See the collection
          </Link>
          <Link href="/make" onClick={onNavigate} className="lnk min-h-11 content-center text-sm">
            Or start with your photo
          </Link>
        </div>
      </div>
    )
  }

  const first = items[0]
  const one = items.length === 1 && first.qty === 1
  const goLabel = `Checkout · ${formatPrice(first.pricePence)}`

  return (
    <div className={compact ? "flex h-full flex-col" : "grid items-start gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14"}>
      <ul className={`border-t border-[#C6B849]/60 ${compact ? "min-h-0 flex-1 overflow-y-auto px-6" : ""}`} data-testid="basket-items">
        {items.map((item) => (
          <li key={item.key} className="flex gap-4 border-b border-[#C6B849]/40 py-5 md:gap-5">
            <div className={`${compact ? "w-20" : "w-24 md:w-32"} aspect-[4/5] shrink-0 overflow-hidden bg-[var(--navy)]`}>
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`font-display italic leading-tight ${compact ? "text-xl" : "text-2xl"}`}>{item.title}</p>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-[var(--navy)]/65 uppercase">
                    {item.materialName} · {item.sizeName}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-[#8A7E2B] uppercase">Edition of {item.editionSize}</p>
                </div>
                <p className="font-display text-lg whitespace-nowrap">{formatPrice(item.pricePence * item.qty)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="inline-flex items-center border border-[var(--navy)]/25">
                  <button type="button" aria-label={`One fewer ${item.title}`} className="size-11 disabled:opacity-30" disabled={item.qty <= 1} onClick={() => setQty(item.key, item.qty - 1)}>
                    −
                  </button>
                  <span className="w-8 text-center text-sm" data-testid="basket-qty" aria-live="polite">
                    {item.qty}
                  </span>
                  <button type="button" aria-label={`One more ${item.title}`} className="size-11" onClick={() => setQty(item.key, item.qty + 1)}>
                    +
                  </button>
                </div>
                <button type="button" className="min-h-11 text-[11px] tracking-[0.16em] text-[var(--navy)]/65 uppercase underline-offset-4 hover:underline" onClick={() => removeItem(item.key)}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className={compact ? "border-t border-[#C6B849]/60 bg-[#F3EFE7] px-6 py-5" : "border border-[#C6B849]/60 bg-[var(--paper)] p-6 md:p-7 lg:sticky lg:top-24"}>
        {compact ? null : <p className="font-mono text-[10px] tracking-[0.24em] text-[#8A7E2B] uppercase">Summary</p>}
        <dl className={`space-y-2 text-sm ${compact ? "" : "mt-4"}`}>
          <div className="flex justify-between">
            <dt>
              {count} {count === 1 ? "piece" : "pieces"}
            </dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>Included</dd>
          </div>
          <div className="flex justify-between">
            <dt>Certificate of authenticity</dt>
            <dd>Included</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-[var(--navy)] pt-3">
            <dt className="text-base">Total</dt>
            <dd className="font-display text-3xl" data-testid="basket-subtotal">
              {formatPrice(subtotal)}
            </dd>
          </div>
        </dl>
        <p className="mt-1 text-xs text-[var(--navy)]/65">VAT and delivery included. Members of The Ochré Letter can use their code at card checkout.</p>
        {compact ? null : <DeliveryNote materialId={first.materialId} className="mt-4" />}
        <Link href={checkoutHref(first)} onClick={onNavigate} className="btn-foil mt-5 flex w-full justify-center text-center" data-testid="basket-checkout">
          {goLabel}
        </Link>
        {one ? null : (
          <p className="mt-2 text-xs text-[var(--navy)]/65" data-testid="basket-one-at-a-time">
            For now pieces check out one at a time. This pays for one {first.title}; the rest stay here.
          </p>
        )}
        {compact ? null : (
          <>
            <ul className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] tracking-[0.12em] text-[var(--navy)]/60 uppercase" aria-label="Accepted payment methods">
              {MARKS.map((mark) => (
                <li key={mark}>{mark}</li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-[9px] tracking-[0.18em] text-[var(--navy)]/55 uppercase">Card by Stripe · USDC on Solana</p>
          </>
        )}
      </aside>

      {compact ? null : (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#C6B849]/60 bg-[#F3EFE7] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden" data-testid="basket-bar">
          <Link href={checkoutHref(first)} className="btn-foil flex w-full justify-center text-center">
            {goLabel}
          </Link>
        </div>
      )}
    </div>
  )
}
