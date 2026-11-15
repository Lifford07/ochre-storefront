import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { NameField } from "@/components/house/name-field"
import { formatPrice, fromPrice } from "@/config/catalogue"
import { exhibitions, house, lines, pathNames, pathNotes, story } from "@/config/house"
import { verre } from "@/config/verre"
import { works } from "@/config/works"

const featured = works.filter((work) => work.artistSlug === "sj" && work.image)

export default function HomePage() {
  const hero = featured.find((work) => work.slug === "fingerprint-of-god") ?? featured[0]
  const named = featured.find((work) => work.personal)
  const peace = exhibitions[0]
  const words = house.manifesto.split(" ")
  const fromAcrylic = fromPrice("acrylic", { numbered: false })

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="hero dark">
          <div className="hero__art">
            <div className="frame">
              {hero?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.image} alt={`${hero.title}, by SJ`} width={1000} height={1200} fetchPriority="high" />
              ) : null}
            </div>
            {hero ? (
              <Link className="plate" href={`/collection/${hero.slug}`}>
                <b>{hero.artist}</b>
                <span><i>{hero.title}</i>{hero.sub ? `, ${hero.sub}` : ""}, {hero.year}</span>
                <span className="mono">Edition of {hero.editionSize}</span>
              </Link>
            ) : null}
          </div>
          <div className="hero__txt">
            <p className="kicker">Art · Jewellery · Home · Garms</p>
            <h1>A heritage house for people who <em>never had a crest.</em></h1>
            <p className="hero__sub">{house.promise} Numbered, and kept.</p>
            <div className="hero__cta">
              <Link className="btn btn--foil" href="/collection">View the collection</Link>
              <Link className="link" href="/begin">Begin with an idea</Link>
            </div>
          </div>
          <p className="hero__foot mono"><span>{house.delivered}</span><span>{house.countries}</span></p>
        </section>
        <div className="endband" aria-hidden />

        <section className="mani" id="mani">
          <p className="kicker">The house</p>
          <p className="mani__t">{words.map((word, index) => <span key={`${word}-${index}`} className={index >= words.length - 3 ? "it on" : "on"}>{word} </span>)}</p>
          <p className="mani__by mono">SJ, founder</p>
        </section>

        <section className="verre dark" id="verre">
          <div className="verre__txt">
            <p className="kicker"><span className="tag">{verre.status}</span> The signature craft</p>
            <h2>Verre <em>églomisé</em></h2>
            <p className="verre__plain">{verre.plain}. {verre.lede}</p>
            <blockquote className="verre__pitch">{verre.pitch[0]} <b>{verre.pitch[1]}</b></blockquote>
            <div className="row">
              <Link className="btn btn--foil" href="/verre-eglomise">Follow the gold</Link>
            </div>
          </div>
        </section>

        <section className="lines">
          <header className="shead"><p className="kicker">One house</p><h2>Four <em>lines</em></h2></header>
          <ul className="lines__list">
            {lines.map((line) => {
              const count = line.id === "art" ? featured.length : 0
              return (
                <li key={line.id}>
                  <Link href={line.href}>
                    <span className="lines__no mono">{line.no}</span>
                    <span className="lines__name">{line.name}</span>
                    <span className="lines__txt">{line.text}</span>
                    <span className="lines__st mono">{count ? `${count} works` : "In the atelier"}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="sixsec">
          <header className="shead"><p className="kicker">From an idea to the wall</p><h2>Six steps, <em>in every line</em></h2></header>
          <ol className="six">
            {pathNames.map((name, index) => (
              <li key={name}><span className="six__no mono">{String(index + 1).padStart(2, "0")}</span><h3>{name}</h3><p>{pathNotes[index]}</p></li>
            ))}
          </ol>
          <div className="row"><Link className="btn btn--navy" href="/begin">Begin a piece</Link></div>
        </section>

        {named ? (
          <section className="pers">
            <div className="pers__art">
              <div className="pframe">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={named.image} alt={`${named.title}, ${named.sub ?? ""}`} width={1000} height={1200} />
              </div>
            </div>
            <div className="pers__txt">
              <p className="kicker">{named.title}{named.sub ? `, ${named.sub}` : ""}</p>
              <h2>Genesis to Revelation, along every ridge. <em>Then a name.</em></h2>
              <p>{named.fact}</p>
              <NameField />
              <Link className="btn btn--navy" href={`/collection/${named.slug}`}>Make it yours</Link>
            </div>
          </section>
        ) : null}

        <section className="peace dark" id="peace">
          <div className="peace__txt">
            <p className="kicker"><span className="tag">{peace.status}</span> Exhibition</p>
            <h2>{peace.title}</h2>
            <p>{peace.text}</p>
            <ul className="dates mono"><li>{peace.place}</li>{peace.dates.map((date) => <li key={date}>{date}</li>)}</ul>
            <Link className="link" href="/exhibitions">Exhibitions</Link>
          </div>
        </section>

        <section className="prov dark">
          <div className="prov__art">
            <div className="cert">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/certificate-of-authenticity-800.webp" alt="An Ochré certificate of authenticity" width={800} height={1131} />
            </div>
          </div>
          <div className="prov__txt">
            <p className="kicker">Provenance</p>
            <h2>Numbered, <em>and kept.</em></h2>
            <p>Every piece is numbered. A certificate of authenticity comes with it.</p>
            <Link className="link" href="/orders/preview">How the numbering works</Link>
          </div>
        </section>

        <section className="tease">
          <p className="kicker">{story[0].no} · {story[0].title}</p>
          <p className="tease__t">{story[0].text}</p>
          <Link className="btn" href="/house">Read the story</Link>
        </section>

        <p className="page mono" style={{ paddingTop: 0 }}>Your photograph, edition 1/1, from {fromAcrylic == null ? "the catalogue" : formatPrice(fromAcrylic)}. <Link href="/make">Make yours</Link></p>
      </main>
      <SiteFooter />
    </>
  )
}
