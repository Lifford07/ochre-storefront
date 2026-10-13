"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Buffer } from "buffer"
import { ConnectionProvider, useConnection, useWallet, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider, useWalletModal } from "@solana/wallet-adapter-react-ui"
import { buildWalletAdapters } from "@/lib/wallet-adapters"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { createTransfer } from "@solana/pay"
import { PublicKey } from "@solana/web3.js"
import BigNumber from "bignumber.js"
import QRCode from "qrcode"
import "@solana/wallet-adapter-react-ui/styles.css"
import { formatPrice, priceFor, sizes, type MaterialId } from "@/config/catalogue"
import { Whorl } from "@/components/brand/mark"
import { DeliveryNote } from "@/components/checkout/delivery-note"
import type { PrintSpec, StoredOrder } from "@/lib/order-types"
import { renderPrintFile } from "@/lib/render-print"
import { COUNTRIES, parseContact } from "@/lib/shipping"

if (typeof window !== "undefined") {
  const target = window as Window & { Buffer?: typeof Buffer }
  target.Buffer = target.Buffer ?? Buffer
}

export type PaySummary = {
  title: string
  materialName: string
  sizeName: string
  editionLabel: string
  dpi: number
  bandLabel: string
  lead: string
  previewSrc?: string
}

export type PrintJob = {
  width: number
  height: number
  widthMm: number
  heightMm: number
  offsetX: number
  offsetY: number
  fit: "fill" | "fit"
  filter?: string
  edge?: "mirror" | "fold" | "colour"
  edgeColour?: string
  look: "original" | "bw" | "sepia"
  colourOptimise: boolean
  enhance: "preview-only" | "none"
  qualityBand: "red" | "amber" | "green"
  softPrintAcknowledged: boolean
}

type PayPanelProps = {
  materialId: string
  sizeId: string
  editionRun: number
  dpi: number
  canvasEdge?: string
  pricePence: number
  artworkSlug?: string
  photoBlob?: Blob
  printJob?: PrintJob
  summary: PaySummary
}

function networkLabel() {
  return process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" ? "Solana mainnet" : "Solana devnet"
}

async function storePhoto(blob: Blob) {
  const ticketResponse = await fetch("/api/uploads/ticket", { method: "POST" })
  const ticketBody = (await ticketResponse.json()) as { ticket?: string; mode?: string; error?: string }
  if (!ticketResponse.ok || !ticketBody.ticket || !ticketBody.mode) {
    throw new Error(ticketBody.error || "The print file could not be saved.")
  }
  const contentType = blob.type === "image/png" || blob.type === "image/webp" ? blob.type : "image/jpeg"
  const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg"
  if (ticketBody.mode === "blob") {
    const { upload } = await import("@vercel/blob/client")
    const stored = await upload(`orders/print.${extension}`, blob, {
      access: "private",
      handleUploadUrl: "/api/blob",
      clientPayload: ticketBody.ticket,
      contentType,
      multipart: blob.size > 4 * 1024 * 1024,
    })
    return {
      imageUrl: stored.url,
      imageStore: "blob" as const,
      imageContentType: stored.contentType || contentType,
    }
  }
  const form = new FormData()
  form.set("ticket", ticketBody.ticket)
  form.set("file", blob, `print.${extension}`)
  const response = await fetch("/api/uploads", { method: "POST", body: form })
  const body = (await response.json()) as {
    imageUrl?: string
    imageStore?: string
    imageContentType?: string
    error?: string
  }
  if (!response.ok || !body.imageUrl || body.imageStore !== "file") {
    throw new Error(body.error || "The print file could not be saved.")
  }
  return { imageUrl: body.imageUrl, imageStore: "file" as const, imageContentType: body.imageContentType || contentType }
}

type Contact = { email: string; fullName: string; address: string; city: string; postcode: string; country: string; phone: string }

