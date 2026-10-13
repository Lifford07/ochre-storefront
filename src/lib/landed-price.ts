/**
 * Shelf price.
 * Landed cost is the print (MyPoster's public sale price, euros, captured 25 September 2026,
 * treated as the print component) plus packaging plus shipping for the destination zone.
 * Ochré charges at least 3× that landed cost, or 4× for a premium material or a numbered edition.
 * The result is rounded up to a gallery ending (£…5 or £…8).
 * The euro rate is the one used when the grid was applied, not a live feed.
 *
 * Shipping and packaging are documented assumptions, not a live carrier quote:
 * - packaging £6 for a wall piece (tube or flat box)
 * - UK shipping £8, EU £18, US £28
 * EU is one zone rate. Duties are not added. Cards are not priced.
 */

export const EUR_TO_GBP = 0.86
export const WALL_PACKAGING_GBP = 6
export const SHIP_GBP = { UK: 8, EU: 18, US: 28 } as const

export type ShippingZone = keyof typeof SHIP_GBP
export type Markup = 3 | 4

export const PRICE_RULE =
  "Wall prices are at least three times landed cost (print + £6 packaging + zone shipping), or four times for premium materials and numbered editions, then rounded up to a gallery ending. UK shipping is assumed at £8, EU at £18, US at £28. No strike-through sale."

export function landedGbp(printEur: number, zone: ShippingZone): number {
  if (!Number.isFinite(printEur) || printEur < 0) throw new Error("Print cost must be a positive number")
  return printEur * EUR_TO_GBP + WALL_PACKAGING_GBP + SHIP_GBP[zone]
}

/** Round up to the next whole pound that ends in 5 or 8. £66 becomes £68. £90 becomes £95. */
export function galleryPence(minGbp: number): number {
  let pounds = Math.ceil(minGbp - 1e-9)
  while (pounds % 10 !== 5 && pounds % 10 !== 8) pounds += 1
  return pounds * 100
}

export function shelfPence(printEur: number, zone: ShippingZone, multiple: Markup): number {
  const landed = landedGbp(printEur, zone)
  const shelf = landed * multiple
  const pence = galleryPence(shelf)
  if (pence / 100 + 1e-6 < landed * multiple) {
    throw new Error("Shelf price fell under the markup")
  }
  return pence
}

export function markupFor(materialId: string, numbered: boolean): Markup {
  if (numbered) return 4
  if (materialId === "real-glass" || materialId === "gallery-bond") return 4
  return 3
}
