import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { lines } from "@/config/house"

export const metadata: Metadata = { title: "Commission — OCHRÉ" }

export default function CommissionPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page">
          <header className="phead">
            <p className="kicker">Commission</p>
            <h1>Send an <em>idea</em></h1>
            <p className="phead__lede">Nothing is charged here. The studio reads the brief and replies.</p>
          </header>
          <ul className="starts">
            {lines.map((line) => (
              <li key={line.id}>
                <Link href={line.id === "art" ? "/begin" : `/commission/${line.id}`}>
                  <span className="mono">{line.no}</span>
                  <strong>{line.name}</strong>
                  <p>{line.ask}</p>
                  <em>Open the brief</em>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
