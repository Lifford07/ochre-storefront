import { Keypair, PublicKey } from "@solana/web3.js"
import { encodeURL } from "@solana/pay"
import BigNumber from "bignumber.js"
import { materialById, priceFor, sizes } from "@/config/catalogue"
import { DEMO_MERCHANT, solanaSettings } from "@/config/solana"
import { workBySlug } from "@/config/works"
import { editionWording } from "@/lib/edition"
import { gbpToUsdc } from "@/lib/fx"
import { measureImage } from "@/lib/image-measure"
import { contentTypeForRef, isFileImageRef, isPrivateBlobUrl, readStoredFile } from "@/lib/order-image"
import { confirmCustomer } from "@/lib/mail"
import { buyerOrder } from "@/lib/order-public"
import { listOrders, OrderStoreError, saveOrder, type StoredOrder } from "@/lib/orders-store"
import type { PrintSpec } from "@/lib/order-types"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"
import { parseContact } from "@/lib/shipping"
import { scorePrint } from "@/lib/quality"
import { imageBackend, imageUnavailableMessage, ordersAvailable } from "@/lib/storage-mode"
import { usdcFromPence } from "@/lib/usdc"

export const dynamic = "force-dynamic"

const RIGHTS_LINE = "I own or have permission to use this image."

type CreateBody = {
  materialId?: string
  sizeId?: string
  editionRun?: number
  dpi?: number
  rights?: boolean
  canvasEdge?: string
  artworkSlug?: string
  email?: string
  fullName?: string
  address?: string
  postcode?: string
  imageUrl?: string
  imageStore?: string
  imageContentType?: string
  city?: string
  country?: string
  phone?: string
  printSpec?: unknown
  paymentMethod?: string
}

type ClaimedImage = { imageUrl?: string; imageStore?: "file" | "blob"; imageContentType?: string }

async function claimedImage(
  body: CreateBody,
  customerPhoto: boolean,
): Promise<{ error: string; status: number } | { image: ClaimedImage }> {
  const imageUrl = body.imageUrl?.trim()
  const imageStore = body.imageStore
  if (!imageUrl && !imageStore) {
    if (customerPhoto) {
      return { error: "The print file is missing. Upload it again before paying.", status: 400 as const }
    }
    return { image: {} }
  }
  if ((imageStore !== "file" && imageStore !== "blob") || !imageUrl) {
    return { error: "The print file is not in the shop's store.", status: 400 as const }
  }
  const mode = imageBackend()
  if (mode === "unavailable") {
    return { error: imageUnavailableMessage() ?? "This shop cannot keep the photo yet.", status: 503 as const }
  }
  if (imageStore === "file") {
    if (mode !== "file" || !isFileImageRef(imageUrl)) {
      return { error: "The print file is not in the shop's store.", status: 400 as const }
    }
    const stored = await readStoredFile(imageUrl)
    if (!stored) return { error: "The print file was not saved. Upload it again.", status: 400 as const }
    return { image: { imageUrl, imageStore: "file", imageContentType: stored.contentType } }
  }
  if (mode !== "blob" || !isPrivateBlobUrl(imageUrl)) {
    return { error: "The print file is not in the shop's store.", status: 400 as const }
  }
  return {
    image: {
      imageUrl,
      imageStore: "blob",
      imageContentType: contentTypeForRef(imageUrl, body.imageContentType),
    },
  }
}

export async function GET(request: Request) {
  const { adminRequired } = await import("@/lib/admin-auth")
  const denied = adminRequired(request)
  if (denied) return denied
  if (!ordersAvailable()) {
    return Response.json({ error: "The order list is unavailable until the order store is connected." }, { status: 503 })
  }
  try {
    const orders = await listOrders()
    return Response.json({ orders })
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: "The order list is unavailable because the order store did not answer." }, { status: 503 })
    }
    throw error
  }
}

