import type { Metadata } from "next"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { BasketView } from "@/components/basket/basket-view"

export const metadata: Metadata = { title: "Basket — OCHRÉ" }

export default function BasketPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#F3EFE7] text-[var(--navy)]">
        <div className="mx-auto max-w-[1200px] px-5 pt-10 pb-32 md:px-10 md:py-20">
          <h1 className="font-display mb-8 text-5xl md:mb-10 md:text-6xl">
            Your <span className="italic">basket</span>
          </h1>
          <BasketView />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
