import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Endband } from "@/components/brand/mark"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { GALLERY_PIECES, kindLabel, type GalleryKind } from "@/lib/jewellery/pieces"

export const metadata: Metadata = {
  title: "Jewellery — OCHRÉ",
  description: "Personalisation at its finest. Design a crest, commission a piece, inspect gold leaf under the lens.",
}

const SECTIONS: GalleryKind[] = ["jewellery", "eglomise", "artwork"]

export default function JewelleryPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-enter jewellery-museum">
        <section className="museum-shell border-b border-[color:var(--gallery-line)]">
          <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-12 md:py-20">
            <p className="eyebrow !text-[color:var(--gallery-ochre)]">Jewellery</p>
            <h1 className="font-display mt-3 max-w-3xl text-4xl text-[color:var(--gallery-ink)] md:text-6xl">
              Personalisation at its <span className="italic text-[color:var(--foil)]">finest.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-[color:var(--gallery-muted)] md:text-base">
              Compose a crest for a signet or print, send a commission brief, or open a piece and zoom into
              Ochré gold leaf — progressive high-res as you go deeper.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/jewellery/design" className="btn-foil">
                Design your crest
              </Link>
              <Link href="/jewellery/commission" className="btn-ghost on-dark">
                Commission brief
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] space-y-14 px-5 py-14 md:px-12 md:py-16">
          {SECTIONS.map((kind) => {
            const pieces = GALLERY_PIECES.filter((p) => p.kind === kind)
            if (!pieces.length) return null
            return (
              <section key={kind}>
                <h2 className="font-display text-3xl text-[color:var(--gallery-ink)]">{kindLabel(kind)}</h2>
                <p className="mt-2 max-w-md text-sm text-[color:var(--gallery-muted)]">
                  {kind === "jewellery"
                    ? "Signet faces and personalised marks — open to inspect under the lens."
                    : kind === "eglomise"
                      ? "Reverse-glass gilt panels that sit beside jewellery commissions."
                      : "Gold-leaf studies from the house gallery."}
                </p>
                <ul className="mt-8 space-y-4">
                  {pieces.map((piece) => (
                    <li key={`${piece.kind}-${piece.slug}`}>
                      <Link
                        href={`/jewellery/pieces/${piece.kind}/${piece.slug}`}
                        className="art-card flex flex-col gap-4 border border-[color:var(--gallery-line)] bg-[color:var(--gallery-panel)] p-4 sm:flex-row sm:items-center"
                      >
                        <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-[var(--navy)] sm:w-36">
                          <Image
                            src={piece.thumb}
                            alt={piece.alt}
                            fill
                            sizes="(max-width: 640px) 100vw, 144px"
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="font-display text-2xl text-[color:var(--gallery-ink)]">{piece.title}</h3>
                            <p className="font-mono text-[10px] tracking-[0.16em] text-[color:var(--gallery-ochre)] uppercase">
                              {piece.priceLabel}
                            </p>
                          </div>
                          <p className="mt-2 text-sm text-[color:var(--gallery-muted)]">{piece.blurb}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
        <Endband />
      </main>
      <SiteFooter />
    </>
  )
}
