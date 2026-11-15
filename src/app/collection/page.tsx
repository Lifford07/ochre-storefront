import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { formatPrice, fromPrice } from "@/config/catalogue"
import { works } from "@/config/works"

export const metadata: Metadata = { title: "Collection — OCHRÉ" }

export default function CollectionPage() {
  const list = works.filter((work) => work.artistSlug === "sj" && work.image)
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page">
          <header className="phead">
            <p className="kicker">Collection</p>
            <h1>Works by <em>SJ</em></h1>
            <p className="phead__lede">Numbered editions, made to order on real glass, acrylic and canvas.</p>
          </header>
          <div className="salon">
            {list.map((work) => {
              const from = fromPrice(work.materialId, { numbered: true })
              return (
                <Link key={work.slug} className="card" href={`/collection/${work.slug}`}>
                  <span className="card__img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={work.image} alt={`${work.title}, by ${work.artist}`} />
                  </span>
                  <span className="card__cap">
                    <span className="card__t">{work.title}{work.sub ? <em> {work.sub}</em> : null}</span>
                    <span className="mono">{work.artist} · Edition of {work.editionSize}{from == null ? "" : ` · from ${formatPrice(from)}`}</span>
                  </span>
                </Link>
              )
            })}
            <Link className="card card--yours" href="/make">
              <span className="card__img"><span className="empty"><i>Yours</i></span></span>
              <span className="card__cap"><span className="card__t">Your photograph</span><span className="mono">Edition 1/1</span></span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
