import type { Metadata } from "next"
import { CollectionGrid } from "@/components/collection/collection-grid"
import { Endband } from "@/components/brand/mark"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata: Metadata = {
  title: "The collection — OCHRÉ",
  description: "Numbered editions by SJ on real glass, acrylic glass and canvas.",
}

export default function CollectionPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-enter mx-auto max-w-[1440px] px-5 py-12 md:px-12 md:py-16">
        <p className="eyebrow">The collection</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-display text-4xl md:text-6xl">Works in numbered editions.</h1>
          <p className="max-w-sm text-sm leading-relaxed text-[var(--charcoal)]">
            Each work is printed to order in a fixed edition. The certificate will be issued for that edition.
          </p>
        </div>
        <div className="mt-10">
          <CollectionGrid />
        </div>
      </main>
      <Endband />
      <SiteFooter />
    </>
  )
}
