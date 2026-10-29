export type GalleryKind = "artwork" | "eglomise" | "jewellery"

export type ZoomTier = {
  /** Use this tier while scale <= maxScale (relative to fit-width scale ≈ 1). */
  maxScale: number
  src: string
  width: number
  height: number
}

export type GalleryPiece = {
  kind: GalleryKind
  slug: string
  title: string
  blurb: string
  priceLabel: string
  alt: string
  thumb: string
  width: number
  height: number
  tiers: ZoomTier[]
}

/** Ochré-original pieces — progressive WebP ladders. Technique-only inspiration; our art and copy. */
export const GALLERY_PIECES: GalleryPiece[] = [
  {
    kind: "jewellery",
    slug: "crest-signet",
    title: "Crest signet",
    blurb: "Engraved signet face under the lens — gilt edge, hatching, and the shield field.",
    priceLabel: "From £320",
    alt: "Ochré crest signet face with gilt hatching on a dark museum field",
    thumb: "/gallery/jewellery/crest-signet/thumb.webp",
    width: 2457,
    height: 3072,
    tiers: [
      { maxScale: 1.25, src: "/gallery/jewellery/crest-signet/w384.webp", width: 307, height: 384 },
      { maxScale: 2.5, src: "/gallery/jewellery/crest-signet/w768.webp", width: 614, height: 768 },
      { maxScale: 5, src: "/gallery/jewellery/crest-signet/w1536.webp", width: 1229, height: 1536 },
      { maxScale: 12, src: "/gallery/jewellery/crest-signet/w3072.webp", width: 2457, height: 3072 },
    ],
  },
  {
    kind: "artwork",
    slug: "night-leaf",
    title: "Night leaf",
    blurb: "Gold-leaf study on a night field — zoom into the veins and micro-flakes.",
    priceLabel: "From £480",
    alt: "Ochré gold leaf oak study on a dark museum field",
    thumb: "/gallery/artwork/night-leaf/thumb.webp",
    width: 3072,
    height: 3072,
    tiers: [
      { maxScale: 1.25, src: "/gallery/artwork/night-leaf/w384.webp", width: 384, height: 384 },
      { maxScale: 2.5, src: "/gallery/artwork/night-leaf/w768.webp", width: 768, height: 768 },
      { maxScale: 5, src: "/gallery/artwork/night-leaf/w1536.webp", width: 1536, height: 1536 },
      { maxScale: 12, src: "/gallery/artwork/night-leaf/w3072.webp", width: 3072, height: 3072 },
    ],
  },
  {
    kind: "eglomise",
    slug: "gilded-shield",
    title: "Gilded shield",
    blurb: "Églomisé panel with reverse-glass leaf — inspect the gilt edge and hatching.",
    priceLabel: "From £240",
    alt: "Ochré églomisé gilded glass shield panel",
    thumb: "/gallery/eglomise/gilded-shield/thumb.webp",
    width: 2457,
    height: 3072,
    tiers: [
      { maxScale: 1.25, src: "/gallery/eglomise/gilded-shield/w384.webp", width: 307, height: 384 },
      { maxScale: 2.5, src: "/gallery/eglomise/gilded-shield/w768.webp", width: 614, height: 768 },
      { maxScale: 5, src: "/gallery/eglomise/gilded-shield/w1536.webp", width: 1229, height: 1536 },
      { maxScale: 12, src: "/gallery/eglomise/gilded-shield/w3072.webp", width: 2457, height: 3072 },
    ],
  },
]

export function findPiece(kind: string, slug: string): GalleryPiece | undefined {
  return GALLERY_PIECES.find((p) => p.kind === kind && p.slug === slug)
}

export function piecesByKind(kind: GalleryKind): GalleryPiece[] {
  return GALLERY_PIECES.filter((p) => p.kind === kind)
}

export function kindLabel(kind: GalleryKind): string {
  switch (kind) {
    case "jewellery":
      return "Jewellery"
    case "artwork":
      return "Artwork"
    case "eglomise":
      return "Églomisé"
  }
}