function customerSpec(value: unknown): { spec: Extract<PrintSpec, { kind: "customer" }> } | { error: string } {
  if (!value || typeof value !== "object") return { error: "The print spec is missing." }
  const spec = value as Record<string, unknown>
  const fit = spec.fit === "fit" || spec.fit === "fill" ? spec.fit : null
  const look = spec.look === "bw" || spec.look === "sepia" || spec.look === "original" ? spec.look : null
  const band = spec.qualityBand === "red" || spec.qualityBand === "amber" || spec.qualityBand === "green" ? spec.qualityBand : null
  if (!fit || !look || !band) return { error: "The print spec is not complete." }
  const dims = ["widthMm", "heightMm", "sourceWidth", "sourceHeight", "outputWidth", "outputHeight", "outputDpi"] as const
  const numbers: Record<(typeof dims)[number], number> = {
    widthMm: 0,
    heightMm: 0,
    sourceWidth: 0,
    sourceHeight: 0,
    outputWidth: 0,
    outputHeight: 0,
    outputDpi: 0,
  }
  for (const key of dims) {
    const parsed = Number(spec[key])
    if (!Number.isFinite(parsed) || parsed <= 0) return { error: "The print spec is not complete." }
    numbers[key] = parsed
  }
  const soft = spec.softPrintAcknowledged === true
  if ((band === "amber" || band === "red") && !soft) {
    return { error: "This size may print soft. Tick print it anyway before paying." }
  }
  const edge = spec.edge === "mirror" || spec.edge === "fold" || spec.edge === "colour" ? spec.edge : undefined
  const enhance = spec.enhance === "preview-only" ? "preview-only" : "none"
  return {
    spec: {
      kind: "customer",
      fit,
      look,
      colourOptimise: spec.colourOptimise === true,
      enhance,
      edge,
      ...numbers,
      qualityBand: band,
      softPrintAcknowledged: soft,
    },
  }
}

function shopOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") || "https"
  return host ? `${proto}://${host}` : "https://ochre-storefront.vercel.app"
}

