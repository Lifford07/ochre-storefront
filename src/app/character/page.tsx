import type { Metadata } from "next"
import Link from "next/link"
import { PrototypeGate } from "@/components/shell/prototype-gate"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata: Metadata = {
  title: "Character — OCHRÉ",
  description: "A prototype page for the Ochré figure. It is not drawn, and it is not for sale.",
}

export default function CharacterPage() {
  return (
    <PrototypeGate name="Character">
      <SiteHeader />
      <main className="bg-[var(--porcelain)]">
        <article className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20">
          <p className="eyebrow">The figure</p>
          <h1 className="font-display mt-3 text-4xl text-[var(--navy)] md:text-6xl">The figure is not drawn yet.</h1>
          <div className="mt-6 space-y-5 text-lg leading-relaxed">
            <p>One face, the same proportions every time. Only the clothes change, and the clothes are real Ochré pieces. Until the drawing exists, there is no figure to sell, print, or stitch.</p>
            <p>This page is the place it will live. It is empty on purpose.</p>
          </div>
          <div className="mt-10 grid aspect-[4/5] max-w-sm place-items-center border border-[var(--line)] bg-[var(--bone)]/50 px-6 text-center">
            <p className="font-display text-2xl italic text-[var(--navy)]">No drawing.</p>
          </div>
          <p className="mt-8">
            <Link href="/collection" className="lnk">
              Back to the shop
            </Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </PrototypeGate>
  )
}
