import type { Metadata } from "next"
import { HouseImage } from "@/components/brand/picture"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata: Metadata = {
  title: "House of Junaid — OCHRÉ",
  description: "Ochré, named for the earth pigment. British, Nigerian, and raised in Ennis. The studio is in Birmingham.",
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--porcelain)]">
        <article className="mx-auto max-w-[720px] px-5 py-14 md:px-8 md:py-20">
          <p className="eyebrow">Heritage</p>
          <h1 className="font-display mt-3 text-4xl text-[var(--navy)] md:text-6xl">
            Born of earth pigment, faith and three homelands.
          </h1>
          {/* TODO: commission counts, a "still displayed" rate, and named collectors need an evidence pack before they are written here. */}
          <div className="mt-8 space-y-5 text-lg leading-relaxed">
            <p>Ochré is an earth pigment. The house is named for that colour: warm, of the ground, and meant to last.</p>
            <p>
              Segun Junaid was born in London and raised in Ennis, County Clare. He was the first Black pupil at his primary school. In a geography class the other children drew family crests they had inherited. He had none, so he drew one. The house starts there: a crest, and a permanence, for a name that did not have one waiting.
            </p>
            <p>
              He is British. He is Yoruba, and the work also draws on Benin bronze. Ireland is the third homeland. The studio is in Birmingham.
            </p>
            <p>
              The faith in the house is the Cherubim and Seraphim church. Moses Orimolade is named among the people a house journal would honour. Holy Michael is named among the archangels of that tradition. Those names stay on this page. They are not a mark, a line, or a product. The mark on the work is the Cherub.
            </p>
            <p>In 2019 he made a canvas, because he could not find the print he wanted. The house still works that way. Someone brings an image or an idea. OCHRÉ makes one physical object, to order, numbered, with a certificate and a provenance passport.</p>
            <p>A commission is a piece made for one person. It is not a catalogue of ready prints.</p>
          </div>
        </article>
        <div className="mx-auto grid max-w-[1120px] gap-8 px-5 pb-16 md:grid-cols-3 md:px-10 md:pb-24">
          <figure>
            <HouseImage
              name="fingerprint-wall"
              alt="Fingerprint of God, Christian edition, framed and hanging on a white wall."
              width={640}
              height={853}
              widths={[640]}
              sizes="(max-width: 768px) 92vw, 320px"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-sm">A finished fingerprint piece, on a wall.</figcaption>
          </figure>
          <figure>
            <HouseImage
              name="junaid-canvas"
              alt="A finished black canvas with the name Junaid in Arabic, held outdoors."
              width={640}
              height={853}
              widths={[640]}
              sizes="(max-width: 768px) 92vw, 320px"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-sm">The name Junaid, in Arabic, on a finished canvas.</figcaption>
          </figure>
          <figure>
            <HouseImage
              name="portrait-commission"
              alt="A finished commissioned portrait on canvas, held at a front door."
              width={640}
              height={853}
              widths={[640]}
              sizes="(max-width: 768px) 92vw, 320px"
              className="h-auto w-full"
            />
            <figcaption className="mt-3 text-sm">A commissioned portrait, finished and delivered.</figcaption>
          </figure>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
