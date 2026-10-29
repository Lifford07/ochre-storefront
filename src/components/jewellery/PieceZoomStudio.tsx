"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import type { GalleryPiece } from "@/lib/jewellery/pieces"
import { kindLabel } from "@/lib/jewellery/pieces"

const GoldLeafZoom = dynamic(
  () => import("@/components/zoom/GoldLeafZoom").then((m) => m.GoldLeafZoom),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[280px] items-center justify-center border border-[color:var(--gallery-line)] bg-[color:var(--gallery-panel)] text-sm text-[color:var(--gallery-muted)]"
        role="status"
      >
        Opening the lens…
      </div>
    ),
  },
)

export function PieceZoomStudio({ piece }: { piece: GalleryPiece }) {
  return (
    <div className="jewellery-museum grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
      <div>
        <p className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--gallery-muted)] uppercase">
          <Link href="/jewellery" className="hover:text-[color:var(--gallery-ochre)]">
            Jewellery
          </Link>
          <span> / </span>
          <span>{piece.title}</span>
        </p>
        <div className="mt-4">
          <GoldLeafZoom
            alt={piece.alt}
            width={piece.width}
            height={piece.height}
            tiers={piece.tiers}
          />
        </div>
      </div>

      <aside className="gallery-panel">
        <p className="eyebrow !text-[color:var(--gallery-ochre)]">{kindLabel(piece.kind)}</p>
        <h1 className="font-display mt-2 text-4xl text-[color:var(--gallery-ink)] md:text-5xl">{piece.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--gallery-muted)]">{piece.blurb}</p>
        <p className="font-display mt-5 text-2xl text-[color:var(--gallery-ochre)]">{piece.priceLabel}</p>
        <p className="mt-4 text-sm leading-relaxed text-[color:var(--gallery-muted)]">
          Scroll or pinch to zoom into the gold leaf. Drag to pan · keys + / − / arrows / 0. Sharper image
          tiers load as you go deeper — starts light, stays fast.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/jewellery/commission" className="btn-primary text-center">
            Commission a related piece
          </Link>
          <Link href="/jewellery/design" className="btn-secondary text-center">
            Design your crest
          </Link>
        </div>
      </aside>
    </div>
  )
}
