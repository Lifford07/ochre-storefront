import Link from "next/link"
import { HouseImage } from "@/components/brand/picture"
import { HouseLockup } from "@/components/brand/lockup"
import { PrototypeGate } from "@/components/shell/prototype-gate"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

const hang = [
  {
    name: "fela",
    href: "/collection/fela-the-goat",
    title: "Fela the Goat",
    meta: "SJ · 2026 · Real glass · 30 × 30 cm · Edition of 20",
    alt: "Fela the Goat, an existing Ochré work: a black and white portrait with the word FELA.",
    width: 960,
    height: 895,
    widths: [480, 960],
  },
  {
    name: "fingerprint",
    href: "/collection/fingerprint-of-god",
    title: "Fingerprint of God — Arabic Edition",
    meta: "SJ · 2026 · Real glass · 30 × 30 cm · Edition of 20",
    alt: "Fingerprint of God, Arabic edition: a fingerprint drawn in lines of text.",
    width: 960,
    height: 1152,
    widths: [480, 960],
  },
  {
    name: "cat",
    href: "/collection/curious-cat",
    title: "Curious Cat",
    meta: "SJ · 2026 · Canvas · 30 × 30 cm · Edition of 25",
    alt: "Curious Cat, an existing Ochré canvas of a cat.",
    width: 960,
    height: 960,
    widths: [480, 960],
  },
] as const

