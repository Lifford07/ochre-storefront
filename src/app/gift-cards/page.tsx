import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata: Metadata = { title: "Gift cards — OCHRÉ" }

export default function GiftCardsPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--navy)] text-[#F3EFE7]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-10">
          <div>
            <p className="font-mono text-[10px] tracking-[0.24em] text-[#C6B849] uppercase">Ochré · Gift cards</p>
            <h1 className="font-display mt-3 text-5xl md:text-6xl">Give a wall something to say.</h1>
            <div className="mt-5 h-px w-20 bg-[#C6B849]" />
            <p className="mt-6 max-w-md text-[#F3EFE7]/80">An Ochré gift card lets someone choose their own piece, on real glass, acrylic glass or canvas, numbered and certified.</p>
            <p className="mt-6 inline-block border border-[#C6B849] px-4 py-2 font-mono text-[11px] tracking-[0.22em] text-[#C6B849] uppercase" data-testid="gift-coming-soon">Coming soon</p>
            <p className="mt-6 text-sm text-[#F3EFE7]/60">
              Join <Link href="/#ochre-letter-email" className="text-[#C6B849] underline underline-offset-4">The Ochré Letter</Link> to hear when they launch.
            </p>
          </div>
          <div className="relative mx-auto aspect-[1.6] w-full max-w-md rounded-[14px] border border-[#C6B849]/70 bg-[linear-gradient(135deg,#0f1a3a,#1d2a4a_60%,#0b1430)] p-7 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
            <p className="font-display text-3xl tracking-[0.2em] text-[#C6B849]">OCHRÉ</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.24em] text-[#F3EFE7]/60 uppercase">Gift card</p>
            <div className="absolute inset-x-7 bottom-7 flex items-end justify-between">
              <span className="font-display text-xl italic text-[#F3EFE7]/90">For the walls you love</span>
              <span className="h-px w-16 bg-[#C6B849]" />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
