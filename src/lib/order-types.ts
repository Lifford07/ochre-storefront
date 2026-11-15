import type { SolanaCluster } from "@/config/solana"
import type { EditionKind } from "@/lib/edition"

export type PrintSpec =
  | {
      kind: "customer"
      fit: "fill" | "fit"
      look: "original" | "bw" | "sepia"
      colourOptimise: boolean
      enhance: "preview-only" | "none"
      edge?: "mirror" | "fold" | "colour"
      widthMm: number
      heightMm: number
      sourceWidth: number
      sourceHeight: number
      outputWidth: number
      outputHeight: number
      outputDpi: number
      qualityBand: "red" | "amber" | "green"
      softPrintAcknowledged: boolean
    }
  | {
      kind: "house-stand-in"
      note: string
    }

export type OrderStatus = "awaiting payment" | "paid, awaiting Ochré check"

export type StoredOrder = {
  id: string
  createdAt: string
  status: OrderStatus
  materialId: string
  materialName: string
  sizeId: string
  sizeName: string
  widthMm: number
  heightMm: number
  pricePence: number
  usdcAmount: string
  gbpToUsdc: number
  fxSource: string
  editionRun: number
  editionLabel: string
  editionKind?: EditionKind
  editionNumber?: number
  editionSize?: number
  artworkSlug?: string
  artworkTitle?: string
  email?: string
  fullName?: string
  address?: string
  city?: string
  postcode?: string
  country?: string
  phone?: string
  payer?: string
  viewToken?: string
  printSpec?: PrintSpec
  dpi: number
  rightsLine: string
  rightsAt: string
  canvasEdge?: string
  reference: string
  recipient: string
  mint: string
  cluster: SolanaCluster
  rpc: string
  memo: string
  label: string
  message: string
  payUrl: string
  signature?: string
  solscanUrl?: string
  paidAt?: string
  /** overpaid, duplicate, or split, when more than the single expected transfer arrived. */
  paymentFlags?: Array<"overpaid" | "duplicate" | "split">
  paymentMethod?: "usdc" | "card"
  stripeSessionId?: string
  stripePaymentIntent?: string
  imageUrl?: string
  imageStore?: "blob" | "file"
  imageContentType?: string
  /** Set when this piece is paid as part of a basket. It is then paid only through that basket. */
  basketId?: string
}

/** One line of a basket: a work, a material, a size, and how many. */
export type BasketLine = {
  slug: string
  title: string
  materialId: string
  materialName: string
  sizeId: string
  sizeName: string
  qty: number
  unitPence: number
  /** One order per piece, so each gets its own edition number and certificate. */
  orderIds: string[]
}

/** Several pieces paid with one card payment or one USDC transfer. */
export type StoredBasket = {
  id: string
  createdAt: string
  status: OrderStatus
  lines: BasketLine[]
  pieces: number
  totalPence: number
  usdcAmount: string
  gbpToUsdc: number
  fxSource: string
  email: string
  fullName: string
  address: string
  city: string
  postcode: string
  country: string
  phone?: string
  viewToken: string
  reference: string
  recipient: string
  mint: string
  cluster: SolanaCluster
  memo: string
  label: string
  message: string
  payUrl: string
  paymentMethod: "usdc" | "card"
  stripeSessionId?: string
  stripePaymentIntent?: string
  signature?: string
  solscanUrl?: string
  payer?: string
  paidAt?: string
  paymentFlags?: Array<"overpaid" | "duplicate" | "split">
  /** Pieces that could not be numbered after payment, for example an edition that sold out at the same moment. */
  problems?: string[]
}
