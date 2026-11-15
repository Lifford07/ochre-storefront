"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { formatPrice, priceFor, sizes, type MaterialId } from "@/config/catalogue"
import { UsdcPay } from "@/components/checkout/pay-panel"
import { CheckoutHeader } from "@/components/shell/site-chrome"
import { useBasket, type BasketItem } from "@/lib/basket"
import type { BuyerBasket } from "@/lib/order-public"
import { COUNTRIES, parseContact } from "@/lib/shipping"

type Contact = { email: string; fullName: string; address: string; city: string; postcode: string; country: string; phone: string }

const OPEN = "ochre-open-basket"

/** Price for the country chosen. The server prices again; this only shows the same number first. */
function unitFor(item: BasketItem, zone: ReturnType<typeof zoneOf>) {
  const size = sizes.find((entry) => entry.id === item.sizeId)
  if (!size) return item.pricePence
  try {
    return priceFor(size, item.materialId as MaterialId, { zone, numbered: true })
  } catch {
    return item.pricePence
  }
}

function zoneOf(country: string) {
  return COUNTRIES.find((item) => item.code === country)?.zone ?? "UK"
}

export function BasketCheckout() {
  const { items } = useBasket()
  const [ready, setReady] = useState(false)
  const [contact, setContact] = useState<Contact>({ email: "", fullName: "", address: "", city: "", postcode: "", country: "GB", phone: "" })
  const [tried, setTried] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<"card" | "usdc" | null>(null)
  const [open, setOpen] = useState<BuyerBasket | null>(null)
  const [cancelled, setCancelled] = useState(false)
  const lock = useRef(false)

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setReady(true)
      setCancelled(new URLSearchParams(window.location.search).has("cancelled"))
      try {
        const saved = JSON.parse(sessionStorage.getItem(OPEN) || "null") as BuyerBasket | null
        if (saved?.payUrl && saved.status === "awaiting payment") setOpen(saved)
      } catch {
        sessionStorage.removeItem(OPEN)
      }
    }, 0)
    return () => window.clearTimeout(handle)
  }, [])

  const zone = zoneOf(contact.country)
  const lines = items.map((item) => ({ item, unit: unitFor(item, zone) }))
  const total = lines.reduce((sum, line) => sum + line.unit * line.item.qty, 0)
  const pieces = items.reduce((sum, item) => sum + item.qty, 0)
  const parsed = parseContact(contact)
  const contactOk = !("error" in parsed)

  async function pay(method: "card" | "usdc") {
    setTried(true)
    if (lock.current) return
    if (!contactOk) {
      setError("error" in parsed ? parsed.error : "Add your delivery details.")
      document.getElementById("co-email")?.focus()
      return
    }
    lock.current = true
    setBusy(method)
    setError(null)
    try {
      const response = await fetch("/api/baskets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...contact,
          paymentMethod: method,
          lines: items.map((item) => ({ slug: item.slug, materialId: item.materialId, sizeId: item.sizeId, qty: item.qty })),
        }),
      })
      const body = (await response.json()) as { basket?: BuyerBasket; error?: string }
      if (!response.ok || !body.basket) throw new Error(body.error || "The order could not be opened. Nothing was charged.")
      if (method === "card") {
        const card = await fetch(`/api/baskets/${body.basket.id}/stripe`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ t: body.basket.viewToken }),
        })
        const cardBody = (await card.json()) as { url?: string; error?: string }
        if (!card.ok || !cardBody.url) throw new Error(cardBody.error || "Card checkout could not be opened. Nothing was charged.")
        window.location.assign(cardBody.url)
        return
      }
      setOpen(body.basket)
      sessionStorage.setItem(OPEN, JSON.stringify(body.basket))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The order could not be opened. Nothing was charged.")
    } finally {
      lock.current = false
      setBusy(null)
    }
  }

  if (ready && items.length === 0 && !open) {
    return (
      <>
        <CheckoutHeader />
        <main className="mx-auto max-w-xl px-5 py-16" data-testid="checkout-empty">
          <h1 className="font-display text-4xl">
            Nothing to check out <span className="italic">yet</span>
          </h1>
          <p className="mt-3 text-[var(--charcoal)]">Your basket is empty. Pieces you choose are kept there while you look around.</p>
          <Link href="/collection" className="btn-foil mt-8 inline-flex">
            See the collection
          </Link>
        </main>
      </>
    )
  }

  const summary = (
    <>
      <ul className="divide-y divide-[var(--line)]" data-testid="checkout-lines">
        {lines.map(({ item, unit }) => (
          <li key={item.key} className="flex items-center gap-3 py-3">
            <div className="aspect-[4/5] w-12 shrink-0 overflow-hidden bg-[var(--navy)]">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display truncate text-lg italic leading-tight">{item.title}</p>
              <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--mute)] uppercase">
                {item.materialName} · {item.sizeName}
              </p>
              <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--mute)] uppercase">
                {item.qty} × {formatPrice(unit)}
              </p>
            </div>
            <p className="font-display whitespace-nowrap">{formatPrice(unit * item.qty)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-2 space-y-2 border-t border-[var(--line)] pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--mute)]">Delivery to {COUNTRIES.find((item) => item.code === contact.country)?.name ?? "you"}</dt>
          <dd>Included</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--mute)]">Certificate of authenticity</dt>
          <dd>Included, one per piece</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-[var(--navy)] pt-3">
          <dt className="text-base">Total</dt>
          <dd className="font-display text-3xl" data-testid="checkout-total">
            {formatPrice(open ? open.totalPence : total)}
          </dd>
        </div>
      </dl>
    </>
  )

  return (
    <>
      <CheckoutHeader />
      <main className="page-enter mx-auto max-w-5xl px-4 pt-6 pb-16 md:px-8 md:pt-8">
        <h1 className="font-display text-center text-4xl md:text-6xl">
          Where is it <span className="italic">going?</span>
        </h1>
        <p className="mt-2 text-center text-[var(--charcoal)]">
          {pieces} {pieces === 1 ? "piece" : "pieces"}, one payment. Each piece is numbered when the payment clears.
        </p>
        {cancelled && !open ? (
          <p className="mx-auto mt-4 max-w-xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-center text-sm" role="status">
            The card payment was cancelled. Nothing was charged.
          </p>
        ) : null}

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.85fr)]">
          <div className="space-y-8">
            <details className="group border border-[var(--line)] bg-[var(--paper)] lg:hidden" data-testid="order-fold">
              <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="eyebrow block">Your order</span>
                  <span className="block text-sm">
                    {pieces} {pieces === 1 ? "piece" : "pieces"}
                  </span>
                </span>
                <span className="font-display text-xl">{formatPrice(open ? open.totalPence : total)}</span>
                <span aria-hidden className="text-xs transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <div className="border-t border-[var(--line)] px-4 pb-4">{summary}</div>
            </details>

            {open ? (
              <section data-testid="usdc-box">
                <p className="eyebrow">Pay with USDC</p>
                <p className="mt-2 text-sm text-[var(--charcoal)]">
                  One transfer covers the whole basket. Order {open.id}. A confirmation has gone to your email.
                </p>
                <UsdcPay
                  cluster={open.cluster}
                  target={{
                    id: open.id,
                    payUrl: open.payUrl,
                    usdcAmount: open.usdcAmount,
                    pricePence: open.totalPence,
                    recipient: open.recipient,
                    mint: open.mint,
                    reference: open.reference,
                    memo: open.memo,
                    status: open.status,
                    viewToken: open.viewToken,
                  }}
                />
                <button
                  type="button"
                  className="lnk mt-4 min-h-11 text-sm"
                  onClick={() => {
                    sessionStorage.removeItem(OPEN)
                    setOpen(null)
                  }}
                >
                  Change details or pay by card instead
                </button>
              </section>
            ) : (
              <section>
                <p className="eyebrow">01 · Where it is going</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field id="co-email" label="Email" type="email" auto="email" value={contact.email} onChange={(email) => setContact({ ...contact, email })} />
                  <Field id="co-name" label="Full name" auto="name" value={contact.fullName} onChange={(fullName) => setContact({ ...contact, fullName })} />
                  <Field id="co-address" label="Address" auto="street-address" value={contact.address} onChange={(address) => setContact({ ...contact, address })} />
                  <Field id="co-city" label="Town or city" auto="address-level2" value={contact.city} onChange={(city) => setContact({ ...contact, city })} />
                  <Field id="co-postcode" label="Postcode" auto="postal-code" value={contact.postcode} onChange={(postcode) => setContact({ ...contact, postcode })} />
                  <label className="block">
                    <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--mute)] uppercase">Country</span>
                    <select
                      value={contact.country}
                      onChange={(event) => setContact({ ...contact, country: event.target.value })}
                      className="mt-1 min-h-11 w-full border-0 border-b border-[var(--line)] bg-transparent py-2 text-base outline-none"
                      autoComplete="country"
                    >
                      {COUNTRIES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field id="co-phone" label="Phone, optional, for the courier" type="tel" auto="tel" value={contact.phone} onChange={(phone) => setContact({ ...contact, phone })} />
                </div>
              </section>
            )}
          </div>

          <aside className="border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[var(--shadow-card)]">
            <div className="hidden lg:block">
              <p className="eyebrow">Your order</p>
              <div className="mt-2">{summary}</div>
            </div>
            <div className="border-[var(--line)] lg:mt-5 lg:border-t lg:pt-4" data-testid="comes-with-it">
              <p className="eyebrow">Comes with it</p>
              <div className="mt-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/certificate-of-authenticity.webp" alt="" className="h-14 w-11 shrink-0 border border-[var(--gold)]/60 object-cover" />
                <p className="flex-1 text-sm">
                  <span className="block">A certificate of authenticity for each piece</span>
                  <span className="block text-xs text-[var(--mute)]">Numbered, and issued once the payment clears.</span>
                </p>
              </div>
            </div>
            {open ? null : (
              <>
                <button type="button" className="btn-foil mt-5 w-full" disabled={busy !== null} onClick={() => void pay("card")} data-testid="pay-card">
                  {busy === "card" ? "Opening card payment…" : `Pay ${formatPrice(total)} by card`}
                </button>
                <p className="mt-2 text-center font-mono text-[10px] tracking-[0.16em] text-[var(--mute)] uppercase">Visa · Mastercard · Amex · Apple Pay · Google Pay</p>
                <button
                  type="button"
                  className="mt-3 min-h-12 w-full border border-[var(--navy)] px-4 py-3 text-sm tracking-[0.08em] uppercase disabled:opacity-40"
                  disabled={busy !== null}
                  onClick={() => void pay("usdc")}
                  data-testid="pay-usdc"
                >
                  {busy === "usdc" ? "Preparing…" : "Or pay with USDC (Solana Pay)"}
                </button>
                {error ? (
                  <p className="mt-3 text-sm text-[var(--bad)]" role="alert" data-testid="checkout-error">
                    {error}
                  </p>
                ) : tried && !contactOk ? (
                  <p className="mt-3 text-sm text-[var(--bad)]" role="alert">
                    Add your email, name, address, town, postcode and country.
                  </p>
                ) : null}
                <p className="mt-3 text-xs leading-relaxed text-[var(--mute)]">
                  The amount on the card button is the amount charged, for every piece in your basket. Card payments are taken by Stripe; USDC is confirmed on Solana within seconds.
                </p>
                <Link href="/basket" className="lnk mt-3 inline-block min-h-11 content-center text-sm">
                  Edit basket
                </Link>
              </>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  auto,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  auto: string
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--mute)] uppercase">{label}</span>
      <input
        id={id}
        type={type}
        autoComplete={auto}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full border-0 border-b border-[var(--line)] bg-transparent py-2 text-base outline-none focus:border-b-2 focus:border-[var(--gold)]"
      />
    </label>
  )
}
