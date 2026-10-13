import Link from "next/link"
import { HeroRoom } from "@/components/art/hero-room"
import { WorkImage } from "@/components/art/motif"
import { Crest, Endband } from "@/components/brand/mark"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { works } from "@/config/works"

const lines = [
  { index: "01", name: "Art", note: "Prints, glass and objects, made in a numbered edition.", href: "/collection", live: true },
  { index: "02", name: "Home", note: "Furniture, table and objects for the room.", href: "/collection", live: false },
  { index: "03", name: "Garms", note: "Cut and embroidered pieces, in small runs.", href: "/collection", live: false },
  { index: "04", name: "Jewellery", note: "Gold, seal and engraved. Numbered.", href: "/collection", live: false },
]

export default function HomePage() {
  const featured = works.slice(0, 4)

  return (
    <>
      <SiteHeader />
      <main className="page-enter">
        <section className="bg-[var(--navy)] text-[var(--porcelain)]">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-12 md:py-20">
            <div>
              <Crest className="size-16 text-[var(--gold)]" />
              <p className="eyebrow mt-6 text-[var(--gold)]">Made to order · numbered</p>
              <h1 className="font-display mt-4 text-5xl text-[var(--porcelain)] md:text-7xl">
                Your image, made into an <span className="italic text-[var(--foil)]">object.</span>
              </h1>
              <div className="hairline mt-5" />
              <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--porcelain)]/80">
                Printed on glass, acrylic, Gallery Bond or porcelain. Each piece is numbered. A certificate is issued with it.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/make" className="btn-foil">
                  Begin with your image
                </Link>
                <Link href="/collection" className="btn-ghost on-dark">
                  View the collection
                </Link>
              </div>
            </div>
            <HeroRoom className="aspect-[640/460] h-auto w-full bg-[#e7e1d6] shadow-[var(--shadow-art)]" />
          </div>
        </section>
        <Endband />

        <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-12 md:py-28">
          <p className="eyebrow">The house of Ochré</p>
          <h2 className="font-display mt-3 text-4xl md:text-6xl">
            One house. <span className="italic">Four lines.</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {lines.map((line) => (
              <Link key={line.name} href={line.href} className="art-card border border-[var(--line)] bg-[var(--paper)] p-5">
                <p className="font-mono text-[11px] text-[var(--gold-ink)]">{line.index}</p>
                <h3 className="font-display mt-6 text-3xl">{line.name}</h3>
                <p className="mt-3 min-h-16 text-sm leading-relaxed text-[var(--charcoal)]">{line.note}</p>
                <p className="mt-6 eyebrow">{line.live ? "Enter" : "Soon"}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[var(--paper)]">
          <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Featured artists · from Superteam</p>
                <h2 className="font-display mt-3 text-4xl md:text-5xl">New editions, quietly released.</h2>
              </div>
              <Link href="/collection" className="lnk">
                View the collection
              </Link>
            </div>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((work) => (
                <li key={work.slug}>
                  <Link href={`/collection/${work.slug}`} className="art-card block">
                    <div className="aspect-[4/5] bg-[var(--bone)] shadow-[var(--shadow-art)]">
                      <WorkImage motif={work.motif} image={work.image} title={work.title} />
                    </div>
                    <h3 className="font-display mt-4 text-2xl italic">{work.title}</h3>
                    <p className="mt-1 text-sm text-[var(--mute)]">
                      {work.artist} <span className="ex">Example</span>
                    </p>
                    <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-[var(--gold-ink)] uppercase">
                      Edition of {work.editionSize}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-[var(--navy)] text-[var(--porcelain)]">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-20 md:grid-cols-2 md:px-12">
            <div>
              <p className="eyebrow text-[var(--gold)]">Provenance</p>
              <h2 className="font-display mt-3 text-4xl md:text-6xl">
                Every piece is numbered. <span className="italic text-[var(--foil)]">A certificate is issued with it.</span>
              </h2>
              <p className="mt-5 max-w-md text-[var(--porcelain)]/75">
                When you pay, the edition is recorded against that transfer. The certificate will be issued. It is not minted on-chain yet.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-[var(--gold)]">Ordered</dt>
                  <dd className="mt-1 text-[var(--porcelain)]/70">Made after you pay</dd>
                </div>
                <div>
                  <dt className="text-[var(--gold)]">Numbered</dt>
                  <dd className="mt-1 text-[var(--porcelain)]/70">Edition 1/1, or No. of N</dd>
                </div>
                <div>
                  <dt className="text-[var(--gold)]">Certified</dt>
                  <dd className="mt-1 text-[var(--porcelain)]/70">Issued with the piece</dd>
                </div>
              </dl>
            </div>
            <Link href="/orders/preview" className="mx-auto block w-full max-w-sm bg-[url('/endpaper.svg')] bg-[length:96px_72px] p-3">
              <div className="bg-[var(--paper)] px-6 py-8 text-[var(--ink)]">
                <p className="font-display text-center text-3xl">Certificate of Edition</p>
                <p className="font-display mt-6 text-center text-5xl">1 / 1</p>
                <p className="mt-2 text-center text-sm">Edition 1/1</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-12 md:py-28">
          <p className="eyebrow text-center">How it is made</p>
          <h2 className="font-display mt-3 text-center text-4xl md:text-6xl">Four quiet steps.</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              ["i.", "Begin", "Upload a photograph from this computer."],
              ["ii.", "Refine", "Crop, colour and the size of the print."],
              ["iii.", "Choose", "Glass, acrylic, Gallery Bond or porcelain."],
              ["iv.", "Ready", "Pay in USDC. We check the file, then make and number the piece."],
            ].map(([index, title, copy]) => (
              <li key={index}>
                <p className="font-display text-3xl italic text-[var(--gold-ink)]">{index}</p>
                <h3 className="font-display mt-3 text-3xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--charcoal)]">{copy}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 text-center">
            <Link href="/make" className="btn-foil">
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
