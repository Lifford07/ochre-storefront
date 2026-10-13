import type { Metadata } from "next"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { BasketView } from "@/components/basket/basket-view"

export const metadata: Metadata = { title: "Basket — OCHRÉ" }

export default function BasketPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#F3EFE7] text-[var(--navy)]">
        <div className="mx-auto max-w-[1200px] px-5 py-14 md:px-10 md:py-20">
          <p className="font-mono text-[10px] tracking-[0.24em] text-[#9a8c2e] uppercase">Ochré · Basket</p>
          <h1 className="font-display mt-2 text-5xl md:text-6xl">Your selection</h1>
          <div className="mt-4 mb-10 h-px w-24 bg-[#C6B849]" />
          <BasketView />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
