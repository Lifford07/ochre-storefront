"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { formatPrice } from "@/config/catalogue"
import { ADDED, checkoutHref, readBasket, useBasket, type BasketItem } from "@/lib/basket"
import { BasketView } from "@/components/basket/basket-view"

export function BasketButton({ className, icon }: { className: string; icon: React.ReactNode }) {
  const { count } = useBasket()
  const [open, setOpen] = useState(false)
  const [added, setAdded] = useState<BasketItem | null>(null)
  const [pulse, setPulse] = useState(false)
  const go = useRef<HTMLAnchorElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onAdded = (event: Event) => {
      const key = (event as CustomEvent<{ key: string }>).detail?.key
      const item = readBasket().find((entry) => entry.key === key)
      if (!item) return
      setAdded(item)
      setPulse(true)
      window.setTimeout(() => setPulse(false), 1200)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener(ADDED, onAdded)
    window.addEventListener("ochre-basket-open", onOpen)
    return () => {
      window.removeEventListener(ADDED, onAdded)
      window.removeEventListener("ochre-basket-open", onOpen)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    if (open) closeBtn.current?.focus({ preventScroll: true })
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    if (added) go.current?.focus({ preventScroll: true })
  }, [added])

  useEffect(() => {
    const esc = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      setAdded(null)
    }
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [])

  return (
    <>
      <button
        type="button"
        className={`relative ${className}`}
        aria-label={`Basket, ${count} ${count === 1 ? "piece" : "pieces"}`}
        onClick={() => {
          setAdded(null)
          setOpen(true)
        }}
        data-testid="basket-button"
      >
        {icon} <span className="hidden md:inline">Basket</span>
        {count > 0 ? (
          <span
            className={`absolute -top-1 left-3 grid min-w-[18px] place-items-center rounded-full bg-[#C6B849] px-1 text-[10px] leading-[18px] font-semibold tracking-normal text-[var(--navy)] ${pulse ? "motion-safe:animate-[ochre-pop_1.2s_ease-out]" : ""}`}
            data-testid="basket-count"
          >
            {count}
          </span>
        ) : null}
      </button>

      {added ? <AddedSheet item={added} count={count} goRef={go} onClose={() => setAdded(null)} /> : null}

      <div className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
        <div className={`absolute inset-0 bg-[#0b1332]/55 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Your basket"
          className={`absolute top-0 right-0 flex h-full w-full max-w-[460px] flex-col bg-[#F3EFE7] text-[var(--navy)] shadow-[-30px_0_60px_-30px_rgba(11,19,50,0.6)] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none ${open ? "translate-x-0" : "translate-x-full"}`}
          data-testid="basket-drawer"
        >
          <div className="flex items-center justify-between border-b border-[#C6B849]/60 px-6 pt-5 pb-4">
            <h2 className="font-display text-3xl">Your basket</h2>
            <button ref={closeBtn} type="button" onClick={() => setOpen(false)} className="min-h-11 min-w-11 text-2xl" aria-label="Close basket">
              ×
            </button>
          </div>
          <div className="min-h-0 flex-1">
            <BasketView compact onNavigate={() => setOpen(false)} />
          </div>
          {count > 0 ? (
            <Link href="/basket" onClick={() => setOpen(false)} className="flex min-h-12 items-center justify-center border-t border-[#C6B849]/40 text-[11px] tracking-[0.2em] uppercase">
              View full basket
            </Link>
          ) : null}
        </aside>
      </div>
    </>
  )
}

/** The moment after "Add to basket": one small sheet, and checkout is one tap away. */
function AddedSheet({
  item,
  count,
  goRef,
  onClose,
}: {
  item: BasketItem
  count: number
  goRef: React.RefObject<HTMLAnchorElement | null>
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[85] flex items-end justify-center md:items-start md:justify-end md:p-6" data-testid="added-sheet">
      <div className="absolute inset-0 bg-[#0b1332]/35" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label="Added to your basket"
        className="relative w-full border-t-2 border-[#C6B849] bg-[#F3EFE7] px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-[var(--navy)] shadow-[0_-20px_50px_-20px_rgba(11,19,50,0.5)] motion-safe:animate-[ochre-rise_.35s_cubic-bezier(.2,.8,.2,1)] md:max-w-[400px] md:border md:border-[#C6B849]/70"
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.24em] text-[#8A7E2B] uppercase">In your basket</p>
          <button type="button" onClick={onClose} className="-mr-2 min-h-11 min-w-11 text-xl" aria-label="Close">
            ×
          </button>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <div className="aspect-[4/5] w-16 shrink-0 overflow-hidden bg-[var(--navy)]">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display truncate text-xl italic">{item.title}</p>
            <p className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-[var(--navy)]/65 uppercase">
              {item.materialName} · {item.sizeName}
            </p>
            <p className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-[var(--navy)]/65 uppercase">
              Edition of {item.editionSize}
              {item.qty > 1 ? ` · × ${item.qty}` : ""}
            </p>
          </div>
          <p className="font-display text-lg whitespace-nowrap">{formatPrice(item.pricePence)}</p>
        </div>
        <Link ref={goRef} href={checkoutHref(item)} onClick={onClose} className="btn-foil mt-5 flex w-full justify-center" data-testid="added-checkout">
          Checkout · {formatPrice(item.pricePence)}
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <button type="button" onClick={onClose} className="min-h-11 text-[11px] tracking-[0.18em] uppercase underline underline-offset-4" data-testid="added-stay">
            Keep looking
          </button>
          <Link href="/basket" onClick={onClose} className="min-h-11 content-center text-[11px] tracking-[0.18em] uppercase underline underline-offset-4">
            View basket ({count})
          </Link>
        </div>
      </div>
    </div>
  )
}
