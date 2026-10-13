"use client"

import { Suspense } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { PayPanel } from "@/components/checkout/pay-panel"
import { SiteFooter, SiteHeader, FlowHeader } from "@/components/shell/site-chrome"
import { materialById, priceFor, sizes } from "@/config/catalogue"
import { workBySlug } from "@/config/works"
import { verdictFor } from "@/lib/quality"

function CollectBody() {
  const params = useParams<{ slug: string }>()
  const search = useSearchParams()
  const work = workBySlug(params.slug)
  const materialId = search.get("material") ?? work?.materialId ?? "acrylic"
  const sizeId = search.get("size") ?? work?.sizeId ?? ""
  const size = sizes.find((item) => item.id === sizeId)
  let material: ReturnType<typeof materialById> | null = null
  try {
    material = materialById(materialId as Parameters<typeof materialById>[0])
  } catch {
    material = null
  }

  if (!work || !material || !size || size.prices[material.id] == null || !material.payable) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-16">
          <h1 className="font-display text-4xl">That edition is not available</h1>
          <p className="mt-4 text-sm text-[var(--charcoal)]">This material and size is not on sale for that work.</p>
        </main>
        <SiteFooter />
      </>
    )
  }

  const price = priceFor(size, material.id, { numbered: true })
  const wording = `Edition of ${work.editionSize}. Your number is assigned when the payment clears.`

  return (
    <>
      <FlowHeader step="checkout" />
      <main className="page-enter mx-auto max-w-5xl px-4 py-8 md:px-8">
        <p className="text-center eyebrow">Collect · {work.title}</p>
        <h1 className="font-display mt-3 text-center text-4xl md:text-6xl">Ready to be made.</h1>
        <p className="mt-2 text-center text-[var(--charcoal)]">
          {wording}
        </p>
        <div className="mt-8">
          <PayPanel
            materialId={material.id}
            sizeId={size.id}
            editionRun={work.editionSize}
            dpi={300}
            pricePence={price}
            artworkSlug={work.slug}
            summary={{
              title: work.title,
              materialName: material.name,
              sizeName: size.name,
              editionLabel: wording,
              dpi: 300,
              bandLabel: verdictFor("green"),
              lead: material.lead,
            }}
          />
        </div>
      </main>
    </>
  )
}

export function CollectCheckout() {
  return (
    <Suspense fallback={<p className="px-5 py-10 text-sm text-[var(--mute)]">Opening the edition…</p>}>
      <CollectBody />
    </Suspense>
  )
}
