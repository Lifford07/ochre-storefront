/**
 * Wall prices come from the MyPoster public grid captured 25 September 2026
 * (fine-art acrylic, Gallery Bond, 2.5 cm canvas, real glass).
 * Each shelf price is three times that landed cost. See landed-price.ts.
 * Greeting-card amounts are still a placeholder: cards are not in that grid.
 * Porcelain has no price until a printer cost exists.
 *
 * Each row is one size in one orientation. Amounts are pence, VAT included.
 */

import { markupFor, PRICE_RULE, shelfPence, type ShippingZone } from "@/lib/landed-price"

export const CATALOGUE_NOTICE = PRICE_RULE

export type MaterialId =
  | "real-glass"
  | "acrylic"
  | "gallery-bond"
  | "canvas"
  | "porcelain"
  | "card"

export type Orientation = "portrait" | "landscape" | "square"

export type PrinterName = "Precision Imaging" | "MyPoster"

export type Material = {
  id: MaterialId
  name: string
  /** One line under the name. */
  line: string
  /** Short process label, when we want it on the button. */
  mark?: string
  note?: string
  /** Thickness, colour count, where it can hang, how long it takes. */
  spec: string
  /** How to look after it, in the words that go in the box. */
  care: string
  /** What the customer gets for hanging it. */
  hanging: string
  /** Working days to make the object, before the courier. */
  lead: string
  /** False when we have no landed cost, so checkout will not take payment. */
  payable: boolean
  /** Who makes it. Fallback is used only when the first studio cannot. */
  primary: PrinterName
  fallback?: PrinterName
}

export type Size = {
  /** Unique. Includes the orientation, for example "a4-portrait". */
  id: string
  /** Shared by the portrait and landscape pair. "a4". */
  family: string
  name: string
  widthMm: number
  heightMm: number
  orientation: Orientation
  /**
   * MyPoster public sale price in euros, used as the print component of landed cost.
   * Leave a material out and that size is not offered in it.
   */
  prices: Partial<Record<MaterialId, number>>
}

function wallPrices(price: {
  glassEur?: number
  acrylicEur?: number
  bondEur?: number
  canvasEur?: number
}): Size["prices"] {
  const prices: Size["prices"] = {}
  if (price.glassEur != null) prices["real-glass"] = price.glassEur
  if (price.acrylicEur != null) prices.acrylic = price.acrylicEur
  if (price.bondEur != null) prices["gallery-bond"] = price.bondEur
  if (price.canvasEur != null) prices.canvas = price.canvasEur
  return prices
}

export const materials: Material[] = [
  {
    id: "real-glass",
    name: "Real Glass",
    line: "A print behind real glass, with flattened edges.",
    spec: "Fixed sizes only · indoor · about 5 working days to make",
    care: "A soft cloth and lukewarm water. No glass cleaner, and no abrasive.",
    hanging: "The hanger is fitted before it leaves us.",
    lead: "About 5 working days to make, then the courier.",
    payable: true,
    primary: "MyPoster",
  },
  {
    id: "acrylic",
    name: "Acrylic",
    line: "Fine-art acrylic. This is the acrylic we offer.",
    mark: "12-colour fine art print",
    spec: "4 mm · about 6 kg/m² · indoor, or a sheltered wall · 4 working days",
    care: "Lukewarm water, a drop of dish soap, and a soft cloth. No glass cleaner.",
    hanging: "The hanger is fitted before it leaves us.",
    lead: "About 4 working days to make, then the courier.",
    payable: true,
    primary: "MyPoster",
  },
  {
    id: "gallery-bond",
    name: "Gallery Bond",
    line: "A 12-colour print between acrylic and an aluminium back.",
    mark: "12-colour fine art print",
    spec: "About 5 mm · about 9 kg/m² · indoor · 5 working days",
    care: "The same as acrylic: water, a drop of soap, a soft cloth. No glass cleaner.",
    hanging: "The hanger is fitted before it leaves us.",
    lead: "About 5 working days to make, then the courier. No express on this material.",
    payable: true,
    primary: "MyPoster",
  },
  {
    id: "canvas",
    name: "Canvas",
    line: "Hand-stretched. This price is the 2.5 cm stretcher.",
    spec: "2.5 cm stretcher · 8-colour, softer and matte · indoor · 3 working days",
    care: "A dry cloth only. Canvas is not waterproof.",
    hanging: "A dowel set is packed in the box, so you choose where it sits.",
    lead: "About 3 working days to make, then the courier.",
    payable: true,
    primary: "Precision Imaging",
    fallback: "MyPoster",
  },
  {
    id: "porcelain",
    name: "Porcelain",
    line: "The image fired onto ceramic.",
    spec: "No printer cost yet, so it is not on sale.",
    care: "Not on sale yet.",
    hanging: "Not on sale yet.",
    lead: "Not on sale yet.",
    note: "Shown so the step is here. No printer is confirmed, and there is no landed cost.",
    payable: false,
    primary: "MyPoster",
  },
  {
    id: "card",
    name: "Card",
    line: "A greeting card, made from your photo.",
    spec: "Folded cotton card when it is made in Birmingham. Price is still a placeholder.",
    care: "Keep it dry.",
    hanging: "It posts flat, with an envelope.",
    lead: "About 3 working days to make, then the courier.",
    note: "Cards are not on sale until a printer quote exists. The prices that were here were placeholders.",
    payable: false,
    primary: "Precision Imaging",
    fallback: "MyPoster",
  },
]

type PairInput = {
  family: string
  name: string
  widthMm: number
  heightMm: number
  prices: Size["prices"]
}

