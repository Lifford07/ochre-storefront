import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BasketPaid, BasketWaiting } from "@/components/checkout/basket-status"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { formatPrice } from "@/config/catalogue"
import { getBasket } from "@/lib/baskets-store"
import { buyerBasket } from "@/lib/order-public"
import { getOrder } from "@/lib/orders-store"
import type { StoredBasket } from "@/lib/order-types"
import { settleBasketStripe } from "@/lib/settle-basket"
import { ordersAvailable } from "@/lib/storage-mode"
import { stripeReady } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: `${id} — OCHRÉ`, robots: { index: false } }
}

function Unavailable({ text }: { text: string }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-16">
        <h1 className="font-display text-4xl">This order is unavailable</h1>
        <p className="mt-4 text-sm text-[var(--charcoal)]">{text}</p>
      </main>
      <SiteFooter />
    </>
  )
}

export default async function BasketOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ t?: string; session_id?: string }>
}) {
  const { id } = await params
  const { t, session_id: sessionId } = await searchParams
  if (!ordersAvailable()) return <Unavailable text="The order store is not connected, so this page cannot look up the order." />

  let basket: StoredBasket | null
  try {
    basket = await getBasket(id)
    if (basket && (!t || basket.viewToken !== t)) basket = null
    if (basket && sessionId && stripeReady()) {
      try {
        basket = (await settleBasketStripe(id, sessionId)) ?? basket
      } catch (error) {
        console.error("stripe-settle-basket", error instanceof Error ? error.message : "failed")
      }
    }
  } catch {
    return <Unavailable text="The order store did not answer. The rest of the shop is still open. Try this page again in a moment." />
  }
  if (!basket) notFound()

  const paid = basket.status === "paid, awaiting Ochré check"
  const first = basket.fullName.split(" ")[0] || "you"
  const pieces = paid
    ? (
        await Promise.all(
          basket.lines.flatMap((line) =>
            line.orderIds.map(async (orderId) => {
              const order = await getOrder(orderId).catch(() => null)
              return {
                id: orderId,
                title: line.title,
                meta: `${line.materialName} · ${line.sizeName}`,
                edition: order?.editionLabel ?? "Being numbered",
                href: order?.viewToken && order.status === "paid, awaiting Ochré check" ? `/orders/${orderId}?t=${encodeURIComponent(order.viewToken)}` : null,
              }
            }),
          ),
        )
      )
    : []

  return (
    <>
      <SiteHeader />
      <main className="page-enter mx-auto max-w-3xl px-5 pt-10 pb-20 md:px-8 md:pt-16" data-testid="basket-order">
        <p className="eyebrow">Order {basket.id}</p>
        {paid ? (
          <>
            <h1 className="font-display mt-3 text-5xl md:text-6xl">
              Thank you, <span className="italic">{first}</span>
            </h1>
            <p className="mt-3 text-[var(--charcoal)]">
              {basket.pieces} {basket.pieces === 1 ? "piece" : "pieces"}, paid{" "}
              {basket.paymentMethod === "card" ? `${formatPrice(basket.totalPence)} by card` : `${basket.usdcAmount} USDC`}. Each piece is checked by eye before it is made, then again before it leaves.
            </p>
            {basket.problems?.length ? (
              <p className="mt-4 border border-[var(--coral)] bg-[var(--paper)] px-4 py-3 text-sm" role="status">
                One piece needs a word from us. We will email you within one working day.
              </p>
            ) : null}
            <ul className="mt-8 border-t border-[var(--line)]" data-testid="basket-pieces">
              {pieces.map((piece) => (
                <li key={piece.id} className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-4">
                  <span className="min-w-0">
                    <span className="font-display block text-xl italic">{piece.title}</span>
                    <span className="block font-mono text-[10px] tracking-[0.12em] text-[var(--mute)] uppercase">{piece.meta}</span>
                    <span className="block text-sm">{piece.edition}</span>
                  </span>
                  {piece.href ? (
                    <Link href={piece.href} className="lnk min-h-11 shrink-0 content-center text-sm">
                      Certificate
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
            <BasketPaid id={basket.id} />
          </>
        ) : (
          <>
            <h1 className="font-display mt-3 text-5xl md:text-6xl">
              Waiting for your <span className="italic">payment</span>
            </h1>
            <ul className="mt-6 border-t border-[var(--line)]">
              {basket.lines.map((line) => (
                <li key={`${line.slug}:${line.sizeId}:${line.materialId}`} className="flex justify-between gap-4 border-b border-[var(--line)] py-3 text-sm">
                  <span>
                    {line.qty} × {line.title}, {line.materialName}, {line.sizeName}
                  </span>
                  <span>{formatPrice(line.unitPence * line.qty)}</span>
                </li>
              ))}
              <li className="flex justify-between py-3">
                <span>Total</span>
                <span className="font-display text-2xl">{formatPrice(basket.totalPence)}</span>
              </li>
            </ul>
            <BasketWaiting basket={buyerBasket(basket)} returningFromCard={Boolean(sessionId)} />
          </>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
