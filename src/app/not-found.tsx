import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page">
          <header className="phead">
            <p className="kicker">404</p>
            <h1>This page is not in the <em>house.</em></h1>
            <p className="phead__lede">The piece, the path, or the address is not here.</p>
          </header>
          <Link className="btn btn--navy" href="/">Back to the house</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
