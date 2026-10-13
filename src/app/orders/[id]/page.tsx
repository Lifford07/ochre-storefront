import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { WorkImage } from "@/components/art/motif"
import { CertificatePage, type CertificateView } from "@/components/certificate/certificate-card"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { workBySlug } from "@/config/works"
import { getOrder } from "@/lib/orders-store"
import type { StoredOrder } from "@/lib/order-types"
import { ordersAvailable } from "@/lib/storage-mode"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `${id} — OCHRÉ` }
}

export default async function OrderCertificatePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { id } = await params
  const { t } = await searchParams
  if (!ordersAvailable()) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-16">
          <h1 className="font-display text-4xl">The certificate is unavailable</h1>
          <p className="mt-4 text-sm text-[var(--charcoal)]">The order store is not connected, so this page cannot look up {id}.</p>
        </main>
        <SiteFooter />
      </>
    )
  }
  let order: StoredOrder | null
  try {
    order = await getOrder(id)
  } catch {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-16">
          <h1 className="font-display text-4xl">The certificate is unavailable</h1>
          <p className="mt-4 text-sm text-[var(--charcoal)]">The order store did not answer. The rest of the shop is still open. Try this page again in a moment.</p>
        </main>
        <SiteFooter />
      </>
    )
  }
  if (!order) notFound()
  return (
    <>
      <SiteHeader />
      <CertificatePage view={viewFromOrder(order, t)} />
      <SiteFooter />
    </>
  )
}

export function viewFromOrder(order: StoredOrder, token?: string): CertificateView {
  const work = order.artworkSlug ? workBySlug(order.artworkSlug) : undefined
  const size = order.editionSize ?? order.editionRun
  const number = order.editionNumber ?? 0
  const paid = order.status === "paid, awaiting Ochré check"
  const showFile = Boolean(order.imageStore && token && order.viewToken && token === order.viewToken)
  const mainnet = process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" || order.cluster === "mainnet-beta"
  return {
    id: order.id,
    title: order.artworkTitle ?? "Your image",
    artist: work?.artist,
    materialName: order.materialName,
    sizeName: order.sizeName,
    editionLabel: order.editionLabel,
    number,
    size,
    owner: order.payer || "Recorded when the payment confirms",
    mint: order.mint,
    network: mainnet ? "Solana mainnet" : "Solana devnet",
    signature: order.signature,
    solscanUrl: order.solscanUrl,
    issued: new Date(order.paidAt ?? order.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    paid,
    image: showFile ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/api/orders/${order.id}/image?t=${encodeURIComponent(token ?? "")}`} alt="" className="h-full w-full object-cover" />
    ) : work ? (
      <WorkImage motif={work.motif} image={work.image} title={work.title} />
    ) : (
      <div className="grid h-full place-items-center bg-[#d7e0ea] text-center font-mono text-[10px] tracking-[0.14em] text-[var(--navy)] uppercase">
        Your image
      </div>
    ),
  }
}
