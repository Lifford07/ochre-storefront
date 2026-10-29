import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Endband } from "@/components/brand/mark"
import { PieceZoomStudio } from "@/components/jewellery/PieceZoomStudio"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { findPiece, GALLERY_PIECES } from "@/lib/jewellery/pieces"

export function generateStaticParams() {
  return GALLERY_PIECES.map((piece) => ({ kind: piece.kind, slug: piece.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string; slug: string }>
}): Promise<Metadata> {
  const { kind, slug } = await params
  const piece = findPiece(kind, slug)
  return { title: piece ? `${piece.title} — OCHRÉ Jewellery` : "Piece — OCHRÉ" }
}

export default async function JewelleryPiecePage({
  params,
}: {
  params: Promise<{ kind: string; slug: string }>
}) {
  const { kind, slug } = await params
  const piece = findPiece(kind, slug)
  if (!piece) notFound()

  return (
    <>
      <SiteHeader />
      <main className="page-enter jewellery-museum museum-shell">
        <div className="mx-auto max-w-[1440px] px-5 py-10 md:px-12 md:py-14">
          <PieceZoomStudio piece={piece} />
        </div>
        <Endband />
      </main>
      <SiteFooter />
    </>
  )
}
