import type { Metadata } from "next"
import Link from "next/link"
import { PrototypeGate } from "@/components/shell/prototype-gate"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata: Metadata = {
  title: "Atelier — OCHRÉ",
  description: "A prototype of the Ochré atelier. No garment is for sale.",
}

export default function AtelierPage() {
  return (
    <PrototypeGate name="Atelier">
      <SiteHeader />
      <main className="bg-[var(--porcelain)]">
        <article className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20">
          <p className="eyebrow">Garms</p>
          <h1 className="font-display mt-3 text-4xl text-[var(--navy)] md:text-6xl">The atelier is not open.</h1>
          <div className="mt-6 space-y-5 text-lg leading-relaxed">
            <p>The first piece, when it is made, is a headband. Terry cloth, the OCHRÉ wordmark stitched flat, no second script. It has not been cut. It has not been worn or washed. It is not for sale.</p>
            <p>A raglan hoodie is the second idea, and it is only an idea. No sample exists.</p>
            <p>The Cherub is not put on anything worn below the waist, and not on a floor piece. Sacred text is not put there either. The wordmark is the mark that can sit on cloth.</p>
          </div>
          <p className="mt-8">
            <Link href="/make" className="btn-navy">
              Commission a piece
            </Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </PrototypeGate>
  )
}