export function PayPanel(props: PayPanelProps) {
  const [order, setOrder] = useState<StoredOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [attested, setAttested] = useState(false)
  const [contact, setContact] = useState<Contact>({ email: "", fullName: "", address: "", city: "", postcode: "", country: "GB", phone: "" })
  const lock = useRef(false)
  const contactOk = !("error" in parseContact(contact))

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const raw = sessionStorage.getItem("ochre-open-order")
      if (!raw) return
      try {
        const saved = JSON.parse(raw) as StoredOrder
        if (saved?.payUrl && saved.status !== "paid, awaiting Ochré check") setOrder(saved)
      } catch {
        sessionStorage.removeItem("ochre-open-order")
      }
    }, 0)
    return () => window.clearTimeout(handle)
  }, [])

  async function start(method: "usdc" | "card" = "usdc") {
    if (lock.current || !attested || !contactOk) return
    lock.current = true
    setStarting(true)
    setError(null)
    try {
      const contactResult = parseContact(contact)
      if ("error" in contactResult) throw new Error(contactResult.error)
      if (!props.artworkSlug && (!props.photoBlob || !props.printJob)) {
        throw new Error("The print file is missing. Upload it again before paying.")
      }
      let image: { imageUrl?: string; imageStore?: "blob" | "file"; imageContentType?: string } = {}
      let printSpec: PrintSpec | undefined
      if (props.photoBlob && props.printJob) {
        const rendered = await renderPrintFile({
          blob: props.photoBlob,
          imageWidth: props.printJob.width,
          imageHeight: props.printJob.height,
          widthMm: props.printJob.widthMm,
          heightMm: props.printJob.heightMm,
          offsetX: props.printJob.offsetX,
          offsetY: props.printJob.offsetY,
          fit: props.printJob.fit,
          filter: props.printJob.filter,
          edge: props.printJob.edge,
          edgeColour: props.printJob.edgeColour,
        })
        image = await storePhoto(rendered.blob)
        printSpec = {
          kind: "customer",
          fit: props.printJob.fit,
          look: props.printJob.look,
          colourOptimise: props.printJob.colourOptimise,
          enhance: props.printJob.enhance,
          edge: props.printJob.edge,
          widthMm: props.printJob.widthMm,
          heightMm: props.printJob.heightMm,
          sourceWidth: props.printJob.width,
          sourceHeight: props.printJob.height,
          outputWidth: rendered.width,
          outputHeight: rendered.height,
          outputDpi: rendered.dpi,
          qualityBand: props.printJob.qualityBand,
          softPrintAcknowledged: props.printJob.softPrintAcknowledged,
        }
      }
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          materialId: props.materialId,
          sizeId: props.sizeId,
          editionRun: props.editionRun,
          dpi: props.dpi,
          rights: true,
          canvasEdge: props.canvasEdge,
          artworkSlug: props.artworkSlug,
          email: contact.email,
          fullName: contact.fullName,
          address: contact.address,
          city: contact.city,
          postcode: contact.postcode,
          country: contact.country,
          phone: contact.phone,
          printSpec,
          paymentMethod: method,
          ...image,
        }),
      })
      const body = (await response.json()) as { order?: StoredOrder; error?: string }
      if (!response.ok || !body.order) throw new Error(body.error || "The order could not be opened.")
      if (method === "card") {
        const card = await fetch(`/api/orders/${body.order.id}/stripe`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ t: body.order.viewToken }),
        })
        const cardBody = (await card.json()) as { url?: string; error?: string }
        if (!card.ok || !cardBody.url) throw new Error(cardBody.error || "Card checkout could not be opened.")
        window.location.assign(cardBody.url)
        return
      }
      setOrder(body.order)
      sessionStorage.setItem("ochre-open-order", JSON.stringify(body.order))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The order could not be opened.")
    } finally {
      lock.current = false
      setStarting(false)
    }
  }

  const zone = COUNTRIES.find((item) => item.code === contact.country)?.zone ?? "UK"
  const size = sizes.find((item) => item.id === props.sizeId)
  const livePrice = size
    ? priceFor(size, props.materialId as MaterialId, { zone, numbered: props.editionRun > 1 || Boolean(props.artworkSlug) })
    : props.pricePence

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.85fr)]">
      <div className="space-y-8">
        <section>
          <p className="eyebrow">01 · Contact & delivery</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Email" value={contact.email} placeholder="you@example.com" onChange={(email) => setContact({ ...contact, email })} />
            <Field label="Full name" value={contact.fullName} placeholder="Your name" onChange={(fullName) => setContact({ ...contact, fullName })} />
            <Field label="Address" value={contact.address} placeholder="House number and street" onChange={(address) => setContact({ ...contact, address })} />
            <Field label="City" value={contact.city} placeholder="City" onChange={(city) => setContact({ ...contact, city })} />
            <Field label="Postcode" value={contact.postcode} placeholder="Postcode" onChange={(postcode) => setContact({ ...contact, postcode })} />
            <label className="block">
              <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--mute)] uppercase">Country</span>
              <select
                value={contact.country}
                onChange={(event) => setContact({ ...contact, country: event.target.value })}
                className="mt-1 w-full border-0 border-b border-[var(--line)] bg-transparent py-2 text-sm outline-none"
              >
                {COUNTRIES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Phone, optional" value={contact.phone} placeholder="—" onChange={(phone) => setContact({ ...contact, phone })} />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">02 · Payment</p>
            <span className="tag">{networkLabel()}</span>
          </div>
          <p className="mt-4 border border-[var(--navy)] bg-[var(--navy)] px-3 py-3 text-sm text-[var(--porcelain)]">
            Solana Pay · USDC
          </p>

          {order && attested ? (
            <WalletShell cluster={order.cluster}>
              <Payment order={order} onPaid={setOrder} />
            </WalletShell>
          ) : order ? (
            <p className="mt-4 text-sm text-[var(--charcoal)]">Tick the rights line to show the payment again.</p>
          ) : (
            <div className="mt-4 border border-[var(--line)] bg-[var(--paper)] px-4 py-8 text-center">
              <p className="font-display text-4xl">{formatPrice(livePrice)}</p>
              <p className="mt-2 text-sm text-[var(--mute)]">The USDC amount and the code appear when you pay. {networkLabel()}.</p>
            </div>
          )}
        </section>

        <label className="flex items-start gap-3 border border-[var(--gold)]/70 bg-[var(--paper)] px-4 py-4">
          <input
            type="checkbox"
            checked={attested}
            onChange={(event) => setAttested(event.target.checked)}
            className="mt-1 size-4 accent-[var(--navy)]"
          />
          <span>
            <span className="block text-sm">I own or have permission to use this image.</span>
            <span className="mt-1 block text-xs text-[var(--mute)]">
              Required for every order. <a className="underline" href="/terms#image-rights">Read our image rights policy.</a>
            </span>
          </span>
        </label>
        {error ? <p className="text-sm text-[var(--bad)]">{error}</p> : null}
        <p className="text-xs leading-relaxed text-[var(--mute)]">
          Payment is confirmed on Solana within seconds. Your certificate will be issued after that. It is not minted on-chain yet.
        </p>
      </div>

      <aside className="border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[var(--shadow-card)]">
        <p className="eyebrow">Your order</p>
        <div className="mt-4 flex gap-3">
          {props.summary.previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={props.summary.previewSrc} alt="" className="size-16 object-cover" />
          ) : (
            <div className="size-16 bg-[var(--bone)]" />
          )}
          <div>
            <p className="font-display text-2xl italic">{props.summary.title}</p>
            <p className="text-sm text-[var(--ok)]">● {props.summary.bandLabel}</p>
          </div>
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <Row label="Material" value={props.summary.materialName} />
          <Row label="Size" value={props.summary.sizeName} />
          <Row label="Edition" value={order?.editionLabel ?? props.summary.editionLabel} />
          <Row label="Artwork" value={formatPrice(order?.pricePence ?? livePrice)} />
          <Row label="Delivery" value="Included in the landed price" />
          <Row label="Arrives" value={props.summary.lead} />
        </dl>
        <DeliveryNote materialId={props.materialId} className="mt-4" />
        <div className="mt-4 flex items-end justify-between border-t border-[var(--navy)] pt-4">
          <span className="text-lg">Total</span>
          <span className="text-right">
            <span className="block font-display text-3xl">{order ? `${order.usdcAmount} USDC` : formatPrice(livePrice)}</span>
            {order ? <span className="text-xs text-[var(--mute)]">{formatPrice(order.pricePence)}</span> : null}
          </span>
        </div>
        {order ? null : (
          <button type="button" className="btn-foil mt-5 w-full" disabled={!attested || !contactOk || starting} onClick={() => void start("card")}>
            {starting ? (props.photoBlob ? "Saving the print…" : "Preparing…") : "Pay by card"}
          </button>
        )}
        {order ? null : (
          <>
            <p className="mt-2 text-center font-mono text-[10px] tracking-[0.16em] text-[var(--mute)] uppercase">Visa · Mastercard · Amex · Apple Pay · Google Pay</p>
            <button type="button" className="mt-3 w-full border border-[var(--navy)] px-4 py-3 text-sm tracking-[0.08em] uppercase disabled:opacity-40" disabled={!attested || !contactOk || starting} onClick={() => void start("usdc")}>
              Or pay with USDC (Solana Pay)
            </button>
          </>
        )}
        {!attested ? <p className="mt-2 text-xs text-[var(--mute)]">Tick the rights line before payment.</p> : null}
        {!contactOk ? <p className="mt-2 text-xs text-[var(--mute)]">Add a valid email, name, street, city, postcode, and country.</p> : null}
        <p className="mt-3 text-center text-xs text-[var(--mute)]">Or scan the code. Both finish the same way.</p>
        <div className="mt-5 bg-[var(--navy)] px-4 py-3 text-sm text-[var(--porcelain)]">
          <span className="text-[var(--gold)]">Certificate included.</span> A numbered certificate will be issued when payment clears. It is awaiting the mint.
        </div>
      </aside>
    </div>
  )
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--mute)] uppercase">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border-0 border-b border-[var(--line)] bg-transparent py-2 text-sm outline-none focus:border-b-2 focus:border-[var(--gold)]"
      />
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-2">
      <dt className="text-[var(--mute)]">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}

