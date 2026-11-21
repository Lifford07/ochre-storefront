import type { Metadata } from "next"
import Link from "next/link"
import { HouseImage } from "@/components/brand/picture"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata: Metadata = {
  title: "Studio — OCHRÉ",
  description: "The Ochré studio is in Birmingham. A commission starts with an image or an idea.",
}

export default function StudioPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--porcelain)]">
        <article className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-10 md:py-20">
          <div>
            <p className="eyebrow">Studio</p>
            <h1 className="font-display mt-3 text-4xl text-[var(--navy)] md:text-6xl">House of Junaid · Birmingham</h1>
            <div className="mt-6 space-y-5 text-lg leading-relaxed">
              <p>The studio is in Birmingham. A commission starts with an image or an idea. OCHRÉ makes one physical object, numbered, with a certificate and a provenance passport.</p>
              <p>Glass, acrylic, and canvas are the materials on the bench. Gold leaf on glass is being learned, and it is not for sale.</p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/make" className="btn-navy">
                Commission a piece
              </Link>
              <Link href="/contact" className="btn-ghost">
                Write to the studio
              </Link>
            </div>
          </div>
          <figure>
            <HouseImage
              name="three-figures"
              alt="A finished canvas of three figures, hanging on a wall."
              width={640}
              height={576}
              widths={[640]}
              sizes="(max-width: 768px) 92vw, 520px"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-sm">A finished canvas.</figcaption>
          </figure>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
