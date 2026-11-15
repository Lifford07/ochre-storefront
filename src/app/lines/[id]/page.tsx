import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PathRail } from "@/components/house/path-rail"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { lines } from "@/config/house"

export function generateStaticParams() {
  return lines.filter((line) => line.id !== "art").map((line) => ({ id: line.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const line = lines.find((item) => item.id === id)
  return { title: line ? `${line.name} — OCHRÉ` : "Line — OCHRÉ" }
}

export default async function LinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const line = lines.find((item) => item.id === id)
  if (!line || line.id === "art") notFound()
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page">
          <header className="phead">
            <p className="kicker">{line.no} · In the atelier</p>
            <h1>{line.name}</h1>
            <p className="phead__lede">{line.text}</p>
          </header>
          <PathRail at={0} material={line.material} />
          <ul className="concepts">
            {line.concepts.map(([title, state]) => (
              <li key={title}><h3>{title}</h3><span className="concepts__n mono">{state}</span></li>
            ))}
          </ul>
          {line.note ? <p className="note">{line.note}</p> : null}
          <div className="row">
            <Link className="btn btn--navy" href={`/commission/${line.id}`}>Send your idea</Link>
            {line.id === "jewellery" ? <Link className="link" href="/jewellery/design">Open the crest builder</Link> : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