export default function HomePage() {
  return (
    <>
      <SiteHeader mark="word" showWallet={false} />
      <main>
        <section id="house" className="bg-[var(--porcelain)]">
          <div className="mx-auto grid max-w-[1120px] items-end gap-10 px-5 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16 md:px-10 md:py-16">
            <div>
              <HouseLockup />
              <p className="eyebrow mt-8">House of Junaid · Birmingham</p>
              <h1 className="font-display mt-3 max-w-[12ch] text-[2.65rem] text-[var(--navy)] md:text-6xl">
                Your image, made into an <em className="text-[var(--antique)]">object.</em>
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--navy)]">
                Bring an image or an idea. OCHRÉ makes one physical object to order, numbered, with a certificate and a provenance passport.
              </p>
              <p className="font-display mt-4 text-xl italic text-[var(--navy)]">Born of earth pigment, faith and three homelands.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/collection" className="btn-navy">
                  See the work
                </Link>
                <Link href="/salon" className="btn-ghost">
                  Salon Nº 01
                </Link>
              </div>
            </div>
            <figure>
              <HouseImage
                name="fela"
                alt={hang[0].alt}
                width={hang[0].width}
                height={hang[0].height}
                widths={[...hang[0].widths]}
                sizes="(max-width: 768px) 100vw, 46vw"
                className="h-auto w-full bg-[var(--bone)]"
              />
              <figcaption className="mt-3">
                <span className="font-display text-xl italic">{hang[0].title}</span>
                <span className="mt-1 block text-[11px] tracking-[0.14em] text-[var(--gold-ink)] uppercase">{hang[0].meta}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="work" className="border-t border-[var(--line)] bg-[var(--porcelain)]">
          <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-10 md:py-20">
            <p className="eyebrow">On the wall now</p>
            <h2 className="font-display mt-2 text-4xl text-[var(--navy)] md:text-5xl">
              Three works, <em className="text-[var(--antique)]">one hang.</em>
            </h2>
            <p className="mt-3 max-w-md text-[var(--navy)]">One work is loud. The label stays quiet.</p>
            <ul className="mt-10 grid gap-8 sm:grid-cols-3">
              {hang.map((work) => (
                <li key={work.name}>
                  <Link href={work.href} className="block">
                    <HouseImage
                      name={work.name}
                      alt={work.alt}
                      width={work.width}
                      height={work.height}
                      widths={[...work.widths]}
                      sizes="(max-width: 640px) 100vw, 30vw"
                      className="h-auto w-full bg-[var(--bone)]"
                    />
                    <span className="mt-3 block font-display text-2xl italic">{work.title}</span>
                    <span className="mt-1 block text-[11px] tracking-[0.12em] text-[var(--gold-ink)] uppercase">{work.meta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="pairings" className="bg-[var(--navy)] text-[var(--porcelain)]">
          <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-10 md:py-20">
            <p className="eyebrow !text-[var(--gold)]">House pairings</p>
            <h2 className="font-display mt-2 max-w-[16ch] text-4xl md:text-5xl">
              Two plain things. <em className="text-[var(--gold)]">Together, something.</em>
            </h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <li>
                <Link href="/verre-eglomise" className="block">
                  <span className="block border border-[var(--gold)]/40 p-4">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--gold)] uppercase">01 · Not for sale</span>
                    <span className="font-display mt-6 block text-3xl">Gold + glass</span>
                    <span className="mt-3 block text-sm leading-relaxed text-[var(--porcelain)]/80">
                      Verre églomisé, the signature craft. It is being learned. Nothing gilded is priced or sold.
                    </span>
                  </span>
                </Link>
              </li>
              <li>
                <figure>
                  <HouseImage
                    name="fingerprint-wall"
                    alt="Fingerprint of God, Christian edition, in a black frame on a white wall."
                    width={640}
                    height={853}
                    widths={[640]}
                    sizes="(max-width: 1024px) 92vw, 280px"
                    className="h-auto w-full"
                  />
                  <figcaption className="mt-3">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--gold)] uppercase">02 · Existing work</span>
                    <span className="mt-2 block text-sm">Text + portrait. A finished fingerprint piece, on the wall.</span>
                  </figcaption>
                </figure>
              </li>
              <li>
                <figure>
                  <HouseImage
                    name="junaid-canvas"
                    alt="A finished black canvas with the name Junaid written in Arabic."
                    width={640}
                    height={853}
                    widths={[640]}
                    sizes="(max-width: 1024px) 92vw, 280px"
                    className="h-auto w-full"
                  />
                  <figcaption className="mt-3">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--gold)] uppercase">03 · Finished piece</span>
                    <span className="mt-2 block text-sm">Crest + name. The name Junaid, in Arabic, on canvas.</span>
                  </figcaption>
                </figure>
              </li>
              <li>
                {/* TODO: native-speaker check before baile / ilé are printed on a piece. */}
                <div className="flex h-full min-h-48 flex-col justify-between border border-[var(--gold)]/40 p-4">
                  <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--gold)] uppercase">04 · Not a piece</span>
                  <span className="font-display text-4xl italic leading-tight">
                    baile
                    <span className="mt-1 block text-[var(--gold)]">ilé</span>
                  </span>
                  <span className="text-sm text-[var(--porcelain)]/80">Gaeilge and Yoruba, set side by side. Not for sale.</span>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section id="provenance" className="bg-[var(--porcelain)]">
          <div className="mx-auto grid max-w-[1120px] items-center gap-10 px-5 py-14 md:grid-cols-2 md:px-10 md:py-20">
            <div>
              <p className="eyebrow">Provenance</p>
              <h2 className="font-display mt-2 text-4xl text-[var(--navy)] md:text-5xl">
                Every piece has <em className="text-[var(--antique)]">a passport.</em>
              </h2>
              <p className="mt-5 max-w-md leading-relaxed">
                A headband, a ring, a glass panel: each one carries a record of who made it, where, and which number it is. The passport travels with the piece.
              </p>
              <dl className="mt-8 max-w-md border-t border-[var(--line)] text-sm">
                <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-[var(--line)] py-3">
                  <dt className="eyebrow !tracking-[0.16em]">Art</dt>
                  <dd>The passport goes in the certificate envelope.</dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-3 border-b border-[var(--line)] py-3">
                  <dt className="eyebrow !tracking-[0.16em]">Jewellery</dt>
                  <dd>The passport card is planned for the pouch. That line is still a prototype.</dd>
                </div>
              </dl>
              <p className="mt-6">
                <Link href="/orders/preview" className="lnk">
                  Sample certificate
                </Link>
              </p>
            </div>
            <figure className="mx-auto w-full max-w-[320px]">
              <HouseImage
                name="certificate"
                alt="Sample Ochré certificate of authenticity."
                width={960}
                height={1358}
                widths={[480, 960]}
                sizes="320px"
                className="h-auto w-full bg-[var(--bone)] shadow-[var(--shadow-art)]"
              />
            </figure>
          </div>
        </section>

        <PrototypeGate name="Salon Nº 01">
          <section id="salon" className="bg-[var(--navy)] text-[var(--porcelain)]">
            <div className="mx-auto grid max-w-[1120px] items-center gap-8 px-5 py-14 md:grid-cols-[1fr_1fr] md:px-10 md:py-20">
              <div>
                <p className="eyebrow !text-[var(--gold)]">Salon drop</p>
                <h2 className="font-display mt-2 text-4xl md:text-6xl">
                  Salon Nº 01 <em className="text-[var(--gold)]">Vitrine</em>
                </h2>
                <p className="mt-5 max-w-md leading-relaxed text-[var(--porcelain)]/80">
                  One theme. Five objects. One named day. Everything would be made to order inside the window. The day is not set, and nothing in the salon is for sale.
                </p>
                <Link href="/salon" className="btn-ghost on-dark mt-8">
                  View the salon
                </Link>
              </div>
              <p className="border border-[var(--gold)]/40 p-6 text-sm leading-relaxed text-[var(--porcelain)]/80">
                No headband has been sewn. No price and no edition size are set. The photograph in the early concept was a render, and it is not shown here.
              </p>
            </div>
          </section>
        </PrototypeGate>
      </main>
      <SiteFooter />
    </>
  )
}
