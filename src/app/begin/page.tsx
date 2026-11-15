import type { Metadata } from "next"
import Link from "next/link"
import { PathRail } from "@/components/house/path-rail"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { lines, starts } from "@/config/house"

export const metadata: Metadata = { title: "Begin a piece — OCHRÉ" }

export default function BeginPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page">
          <header className="phead">
            <p className="kicker">Step one · Idea</p>
            <h1>Begin a <em>piece</em></h1>
            <p className="phead__lede">Six ways in. The same six steps follow, in every line.</p>
          </header>
          <PathRail at={0} />
          <ul className="starts">
            {starts.map((item) => (
              <li key={item.title}>
                <Link href={item.href}>
                  <span className="starts__no mono">{lines.find((line) => line.id === item.line)?.no}</span>
                  <span className="starts__line mono">{lines.find((line) => line.id === item.line)?.name}</span>
                  <span className="starts__t">{item.title}</span>
                  <span className="starts__x">{item.text}</span>
                  <span className="starts__go mono">{item.go}</span>
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