function WalletShell({
  cluster,
  children,
}: {
  cluster: StoredOrder["cluster"]
  children: ReactNode
}) {
  const network = cluster === "devnet" && process.env.NEXT_PUBLIC_SOLANA_CLUSTER !== "mainnet-beta"
    ? WalletAdapterNetwork.Devnet
    : WalletAdapterNetwork.Mainnet
  const wallets = useMemo(() => buildWalletAdapters(network), [network])
  const endpoint = typeof window === "undefined" ? "https://api.mainnet-beta.solana.com" : `${window.location.origin}/api/rpc`
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

function Payment({ order, onPaid }: { order: StoredOrder; onPaid: (order: StoredOrder) => void }) {
  const router = useRouter()
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected } = useWallet()
  const { setVisible } = useWalletModal()
  const [qr, setQr] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [waiting, setWaiting] = useState(true)
  const [paid, setPaid] = useState<StoredOrder | null>(order.status === "paid, awaiting Ochré check" ? order : null)

  useEffect(() => {
    let cancel = false
    void QRCode.toDataURL(order.payUrl, { width: 280, margin: 1, color: { dark: "#0B1332", light: "#FBF9F5" } }).then((url) => {
      if (!cancel) setQr(url)
    })
    return () => {
      cancel = true
    }
  }, [order.payUrl])

  useEffect(() => {
    if (paid) return
    let stop = false
    const waits = [2000, 5000, 15000]
    async function poll() {
      let elapsed = 0
      let step = 0
      while (!stop && elapsed < 15 * 60 * 1000) {
        try {
          const response = await fetch(`/api/orders/${order.id}/confirm`, { method: "POST" })
          const body = (await response.json()) as { found?: boolean; order?: StoredOrder; error?: string }
          if (body.order?.status === "paid, awaiting Ochré check") {
            setPaid(body.order)
            onPaid(body.order)
            setWaiting(false)
            sessionStorage.removeItem("ochre-open-order")
            const token = body.order.viewToken ? `?t=${body.order.viewToken}` : ""
            router.push(`/orders/${order.id}${token}`)
            return
          }
          if (response.status === 429) setError("Checking a little less often.")
        } catch {
          // The next poll retries. A single network blip should not end the payment.
        }
        const wait = waits[Math.min(step, waits.length - 1)]
        step += 1
        elapsed += wait
        await new Promise((resolve) => setTimeout(resolve, wait))
      }
      if (!stop) setWaiting(false)
    }
    void poll()
    return () => {
      stop = true
    }
  }, [order.id, onPaid, paid, router])

  async function payWithWallet() {
    if (!publicKey) {
      setVisible(true)
      return
    }
    setPaying(true)
    setError(null)
    try {
      const transaction = await createTransfer(connection, publicKey, {
        recipient: new PublicKey(order.recipient),
        amount: new BigNumber(order.usdcAmount) as never,
        splToken: new PublicKey(order.mint),
        reference: new PublicKey(order.reference),
        memo: order.memo,
      })
      await sendTransaction(transaction, connection)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "The wallet did not send the payment."
      setError(message)
    } finally {
      setPaying(false)
    }
  }

  const origin = typeof window === "undefined" ? "https://ochre-storefront.vercel.app" : window.location.origin
  const phantom = `https://phantom.app/ul/v1/browse/${encodeURIComponent(order.payUrl)}?ref=${encodeURIComponent(origin)}`
  const solflare = `https://solflare.com/ul/v1/browse/${encodeURIComponent(order.payUrl)}?ref=${encodeURIComponent(origin)}`

  return (
    <div className="mt-4 border border-[var(--line)] bg-[var(--paper)] p-4">
      <div className="grid items-center gap-4 sm:grid-cols-[140px_1fr]">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt="Solana Pay QR code" width={140} height={140} className="bg-[var(--paper)]" />
        ) : (
          <div className="grid size-[140px] place-items-center text-xs text-[var(--mute)]">Drawing the code…</div>
        )}
        <div>
          <p className="text-sm text-[var(--mute)]">Scan with your Solana wallet to pay</p>
          <p className="font-display text-5xl leading-none">{order.usdcAmount}</p>
          <p className="text-sm text-[var(--mute)]">USDC · {formatPrice(order.pricePence)}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a className="btn-ghost text-center" href={phantom}>
          Open in Phantom
        </a>
        <a className="btn-ghost text-center" href={solflare}>
          Open in Solflare
        </a>
      </div>
      <p className="mt-3 text-sm text-[var(--charcoal)]">
        On desktop?{" "}
        <button type="button" className="lnk" onClick={() => void payWithWallet()} disabled={paying}>
          {paying ? "Waiting for the wallet…" : connected ? "Pay from this wallet" : "Connect a wallet"}
        </button>{" "}
        instead.
      </p>
      <p className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-[var(--mute)] uppercase">
        <Whorl className="size-4 text-[var(--gold-ink)]" spin={waiting && !paid} />
        {paid ? "Payment seen" : waiting ? "Waiting for payment" : "Check again if you have paid"}
      </p>
      {paid || waiting ? null : (
        <button type="button" className="lnk mt-3 text-sm" onClick={() => { setWaiting(true); setPaid(null) }}>
          Check again
        </button>
      )}
      {error ? <p className="mt-3 text-sm text-[var(--bad)]">{error}</p> : null}
    </div>
  )
}
