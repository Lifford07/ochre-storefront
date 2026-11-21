import type { Metadata } from "next"
import Link from "next/link"
import { PrototypeGate } from "@/components/shell/prototype-gate"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata: Metadata = {
  title: "Salon Nº 01 — OCHRÉ",
  description: "A prototype of Salon Nº 01, Vitrine. Nothing in the salon is for sale.",
}

const parts = [
  ["01", "Artwork", "A verre églomisé panel. The craft is still being learned, so this object does not exist yet."],
  ["02", "Garment", "A navy headband with the OCHRÉ wordmark. No sample has been cut, worn, or washed."],
  ["03", "Object", "A pouch for the passport card. No material has been ordered."],
  ["04", "Character", "One outfit on the house figure. The figure is not drawn."],
  ["05", "Palette", "Midnight, porcelain, and gold. Named here only. No edition size, no price, no day."],
]

export default function SalonPage() {
  return (
    <PrototypeGate name="Salon Nº 01">
      <SiteHeader />
      <main className="bg-[var(--porcelain)]">
        <article className="mx-auto max-w-[760px] px-5 py-14 md:px-8 md:py-20">
          <p className="eyebrow">Salon drop</p>
          <h1 className="font-display mt-3 text-4xl text-[var(--navy)] md:text-6xl">
            Salon Nº 01 <em className="text-[var(--antique)]">Vitrine</em>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed">
            One theme. Five objects. One named day. Everything would be made to order inside the window. The day is not named. Nothing on this page is for sale.
          </p>
          <ol className="mt-10 border-t border-[var(--line)]">
            {parts.map(([index, title, copy]) => (
              <li key={index} className="grid gap-2 border-b border-[var(--line)] py-5 sm:grid-cols-[4rem_1fr]">
                <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--gold-ink)]">{index}</span>
                <span>
                  <span className="font-display block text-3xl">{title}</span>
                  <span className="mt-2 block text-sm leading-relaxed">{copy}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm">
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
