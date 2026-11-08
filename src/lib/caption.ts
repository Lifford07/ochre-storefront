import { materialById, sizes, sizesFor, type MaterialId, type Size } from "@/config/catalogue"
import type { HouseWork } from "@/config/works"

export function sizeById(id: string): Size | undefined {
  return sizes.find((size) => size.id === id)
}

function centimetres(mm: number): string {
  const value = mm / 10
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1).replace(/\.0$/, "")
}

/** Museum dimensions: the catalogue name when it already states centimetres, otherwise the name plus the measured size. */
export function dimensionsLabel(sizeId: string): string {
  const size = sizeById(sizeId)
  if (!size) return ""
  if (size.name.includes("×")) return size.name
  return `${size.name} · ${centimetres(size.widthMm)} × ${centimetres(size.heightMm)} cm`
}

export type WallFacts = {
  title: string
  artist: string
  year: number
  medium: string
  dimensions: string
  edition: string
}

export function wallFacts(work: HouseWork, materialId: MaterialId = work.materialId, sizeId = work.sizeId): WallFacts {
  const available = sizesFor(materialId)
  const resolved = available.some((size) => size.id === sizeId) ? sizeId : (available[0]?.id ?? sizeId)
  return {
    title: work.title,
    artist: work.artist,
    year: work.year,
    medium: materialById(materialId).name,
    dimensions: dimensionsLabel(resolved),
    edition: `Edition of ${work.editionSize}`,
  }
}

export function captionLine(facts: WallFacts): string {
  return `${facts.year} · ${facts.medium} · ${facts.dimensions} · ${facts.edition}`
}
