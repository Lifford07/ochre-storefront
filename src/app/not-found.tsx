import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-16">
        <p className="eyebrow">Missing</p>
        <h1 className="font-display mt-2 text-4xl">That page is not in the house.</h1>
        <p className="mt-4 text-sm text-[var(--charcoal)]">The link may be old, or the piece may never have been listed.</p>
        <Link href="/collection" className="btn-foil mt-8 inline-flex">
          View the collection
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
