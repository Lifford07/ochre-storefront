import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { WorkImage } from "@/components/art/motif"
import { Endband } from "@/components/brand/mark"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { artistBySlug, artists, worksByArtist } from "@/config/works"

export function generateStaticParams() {
  return artists.map((artist) => ({ slug: artist.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const artist = artistBySlug(slug)
  return { title: artist ? `${artist.name} — OCHRÉ` : "Artist — OCHRÉ" }
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const artist = artistBySlug(slug)
  if (!artist) notFound()
  const list = worksByArtist(artist.slug)

  return (
    <>
      <SiteHeader />
      <main className="page-enter">
        <section className="bg-[url('/endpaper.svg')] bg-[length:96px_72px]">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-12 text-[var(--porcelain)] md:flex-row md:items-end md:px-12 md:py-16">
            <div className="size-24 shrink-0 rounded-full bg-[#E7C8A5]" aria-hidden />
            <div>
              <p className="eyebrow text-[var(--gold)]">{artist.name} · profile</p>
              <h1 className="font-display mt-2 text-5xl text-[var(--porcelain)] md:text-6xl">
                {artist.name} {artist.example ? <span className="ex">Example</span> : null}
              </h1>
              <p className="mt-3 max-w-xl text-[var(--porcelain)]/80">{artist.line}</p>
              <p className="mt-4 font-mono text-[11px] tracking-[0.14em] uppercase">
                {list.length} works · {list.reduce((sum, work) => sum + work.editionSize, 0)} in edition
              </p>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1440px] px-5 py-12 md:px-12">
          <h2 className="font-display text-4xl">Works in numbered editions.</h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((work) => (
              <li key={work.slug}>
                <Link href={`/collection/${work.slug}`} className="art-card block">
                  <div className="aspect-[4/5] bg-[var(--bone)] shadow-[var(--shadow-art)]">
                    <WorkImage motif={work.motif} image={work.image} title={work.title} />
                  </div>
                  <h3 className="font-display mt-4 text-2xl italic">{work.title}</h3>
                  <p className="mt-2 font-mono text-[11px] tracking-[0.12em] text-[var(--gold-ink)] uppercase">
                    Edition of {work.editionSize}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <Endband />
      </main>
      <SiteFooter />
    </>
  )
}
