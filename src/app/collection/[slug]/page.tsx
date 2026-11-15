import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Endband } from "@/components/brand/mark"
import { WorkStudio } from "@/components/collection/work-studio"
import { WorkBuy } from "@/components/house/work-buy"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { workBySlug, works } from "@/config/works"
import { countPaid } from "@/lib/orders-store"
import { ordersAvailable } from "@/lib/storage-mode"

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const work = workBySlug(slug)
  return { title: work ? `${work.title} — OCHRÉ` : "Work — OCHRÉ" }
}

export const dynamic = "force-dynamic"

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const work = workBySlug(slug)
  if (!work) notFound()
  let taken = 0
  let countKnown = false
  if (ordersAvailable()) {
    try {
      taken = await countPaid(work.slug)
      countKnown = true
    } catch (error) {
      console.error("edition-count", error instanceof Error ? error.message : "failed")
    }
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="page">
        {work.artistSlug === "sj" && work.image ? <WorkBuy work={work} /> : <WorkStudio work={work} taken={taken} countKnown={countKnown} />}
      </main>
      <Endband />
      <SiteFooter />
    </>
  )
}
