"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useBasket } from "@/lib/basket"
import { BasketView } from "@/components/basket/basket-view"

export function BasketButton({ className, icon }: { className: string; icon: React.ReactNode }) {
  const { count } = useBasket()
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    const show = () => {
      setOpen(true)
      setPulse(true)
      window.setTimeout(() => setPulse(false), 1200)
    }
    window.addEventListener("ochre-basket-open", show)
    return () => window.removeEventListener("ochre-basket-open", show)
  }, [])
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    const esc = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [open])

  return (
    <>
      <button type="button" className={`relative ${className}`} aria-label={`Basket, ${count} items`} onClick={() => setOpen(true)} data-testid="basket-button">
        {icon} <span className="hidden md:inline">Basket</span>
        {count > 0 ? (
          <span
            className={`absolute -top-1 left-3 grid min-w-[18px] place-items-center rounded-full bg-[#C6B849] px-1 text-[10px] leading-[18px] font-semibold tracking-normal text-[var(--navy)] ${pulse ? "animate-[ochre-pop_1.2s_ease-out]" : ""}`}
            data-testid="basket-count"
          >
            {count}
          </span>
        ) : null}
      </button>
      <div className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-[#0b1332]/50 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <aside
          role="dialog"
          aria-label="Your basket"
          className={`absolute top-0 right-0 flex h-full w-full max-w-[460px] flex-col bg-[#F3EFE7] text-[var(--navy)] shadow-[-30px_0_60px_-30px_rgba(11,19,50,0.6)] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
          data-testid="basket-drawer"
        >
          <div className="h-1 bg-gradient-to-r from-[#a89a35] via-[#e6dc8c] to-[#a89a35]" />
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.24em] text-[#9a8c2e] uppercase">Ochré</p>
              <h2 className="font-display text-3xl">Your basket</h2>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="min-h-11 min-w-11 text-2xl" aria-label="Close basket">×</button>
          </div>
          <div className="min-h-0 flex-1">
            <BasketView compact onNavigate={() => setOpen(false)} />
          </div>
          <Link href="/basket" onClick={() => setOpen(false)} className="border-t border-[#C6B849]/40 py-3 text-center text-[11px] tracking-[0.2em] uppercase">
            View full basket
          </Link>
        </aside>
      </div>
    </>
  )
}
