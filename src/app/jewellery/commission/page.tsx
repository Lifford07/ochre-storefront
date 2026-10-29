import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { CommissionBriefFlow } from "@/components/jewellery/CommissionBriefFlow"

export const metadata: Metadata = {
  title: "Commission brief — OCHRÉ Jewellery",
  description: "Tell Ochré what your crest should hold — stepped commission brief.",
}

export default function JewelleryCommissionPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-enter jewellery-museum museum-shell min-h-[70vh]">
        <div className="mx-auto max-w-6xl px-5 pt-6 md:px-8">
          <p className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--gallery-muted)] uppercase">
            <Link href="/jewellery" className="hover:text-[color:var(--gallery-ochre)]">
              Jewellery
            </Link>
            <span> / Commission</span>
          </p>
        </div>
        <CommissionBriefFlow />
      </main>
      <SiteFooter />
    </>
  )
}
