import { Keypair, PublicKey } from "@solana/web3.js"
import { encodeURL } from "@solana/pay"
import BigNumber from "bignumber.js"
import { formatPrice, materialById, priceFor, sizes } from "@/config/catalogue"
import { DEMO_MERCHANT, solanaSettings } from "@/config/solana"
import { workBySlug } from "@/config/works"
import { basketTotal, editionProblem, pieceCount, readLines } from "@/lib/basket-rules"
import { BasketStoreError, saveBasket } from "@/lib/baskets-store"
import { buyerBasket } from "@/lib/order-public"
import { gbpToUsdc } from "@/lib/fx"
import { confirmCustomer } from "@/lib/mail"
import { countPaid, deleteOrder, OrderStoreError, saveOrder } from "@/lib/orders-store"
import type { BasketLine, StoredBasket, StoredOrder } from "@/lib/order-types"
import { clientIp, rateLimit, tooMany } from "@/lib/rate-limit"
import { parseContact } from "@/lib/shipping"
import { ordersAvailable } from "@/lib/storage-mode"
import { stripeReady } from "@/lib/stripe"
import { usdcFromPence } from "@/lib/usdc"

export const dynamic = "force-dynamic"

/** House works carry the artist's own rights, so no customer image oath is asked for. */
const HOUSE_RIGHTS = "House work. No customer image."

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`

function shopOrigin(request: Request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") || "https"
  return host ? `${proto}://${host}` : "https://ochre-storefront.vercel.app"
}

const closed = (message = "Checkout is paused because the order store did not answer. Nothing was charged.") =>
  Response.json({ error: message }, { status: 503 })

