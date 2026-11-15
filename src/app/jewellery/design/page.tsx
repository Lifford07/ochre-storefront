import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { CrestCustomiser } from "@/components/jewellery/CrestCustomiser"

export const metadata: Metadata = {
  title: "Design your crest — OCHRÉ Jewellery",
  description: "Stepped crest customiser for signet rings and crest prints. Ochré personalisation.",
}

export default function JewelleryDesignPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-enter jewellery-museum museum-shell min-h-[70vh]">
        <div className="mx-auto max-w-6xl px-5 pt-6 md:px-8">
          <p className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--gallery-muted)] uppercase">
            <Link href="/jewellery" className="hover:text-[color:var(--gallery-ochre)]">
              Jewellery
            </Link>
            <span> / Design</span>
          </p>
        </div>
        <CrestCustomiser />
      </main>
      <SiteFooter />
    </>
  )
}