export async function POST(request: Request) {
  if (!(await rateLimit(`order:${clientIp(request)}`, 8, 600))) return tooMany()
  if (!ordersAvailable()) {
    return Response.json(
      { error: "Checkout is closed until the order store is connected. Nothing was charged." },
      { status: 503 },
    )
  }
  let body: CreateBody
  try {
    body = (await request.json()) as CreateBody
  } catch {
    return Response.json({ error: "The order was not readable." }, { status: 400 })
  }

  if (body.rights !== true) {
    return Response.json({ error: "The rights tick is required before payment." }, { status: 400 })
  }

  const materialId = body.materialId
  const size = sizes.find((item) => item.id === body.sizeId)
  if (!materialId || !size || size.prices[materialId as keyof typeof size.prices] == null) {
    return Response.json({ error: "That material and size is not on sale." }, { status: 400 })
  }

  let material
  try {
    material = materialById(materialId as Parameters<typeof materialById>[0])
  } catch {
    return Response.json({ error: "Unknown material." }, { status: 400 })
  }

  if (!material.payable) {
    return Response.json({ error: `${material.name} is not priced for payment yet.` }, { status: 400 })
  }

  const work = body.artworkSlug ? workBySlug(body.artworkSlug) : undefined
  if (body.artworkSlug && !work) {
    return Response.json({ error: "That work is not in the house." }, { status: 400 })
  }

  const claimed = await claimedImage(body, !work)
  if ("error" in claimed) return Response.json({ error: claimed.error }, { status: claimed.status })

  if (!work && body.editionRun != null && body.editionRun !== 1) {
    return Response.json({ error: "A customer photo is made once." }, { status: 400 })
  }
  const editionRun = work ? work.editionSize : 1
  const contact = parseContact(body)
  if ("error" in contact) return Response.json({ error: contact.error }, { status: 400 })

  const editionKind = work ? "drop" : "upload"
  const editionNumber = editionKind === "upload" ? 1 : undefined
  const editionSize = work ? work.editionSize : 1
  const numbered = editionKind === "drop"
  const editionLabel = numbered
    ? `Edition of ${editionSize}. Your number is assigned when the payment clears.`
    : editionWording(editionKind, editionNumber ?? 1, editionSize)

  let printSpec: PrintSpec
  if (work) {
    printSpec = {
      kind: "house-stand-in",
      note: "This house work is still a stand-in drawing. There is no press file until the artist image replaces it.",
    }
  } else {
    const parsed = customerSpec(body.printSpec)
    if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    const measured = await measureClaimed(claimed.image)
    if (!measured) return Response.json({ error: "The print file's pixels could not be read." }, { status: 400 })
    const score = scorePrint(measured.width, measured.height, size.widthMm, size.heightMm)
    const band = score.band
    if ((band === "amber" || band === "red") && !parsed.spec.softPrintAcknowledged) {
      return Response.json({ error: "This size may print soft. Tick print it anyway before paying." }, { status: 400 })
    }
    printSpec = {
      ...parsed.spec,
      widthMm: size.widthMm,
      heightMm: size.heightMm,
      sourceWidth: measured.width,
      sourceHeight: measured.height,
      outputWidth: measured.width,
      outputHeight: measured.height,
      outputDpi: Math.max(1, Math.round(score.dpi)),
      qualityBand: band,
    }
  }

  const settings = solanaSettings()
  if (settings.cluster === "mainnet-beta" && settings.merchant === DEMO_MERCHANT) {
    return Response.json(
      { error: "Mainnet checkout needs NEXT_PUBLIC_MERCHANT_WALLET. The demo address cannot take real USDC." },
      { status: 500 },
    )
  }
  const quote = await gbpToUsdc()
  const pricePence = priceFor(size, material.id, { zone: contact.contact.zone, numbered })
  const usdcAmount = usdcFromPence(pricePence, quote.gbpToUsdc)
  const viewToken = crypto.randomUUID()
  const id = `OCH-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`
  const reference = Keypair.generate().publicKey
  const facing = size.orientation === "square" ? size.name : `${size.name} ${size.orientation}`
  const label = "Ochré"
  const message = `${material.name}, ${facing}`.slice(0, 80)

  const payUrl = encodeURL({
    recipient: new PublicKey(settings.merchant),
    amount: new BigNumber(usdcAmount) as never,
    splToken: new PublicKey(settings.mint),
    reference,
    label,
    message,
    memo: id,
  }).toString()

  const order: StoredOrder = {
    id,
    createdAt: new Date().toISOString(),
    status: "awaiting payment",
    materialId: material.id,
    materialName: material.name,
    sizeId: size.id,
    sizeName: facing,
    widthMm: size.widthMm,
    heightMm: size.heightMm,
    pricePence,
    usdcAmount,
    gbpToUsdc: quote.gbpToUsdc,
    fxSource: quote.source,
    editionRun,
    editionLabel,
    editionKind,
    editionNumber,
    editionSize,
    artworkSlug: work?.slug,
    artworkTitle: work?.title,
    email: contact.contact.email,
    fullName: contact.contact.fullName,
    address: contact.contact.address,
    city: contact.contact.city,
    postcode: contact.contact.postcode,
    country: contact.contact.country,
    phone: contact.contact.phone,
    viewToken,
    printSpec,
    dpi: printSpec.kind === "customer" ? printSpec.outputDpi : 0,
    rightsLine: RIGHTS_LINE,
    rightsAt: new Date().toISOString(),
    canvasEdge: body.canvasEdge,
    reference: reference.toBase58(),
    recipient: settings.merchant,
    mint: settings.mint,
    cluster: settings.cluster,
    rpc: "",
    memo: id,
    label,
    message,
    payUrl,
    paymentMethod: body.paymentMethod === "card" ? "card" : "usdc",
    ...claimed.image,
  }

  try {
    const saved = await saveOrder(order)
    const link = `${shopOrigin(request)}/orders/${saved.id}?t=${viewToken}`
    await confirmCustomer({
      to: saved.email || contact.contact.email,
      id: saved.id,
      summary: `${saved.materialName}, ${saved.sizeName}, ${saved.paymentMethod === "card" ? `£${(saved.pricePence / 100).toFixed(2)} by card (Stripe)` : `${saved.usdcAmount} USDC`}. Ship to ${saved.city}, ${saved.country}.`,
      link,
    })
    return Response.json({ order: buyerOrder(saved) }, { status: 201 })
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json(
        { error: "Checkout is paused because the order store did not answer. Nothing was charged." },
        { status: 503 },
      )
    }
    const message = error instanceof Error ? error.message : "The order could not be saved."
    const status = message === "This edition is complete." ? 409 : 500
    return Response.json({ error: message }, { status })
  }
}

async function measureClaimed(image: ClaimedImage) {
  if (!image.imageUrl || !image.imageStore) return null
  if (image.imageStore === "file") {
    const stored = await readStoredFile(image.imageUrl)
    return stored ? measureImage(stored.bytes) : null
  }
  try {
    const { get } = await import("@vercel/blob")
    const result = await get(image.imageUrl, { access: "private" })
    if (!result?.stream) return null
    const bytes = new Uint8Array(await new Response(result.stream).arrayBuffer())
    return measureImage(bytes)
  } catch (error) {
    console.error("measure-print", error instanceof Error ? error.message : "failed")
    return null
  }
}