/** Portrait and landscape each get their own price object, even when the example numbers match. */
function pair(input: PairInput): Size[] {
  const width = Math.min(input.widthMm, input.heightMm)
  const height = Math.max(input.widthMm, input.heightMm)
  if (width === height) {
    return [
      {
        id: `${input.family}-square`,
        family: input.family,
        name: input.name,
        widthMm: width,
        heightMm: height,
        orientation: "square",
        prices: { ...input.prices },
      },
    ]
  }
  return [
    {
      id: `${input.family}-portrait`,
      family: input.family,
      name: input.name,
      widthMm: width,
      heightMm: height,
      orientation: "portrait",
      prices: { ...input.prices },
    },
    {
      id: `${input.family}-landscape`,
      family: input.family,
      name: input.name,
      widthMm: height,
      heightMm: width,
      orientation: "landscape",
      prices: { ...input.prices },
    },
  ]
}

export const sizes: Size[] = [
  ...pair({
    family: "small",
    name: "13 × 18 cm",
    widthMm: 130,
    heightMm: 180,
    prices: wallPrices({ acrylicEur: 19.99, bondEur: 30.99 }),
  }),
  ...pair({
    family: "a4",
    name: "A4",
    widthMm: 210,
    heightMm: 297,
    prices: wallPrices({ acrylicEur: 34.99, bondEur: 45.99, canvasEur: 22.99 }),
  }),
  ...pair({
    family: "a3",
    name: "A3",
    widthMm: 297,
    heightMm: 420,
    prices: wallPrices({ acrylicEur: 47.99, bondEur: 60.99, canvasEur: 37.99 }),
  }),
  ...pair({
    family: "sq30",
    name: "30 × 30 cm",
    widthMm: 300,
    heightMm: 300,
    prices: wallPrices({ glassEur: 36.99, acrylicEur: 40.99, bondEur: 55.99, canvasEur: 22.99 }),
  }),
  ...pair({
    family: "a2",
    name: "A2",
    widthMm: 420,
    heightMm: 594,
    prices: wallPrices({ acrylicEur: 67.99, bondEur: 90.99, canvasEur: 61.99 }),
  }),
  ...pair({
    family: "50x70",
    name: "50 × 70 cm",
    widthMm: 500,
    heightMm: 700,
    prices: wallPrices({ acrylicEur: 80.99, bondEur: 130.99, canvasEur: 53.99 }),
  }),
  ...pair({
    family: "70x100",
    name: "70 × 100 cm",
    widthMm: 700,
    heightMm: 1000,
    prices: wallPrices({ acrylicEur: 150.99, bondEur: 190.99, canvasEur: 74.99 }),
  }),
  ...pair({
    family: "glass-20",
    name: "20 × 20 cm",
    widthMm: 200,
    heightMm: 200,
    prices: wallPrices({ glassEur: 22.99 }),
  }),
  ...pair({
    family: "glass-40x60",
    name: "40 × 60 cm",
    widthMm: 400,
    heightMm: 600,
    prices: wallPrices({ glassEur: 76.99 }),
  }),
  ...pair({
    family: "glass-50",
    name: "50 × 50 cm",
    widthMm: 500,
    heightMm: 500,
    prices: wallPrices({ glassEur: 73.99 }),
  }),
  ...pair({
    family: "glass-60x80",
    name: "60 × 80 cm",
    widthMm: 600,
    heightMm: 800,
    prices: wallPrices({ glassEur: 107.99 }),
  }),
  ...pair({
    family: "glass-30x80",
    name: "30 × 80 cm",
    widthMm: 300,
    heightMm: 800,
    prices: wallPrices({ glassEur: 73.99 }),
  }),
  ...pair({
    family: "glass-50x125",
    name: "50 × 125 cm",
    widthMm: 500,
    heightMm: 1250,
    prices: wallPrices({ glassEur: 146.99 }),
  }),
  ...pair({
    family: "a6",
    name: "A6",
    widthMm: 105,
    heightMm: 148,
    prices: { card: 650 },
  }),
  ...pair({
    family: "a5",
    name: "A5",
    widthMm: 148,
    heightMm: 210,
    prices: { card: 950 },
  }),
  ...pair({
    family: "card-square",
    name: "Square",
    widthMm: 140,
    heightMm: 140,
    prices: { card: 850 },
  }),
]

export function printerLine(material: Material): string {
  if (material.fallback) {
    return `Printer: ${material.primary}, then ${material.fallback} if needed.`
  }
  return `Printer: ${material.primary}.`
}

export function sizesFor(materialId: MaterialId, orientation: Orientation | "all" = "all"): Size[] {
  return sizes.filter((size) => {
    if (size.prices[materialId] == null) return false
    if (orientation === "all" || size.orientation === "square") return true
    return size.orientation === orientation
  })
}

export function priceFor(
  size: Size,
  materialId: MaterialId,
  options?: { zone?: ShippingZone; numbered?: boolean },
): number {
  const printEur = size.prices[materialId]
  if (printEur == null) {
    throw new Error(`No print cost for ${materialId} / ${size.id}`)
  }
  if (materialId === "card") throw new Error("Cards are not on sale.")
  const zone = options?.zone ?? "UK"
  const numbered = options?.numbered ?? false
  return shelfPence(printEur, zone, markupFor(materialId, numbered))
}

export function fromPrice(
  materialId: MaterialId,
  options?: { zone?: ShippingZone; numbered?: boolean },
): number | null {
  if (materialId === "card" || materialId === "porcelain") return null
  const amounts = sizesFor(materialId).map((size) => priceFor(size, materialId, options))
  if (amounts.length === 0) return null
  return Math.min(...amounts)
}

export function formatPrice(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100)
}

export function materialById(id: MaterialId): Material {
  const material = materials.find((item) => item.id === id)
  if (!material) throw new Error(`Unknown material ${id}`)
  return material
}
