import type { Metadata } from "next"
import Link from "next/link"
import { Whorl } from "@/components/brand/mark"
import { VerrePath } from "@/components/brand/verre-path"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { verre } from "@/config/verre"

export const metadata: Metadata = {
  title: "Verre églomisé — OCHRÉ",
  description: "Gold leaf on the back of glass. The signature craft of Ochré, being learned in the open.",
}

export default function VerrePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-enter">
        <section className="bg-[#131D47] text-[var(--porcelain)]">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 md:grid-cols-[5fr_7fr] md:px-12 md:py-24">
            <div className="relative mx-auto grid aspect-square w-40 place-items-center rounded-full border border-[var(--gold)] text-[var(--foil)] md:w-80">
              <span className="absolute inset-2 rounded-full border border-[var(--foil)]/35" aria-hidden />
              <Whorl className="size-2/3" />
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--foil)" }}>
                <span className="mb-3 block w-fit rounded-full border border-current px-2.5 py-1 text-[9px]">{verre.status}</span>
                The signature craft
              </p>
              <h1 className="font-display mt-4 text-5xl md:text-7xl">
                Verre <span className="italic text-[var(--foil)]">églomisé</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--porcelain)]/80">
                {verre.plain} {verre.lede}
              </p>
              <blockquote className="font-display mt-8 max-w-xl text-2xl leading-snug md:text-3xl">
                {verre.pitch[0]} <span className="block italic text-[var(--foil)]">{verre.pitch[1]}</span>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-2 md:gap-20 md:px-12 md:py-24">
          <div>
            <p className="eyebrow">How it is made</p>
            <p className="font-display mt-3 text-2xl leading-snug">{verre.how}</p>
            <p className="eyebrow mt-10">Where it is heading</p>
            <p className="font-display mt-3 text-2xl leading-snug">{verre.series}</p>
            <ul className="mt-8 border-t border-[var(--line)]">
              {verre.ahead.map((line) => (
                <li key={line} className="border-b border-[var(--line)] py-3">
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">The path</p>
            <div className="mt-3">
              <VerrePath />
            </div>
            <div className="mt-8 border border-[var(--line)] bg-[var(--bone)] p-5">
              <p className="eyebrow">{verre.status}</p>
              <p className="mt-2 leading-relaxed">{verre.truth}</p>
            </div>
            <Link href="/contact" className="btn-ghost mt-8 inline-flex">
              Ask about a commission
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
