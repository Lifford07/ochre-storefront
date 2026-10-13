"use client"

import { useCallback, useEffect, useState } from "react"
import { SiteHeader } from "@/components/shell/site-chrome"
import { formatPrice } from "@/config/catalogue"
import type { PrintSpec, StoredOrder } from "@/lib/order-types"

type Gate = "loading" | "locked" | "unconfigured" | "open"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gate, setGate] = useState<Gate>("loading")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/orders", { cache: "no-store" })
      if (response.status === 401) {
        setGate("locked")
        setOrders(null)
        return
      }
      if (response.status === 503) {
        setGate("unconfigured")
        return
      }
      if (!response.ok) throw new Error("The order list did not load.")
      const body = (await response.json()) as { orders: StoredOrder[] }
      setGate("open")
      setOrders(body.orders)
      setError(null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The order list did not load.")
    }
  }, [])

  useEffect(() => {
    const handle = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(handle)
  }, [load])

  useEffect(() => {
    if (gate !== "open") return
    const timer = setInterval(() => void load(), 30000)
    return () => clearInterval(timer)
  }, [gate, load])

  async function signIn() {
    setBusy(true)
    setError(null)
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const body = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(body.error || "The order desk stayed locked.")
      setPassword("")
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The order desk stayed locked.")
    } finally {
      setBusy(false)
    }
  }

  async function recheck() {
    setBusy(true)
    setNote(null)
    try {
      const response = await fetch("/api/admin/reconcile", { method: "POST" })
      const body = (await response.json()) as { paid?: string[]; error?: string }
      if (!response.ok) throw new Error(body.error || "The payment check did not finish.")
      setNote(body.paid?.length ? `Payment recorded for ${body.paid.join(", ")}.` : "No new payments.")
      await load()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The payment check did not finish.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-10">
        <p className="text-xs tracking-[0.18em] text-[#5e574e]">OCHRÉ · ORDERS</p>
        <h1 className="mt-2 font-serif text-4xl">Awaiting a look</h1>
        <p className="mt-2 text-sm text-[#5e574e]">
          Paid orders wait here for a person to check the image, the size, the material, and the shipping address before anything is printed.
        </p>
        {gate === "unconfigured" ? (
          <p className="mt-6 text-sm text-[#8d3428]">Set ADMIN_PASSWORD before the order desk can open.</p>
        ) : null}
        {gate === "locked" ? (
          <form
            className="mt-8 max-w-sm space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              void signIn()
            }}
          >
            <label className="block text-sm">
              Order desk password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full border border-border bg-[#faf6f1] px-3 py-2"
                autoComplete="current-password"
              />
            </label>
            <button type="submit" className="btn-foil" disabled={busy || password.length === 0}>
              {busy ? "Checking…" : "Open the desk"}
            </button>
          </form>
        ) : null}
        {error ? <p className="mt-6 text-sm text-[#8d3428]">{error}</p> : null}
        {gate === "open" ? (
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <button type="button" className="underline" onClick={() => void load()}>
              Refresh
            </button>
            <button type="button" className="underline" disabled={busy} onClick={() => void recheck()}>
              Recheck unpaid payments
            </button>
            <a className="underline" href="/api/admin/export">
              Download order export
            </a>
          </div>
        ) : null}
        {note ? <p className="mt-3 text-sm text-[#5e574e]">{note}</p> : null}
        {gate === "loading" ? <p className="mt-8 text-sm text-[#5e574e]">Loading orders…</p> : null}
        {orders?.length === 0 ? <p className="mt-8 text-sm text-[#5e574e]">No orders yet.</p> : null}
        <ul className="mt-8 space-y-4">
          {orders?.map((order) => (
            <li key={order.id} className="border border-border bg-[#faf6f1] px-4 py-4">
              <div className="flex gap-4">
                {order.imageStore ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/orders/${order.id}/image`} alt="" className="size-20 shrink-0 object-cover" />
                ) : (
                  <div className="grid size-20 shrink-0 place-items-center bg-[#efe8df] px-2 text-center text-[10px] tracking-wide text-[#5e574e] uppercase">
                    {order.artworkTitle ? "House edition" : "No print file"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-serif text-2xl">{order.id}</p>
                    <p className="text-sm">{order.status}</p>
                  </div>
                  <p className="mt-2 text-sm">
                    {order.materialName} · {order.sizeName} · {order.editionLabel}
                  </p>
                  <p className="mt-2 text-sm">
                    {order.fullName || "No name"}
                    {order.email ? ` · ${order.email}` : ""}
                    {order.phone ? ` · ${order.phone}` : ""}
                  </p>
                  <p className="text-sm text-[#5e574e]">
                    {[order.address, order.city, order.postcode, order.country].filter(Boolean).join(", ") || "No address"}
                  </p>
                  <p className="mt-2 text-sm text-[#5e574e]">{specLine(order.printSpec)}</p>
                  <p className="mt-1 text-sm text-[#5e574e]">Payer: {order.payer || "Not recorded yet"}</p>
                  {order.paymentFlags?.length ? (
                    <p className="mt-1 text-sm text-[#8d3428]">Payment note: {order.paymentFlags.join(", ")}</p>
                  ) : null}
                  <p className="mt-2 flex flex-wrap gap-4 text-sm">
                    <a className="underline" href={`/orders/${order.id}${order.viewToken ? `?t=${order.viewToken}` : ""}`}>
                      Certificate
                    </a>
                    {order.imageStore ? (
                      <a className="underline" href={`/api/orders/${order.id}/image?download=1`}>
                        Download print file
                      </a>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-[#5e574e]">
                    {formatPrice(order.pricePence)} · {order.usdcAmount} USDC ·{" "}
                    {process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta" || order.cluster === "mainnet-beta"
                      ? "Solana mainnet"
                      : "Solana devnet"}
                  </p>
                  {order.solscanUrl ? (
                    <a className="mt-2 inline-block text-sm underline" href={order.solscanUrl} target="_blank" rel="noreferrer">
                      {order.signature}
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-[#5e574e]">Not paid yet.</p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}

function specLine(spec: PrintSpec | undefined) {
  if (!spec) return "No print spec."
  if (spec.kind === "house-stand-in") return spec.note
  const look = spec.look === "bw" ? "black and white" : spec.look === "sepia" ? "sepia" : "original colour"
  const colour = spec.colourOptimise ? "colour optimise on" : "colour optimise off"
  const soft = spec.softPrintAcknowledged ? " · print it anyway" : ""
  return `${spec.outputWidth}×${spec.outputHeight}px at ${spec.outputDpi} DPI · ${spec.fit} · ${look} · ${colour} · enhance ${spec.enhance}${spec.edge ? ` · edge ${spec.edge}` : ""}${soft}`
}