export async function POST(request: Request) {
  if (!(await rateLimit(`basket:${clientIp(request)}`, 8, 600))) return tooMany()
  if (!ordersAvailable()) return closed("Checkout is closed until the order store is connected. Nothing was charged.")

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ error: "The basket was not readable." }, { status: 400 })
  }

  const read = readLines(body.lines)
  if ("error" in read) return Response.json({ error: read.error }, { status: 400 })
  const contact = parseContact(body as Parameters<typeof parseContact>[0])
  if ("error" in contact) return Response.json({ error: contact.error }, { status: 400 })
  const zone = contact.contact.zone

  // Price every line on the server. The browser only says what, which size, and how many.
  const priced: Array<Omit<BasketLine, "orderIds"> & { facing: string; widthMm: number; heightMm: number; editionSize: number }> = []
  for (const line of read.lines) {
    const work = workBySlug(line.slug)
    if (!work) return Response.json({ error: "A work in the basket is not in the house." }, { status: 400 })
    const size = sizes.find((item) => item.id === line.sizeId)
    if (!size || size.prices[line.materialId as keyof typeof size.prices] == null) {
      return Response.json({ error: `${work.title}: that material and size is not on sale.` }, { status: 400 })
    }
    let material
    try {
      material = materialById(line.materialId as Parameters<typeof materialById>[0])
    } catch {
      return Response.json({ error: "Unknown material." }, { status: 400 })
    }
    if (!material.payable) return Response.json({ error: `${material.name} is not priced for payment yet.` }, { status: 400 })
    const facing = size.orientation === "square" ? size.name : `${size.name} ${size.orientation}`
    priced.push({
      slug: work.slug,
      title: work.title,
      materialId: material.id,
      materialName: material.name,
      sizeId: size.id,
      sizeName: facing,
      facing,
      widthMm: size.widthMm,
      heightMm: size.heightMm,
      qty: line.qty,
      unitPence: priceFor(size, material.id, { zone, numbered: true }),
      editionSize: work.editionSize,
    })
  }

  let paid: Record<string, number> = {}
  try {
    const slugs = [...new Set(read.lines.map((line) => line.slug))]
    paid = Object.fromEntries(await Promise.all(slugs.map(async (slug) => [slug, await countPaid(slug)] as const)))
  } catch (error) {
    if (error instanceof OrderStoreError) return closed()
    throw error
  }
  const soldOut = editionProblem(read.lines, (slug) => workBySlug(slug), paid)
  if (soldOut) return Response.json({ error: soldOut }, { status: 409 })

  const settings = solanaSettings()
  if (settings.cluster === "mainnet-beta" && settings.merchant === DEMO_MERCHANT) {
    return Response.json({ error: "Mainnet checkout needs NEXT_PUBLIC_MERCHANT_WALLET. The demo address cannot take real USDC." }, { status: 500 })
  }

  const quote = await gbpToUsdc()
  const totalPence = basketTotal(priced)
  const pieces = pieceCount(priced)
  const id = newId("OCB")
  const reference = Keypair.generate().publicKey
  const label = "Ochré"
  const message = `Ochré basket, ${pieces} ${pieces === 1 ? "piece" : "pieces"}`
  const usdcAmount = usdcFromPence(totalPence, quote.gbpToUsdc)
  const payUrl = encodeURL({
    recipient: new PublicKey(settings.merchant),
    amount: new BigNumber(usdcAmount) as never,
    splToken: new PublicKey(settings.mint),
    reference,
    label,
    message,
    memo: id,
  }).toString()
  const now = new Date().toISOString()
  const method = body.paymentMethod === "card" ? "card" : "usdc"
  if (method === "card" && !stripeReady()) {
    return Response.json({ error: "Card checkout is not connected yet. Nothing was charged." }, { status: 503 })
  }
  const c = contact.contact

  // One order per piece, each waiting on the basket. They cannot be paid on their own.
  const children: StoredOrder[] = []
  const lines: BasketLine[] = priced.map((line) => {
    const orderIds: string[] = []
    for (let n = 0; n < line.qty; n += 1) {
      const orderId = newId("OCH")
      orderIds.push(orderId)
      children.push({
        id: orderId,
        createdAt: now,
        status: "awaiting payment",
        materialId: line.materialId,
        materialName: line.materialName,
        sizeId: line.sizeId,
        sizeName: line.facing,
        widthMm: line.widthMm,
        heightMm: line.heightMm,
        pricePence: line.unitPence,
        usdcAmount: usdcFromPence(line.unitPence, quote.gbpToUsdc),
        gbpToUsdc: quote.gbpToUsdc,
        fxSource: quote.source,
        editionRun: line.editionSize,
        editionLabel: `Edition of ${line.editionSize}. Your number is assigned when the payment clears.`,
        editionKind: "drop",
        editionSize: line.editionSize,
        artworkSlug: line.slug,
        artworkTitle: line.title,
        email: c.email,
        fullName: c.fullName,
        address: c.address,
        city: c.city,
        postcode: c.postcode,
        country: c.country,
        phone: c.phone,
        viewToken: crypto.randomUUID(),
        printSpec: {
          kind: "house-stand-in",
          note: "This house work is still a stand-in drawing. There is no press file until the artist image replaces it.",
        },
        dpi: 0,
        rightsLine: HOUSE_RIGHTS,
        rightsAt: now,
        reference: reference.toBase58(),
        recipient: settings.merchant,
        mint: settings.mint,
        cluster: settings.cluster,
        rpc: "",
        memo: id,
        label,
        message: `${line.materialName}, ${line.facing}`.slice(0, 80),
        payUrl: "",
        paymentMethod: method,
        basketId: id,
      })
    }
    return {
      slug: line.slug,
      title: line.title,
      materialId: line.materialId,
      materialName: line.materialName,
      sizeId: line.sizeId,
      sizeName: line.sizeName,
      qty: line.qty,
      unitPence: line.unitPence,
      orderIds,
    }
  })

  const basket: StoredBasket = {
    id,
    createdAt: now,
    status: "awaiting payment",
    lines,
    pieces,
    totalPence,
    usdcAmount,
    gbpToUsdc: quote.gbpToUsdc,
    fxSource: quote.source,
    email: c.email,
    fullName: c.fullName,
    address: c.address,
    city: c.city,
    postcode: c.postcode,
    country: c.country,
    phone: c.phone,
    viewToken: crypto.randomUUID(),
    reference: reference.toBase58(),
    recipient: settings.merchant,
    mint: settings.mint,
    cluster: settings.cluster,
    memo: id,
    label,
    message,
    payUrl,
    paymentMethod: method,
  }

  const saved: string[] = []
  try {
    for (const child of children) {
      await saveOrder(child)
      saved.push(child.id)
    }
    await saveBasket(basket)
  } catch (error) {
    // Leave nothing half-made behind.
    await Promise.allSettled(saved.map((orderId) => deleteOrder(orderId)))
    if (error instanceof OrderStoreError || error instanceof BasketStoreError) return closed()
    throw error
  }

  const link = `${shopOrigin(request)}/baskets/${id}?t=${basket.viewToken}`
  try {
    await confirmCustomer({
      to: c.email,
      id,
      summary: [
        ...lines.map((line) => `${line.qty} × ${line.title}, ${line.materialName}, ${line.sizeName}, ${formatPrice(line.unitPence)} each`),
        `Total ${method === "card" ? `${formatPrice(totalPence)} by card (Stripe)` : `${usdcAmount} USDC`}. Ship to ${c.city}, ${c.country}.`,
      ].join("\n"),
      link,
    })
  } catch {}
  return Response.json({ basket: buyerBasket(basket) }, { status: 201 })
}
