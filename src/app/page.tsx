import Link from "next/link"
import { HeroRoom } from "@/components/art/hero-room"
import { WorkImage } from "@/components/art/motif"
import { Crest, Endband } from "@/components/brand/mark"
import { WallCaption } from "@/components/gallery/wall-label"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { works, isExampleWork } from "@/config/works"
import { wallFacts } from "@/lib/caption"

const lines = [
  { index: "01", name: "Art", note: "Bespoke artwork, made from real glass, acrylic glass and canvas.", href: "/collection", live: true },
  { index: "02", name: "Home", note: "The most aesthetically pleasing home decor.", href: "/collection", live: false },
  { index: "03", name: "Ochré Atelier", note: "Cut and embroidered pieces, in small runs.", href: "/collection", live: false },
  { index: "04", name: "Jewellery", note: "Personalisation at its finest.", href: "/collection", live: false },
]

export default function HomePage() {
  const featured = works.filter((work) => work.artistSlug === "sj").slice(0, 4)
  const opening = featured[0]

  return (
    <>
      <SiteHeader />
      <main className="page-enter">
        <section className="bg-[var(--navy)] text-[var(--porcelain)]">
          <div className="mx-auto grid max-w-[1440px] items-start gap-12 px-5 py-14 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-16 md:px-12 md:py-20">
            {opening ? (
              <figure className="order-1 md:order-2">
                <Link href={`/collection/${opening.slug}`} className="plate-frame block">
                  <WorkImage motif={opening.motif} image={opening.image} title={opening.title} className="aspect-[4/5] max-h-[70vh] w-full object-cover" />
                </Link>
                <figcaption className="mt-6 max-w-md">
                  <p className="font-display text-3xl italic text-[var(--porcelain)]">{opening.title}</p>
                  <WallCaption facts={wallFacts(opening)} tone="dark" className="mt-4" />
                  <Link href={`/collection/${opening.slug}`} className="gallery-text-link mt-5 inline-flex min-h-11 items-center text-sm text-[var(--foil)] underline underline-offset-4">
                    View the work
                  </Link>
                </figcaption>
              </figure>
            ) : null}
            <div className="order-2 md:order-1 md:pt-6">
              <Crest className="size-14 text-[var(--gold)]" />
              <p className="eyebrow mt-8 text-[var(--gold)]">Made to order · numbered</p>
              <h1 className="font-display mt-5 max-w-xl text-5xl text-[var(--porcelain)] md:text-7xl">
                Your image, made into an <span className="italic text-[var(--foil)]">object.</span>
              </h1>
              <div className="gallery-rule on-dark mt-6 w-24" />
              <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--porcelain)]/80">
                Bespoke artwork on real glass, acrylic glass and canvas. Each piece is numbered. A certificate is issued with it.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/make" className="btn-gallery">
                  Begin with your image
                </Link>
                <Link href="/collection" className="btn-gallery">
                  View the collection
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Endband />

        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-12 md:py-32">
          <p className="eyebrow">The house of Ochré</p>
          <h2 className="font-display mt-4 max-w-3xl text-4xl md:text-6xl">
            One house. <span className="italic">Four lines.</span>
          </h2>
          <ol className="mt-16 border-t border-[var(--line)]">
            {lines.map((line) => (
              <li key={line.name} className="border-b border-[var(--line)]">
                <Link href={line.href} className="grid gap-3 py-8 md:grid-cols-[4.5rem_minmax(0,14rem)_1fr_auto] md:items-baseline md:gap-8 md:py-10">
                  <span className="font-mono text-[11px] tracking-[0.16em] text-[var(--gold-ink)]">{line.index}</span>
                  <span className="font-display text-4xl">{line.name}</span>
                  <span className="max-w-md text-sm leading-relaxed text-[var(--charcoal)]">{line.note}</span>
                  <span className="eyebrow">{line.live ? "Enter" : "Soon"}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-[var(--paper)]">
          <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-12 md:py-32">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Featured artist · SJ</p>
                <h2 className="font-display mt-4 text-4xl md:text-6xl">In the gallery.</h2>
              </div>
              <Link href="/collection" className="gallery-text-link lnk min-h-11">
                View the collection
              </Link>
            </div>
            <ul className="mt-16 grid gap-x-10 gap-y-16 sm:grid-cols-2">
              {featured.map((work) => (
                <li key={work.slug}>
                  <Link href={`/collection/${work.slug}`} className="block">
                    <div className="plate-frame aspect-[4/5]">
                      <WorkImage motif={work.motif} image={work.image} title={work.title} />
                    </div>
                    <h3 className="font-display mt-6 text-3xl italic">{work.title}</h3>
                    <p className="mt-2 text-sm text-[var(--mute)]">
                      {work.artist} {isExampleWork(work) ? <span className="ex">Example</span> : null}
                    </p>
                    <WallCaption facts={wallFacts(work)} className="mt-4" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-[var(--navy)] text-[var(--porcelain)]">
          <div className="mx-auto grid max-w-[1440px] items-center gap-16 px-5 py-24 md:grid-cols-[1.1fr_0.9fr] md:px-12 md:py-32">
            <div>
              <p className="eyebrow text-[var(--gold)]">Provenance</p>
              <h2 className="font-display mt-4 text-4xl md:text-6xl">
                A <span className="italic text-[var(--foil)]">certificate of authenticity</span> is issued for every physical piece we create.
              </h2>
              <p className="mt-6 max-w-md text-[var(--porcelain)]/75">
                Each work will also come with its own NFT (coming soon), a digital twin that proves you own the original.
              </p>
              <dl className="mt-12 grid gap-8 sm:grid-cols-3">
                <div>
                  <dt className="text-[var(--gold)]">Ordered</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-[var(--porcelain)]/70">Pay in fiat or crypto.</dd>
                </div>
                <div>
                  <dt className="text-[var(--gold)]">Numbered</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-[var(--porcelain)]/70">Edition 1 of 1, or No. X of N.</dd>
                </div>
                <div>
                  <dt className="text-[var(--gold)]">Certified</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-[var(--porcelain)]/70">A certificate of authenticity comes with every piece.</dd>
                </div>
              </dl>
            </div>
            <div className="grid items-center gap-10 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)]">
              <HeroRoom className="aspect-[640/460] h-auto w-full bg-[#e7e1d6]" />
              <figure className="mx-auto w-full max-w-[280px]">
                <Link href="/orders/preview" className="certificate-rest group block rotate-[-1.5deg] bg-[#1a1a1a] p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75)] transition-transform duration-700 ease-out hover:rotate-0 md:p-3">
                  <div className="bg-[#F3EFE7] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/certificate-of-authenticity.webp"
                      alt="Ochré certificate of authenticity"
                      width={990}
                      height={1400}
                      loading="lazy"
                      className="block h-auto w-full"
                    />
                  </div>
                </Link>
                <figcaption className="mt-6 text-center">
                  <Link href="/orders/preview" className="gallery-text-link text-sm text-[var(--foil)] underline underline-offset-4">
                    View a sample certificate
                  </Link>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-24 md:px-12 md:py-32">
          <p className="eyebrow">How it is made</p>
          <h2 className="font-display mt-4 text-4xl md:text-6xl">Four quiet steps.</h2>
          <ol className="mt-16 grid gap-12 md:grid-cols-4 md:gap-10">
            {[
              ["i.", "Begin", "Upload a photograph from this computer."],
              ["ii.", "Refine", "Crop, colour and the size of the print."],
              ["iii.", "Choose", "Real glass, acrylic glass or canvas."],
              ["iv.", "Ready", "Pay by card or USDC. We check the file, then make and number the piece."],
            ].map(([index, title, copy]) => (
              <li key={index} className="border-t border-[var(--line)] pt-6">
                <p className="font-display text-3xl italic text-[var(--gold-ink)]">{index}</p>
                <h3 className="font-display mt-4 text-3xl">{title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--charcoal)]">{copy}</p>
              </li>
            ))}
          </ol>
          <div className="mt-16">
            <Link href="/make" className="btn-gallery on-light">
              Begin with your image
            </Link>
          </div>
        </section>
        <Endband />
      </main>
      <SiteFooter />
    </>
  )
}
