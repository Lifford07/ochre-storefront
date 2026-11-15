import type { Metadata } from "next"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { exhibitions } from "@/config/house"

export const metadata: Metadata = { title: "Exhibitions — OCHRÉ" }

export default function ExhibitionsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page">
          <header className="phead">
            <p className="kicker">Exhibitions</p>
            <h1>Where the house <em>shows</em></h1>
          </header>
          <ul className="shows">
            {exhibitions.map((show) => (
              <li key={show.title}>
                <p className="kicker"><span className="tag">{show.status}</span></p>
                <h2>{show.title}</h2>
                <p>{show.text}</p>
                <ul className="dates mono"><li>{show.place}</li>{show.dates.map((date) => <li key={date}>{date}</li>)}</ul>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
