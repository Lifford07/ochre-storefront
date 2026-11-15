import type { Metadata } from "next"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { founder, lexicon, story } from "@/config/house"

export const metadata: Metadata = { title: "The House — OCHRÉ" }

export default function HousePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page">
          <header className="phead">
            <p className="kicker">The House</p>
            <h1>Built for people who <em>never had a crest.</em></h1>
            <p className="phead__lede">{founder}</p>
          </header>
          <ol className="six">
            {story.map((chapter) => (
              <li key={chapter.no}>
                <span className="six__no mono">{chapter.no}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.text}</p>
              </li>
            ))}
          </ol>
          <header className="shead" id="lexicon"><p className="kicker">A to Z</p><h2>The <em>lexicon</em></h2></header>
          <dl className="lexicon">
            {lexicon.map(([letter, term, text]) => (
              <div key={term}>
                <dt><span className="mono">{letter}</span> {term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
