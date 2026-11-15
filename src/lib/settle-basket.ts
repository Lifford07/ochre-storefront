import { Connection } from "@solana/web3.js"
import { serverRpc, solscanTx } from "@/config/solana"
import { claimSettle, getBasket, listUnpaidBaskets, releaseSettle, saveBasket } from "@/lib/baskets-store"
import { findPayment } from "@/lib/find-payment"
import { formatPrice } from "@/config/catalogue"
import { alertFounder } from "@/lib/mail"
import { getOrder, markPaid } from "@/lib/orders-store"
import type { StoredBasket, StoredOrder } from "@/lib/order-types"
import { stripe, type CheckoutSession } from "@/lib/stripe"

const PAID = "paid, awaiting Ochré check" as const

type Payment = {
  method: "usdc" | "card"
  signature?: string
  solscanUrl?: string
  payer?: string
  stripePaymentIntent?: string
  flags?: StoredBasket["paymentFlags"]
}

/**
 * The basket is paid: mark every piece in it paid, which gives each its edition number.
 * Safe to call twice. A store failure leaves the basket open so the next check finishes it;
 * a piece whose edition sold out at the same moment is recorded as a problem for the founder.
 */
export async function settleBasket(basket: StoredBasket, payment: Payment): Promise<StoredBasket> {
  if (basket.status === PAID) return basket
  if (!(await claimSettle(basket.id))) return (await getBasket(basket.id)) ?? basket
  try {
    const fresh = (await getBasket(basket.id)) ?? basket
    if (fresh.status === PAID) return fresh
    const paidAt = new Date().toISOString()
    const problems: string[] = []
    const numbered: string[] = []
    for (const line of fresh.lines) {
      for (const orderId of line.orderIds) {
        const child = await getOrder(orderId)
        if (!child) {
          problems.push(`${line.title}: order ${orderId} is missing`)
          continue
        }
        if (child.status === PAID) {
          numbered.push(`${line.title}, ${child.editionLabel} (${child.id})`)
          continue
        }
        try {
          const done: StoredOrder = await markPaid({
            ...child,
            status: PAID,
            paymentMethod: payment.method,
            signature: payment.signature,
            solscanUrl: payment.solscanUrl,
            stripePaymentIntent: payment.stripePaymentIntent,
            payer: payment.payer ?? child.payer,
            paidAt,
          })
          numbered.push(`${line.title}, ${done.editionLabel} (${done.id})`)
        } catch (error) {
          if (error instanceof Error && error.message === "This edition is complete.") {
            problems.push(`${line.title} (${orderId}): the edition sold out before this piece could be numbered. Refund or offer another.`)
            continue
          }
          throw error
        }
      }
    }
    const saved = await saveBasket({
      ...fresh,
      status: PAID,
      paymentMethod: payment.method,
      signature: payment.signature,
      solscanUrl: payment.solscanUrl,
      stripePaymentIntent: payment.stripePaymentIntent,
      payer: payment.payer ?? fresh.email,
      paidAt,
      paymentFlags: payment.flags && payment.flags.length > 0 ? payment.flags : undefined,
      problems: problems.length > 0 ? problems : undefined,
    })
    const ship = [saved.fullName, saved.address, saved.city, saved.postcode, saved.country, saved.email, saved.phone].filter(Boolean).join("\n")
    const paidBy = payment.method === "card" ? `${formatPrice(saved.totalPence)} by card (Stripe)` : `${saved.usdcAmount} USDC`
    try {
      await alertFounder({
        id: saved.id,
        summary: [
          `Basket of ${saved.pieces} ${saved.pieces === 1 ? "piece" : "pieces"}, ${paidBy}.`,
          ...numbered,
          ...(problems.length ? ["NEEDS ATTENTION:", ...problems] : []),
        ].join("\n"),
        ship,
        payer: saved.payer || payment.method,
      })
    } catch {}
    return saved
  } finally {
    await releaseSettle(basket.id)
  }
}

/** Card: trust only Stripe's own record of the session, for this basket and this amount. */
export async function settleBasketStripe(id: string, sessionId: string) {
  const basket = await getBasket(id)
  if (!basket) return null
  if (basket.status === PAID) return basket
  if (!basket.stripeSessionId || basket.stripeSessionId !== sessionId) return basket
  const session = await stripe<CheckoutSession>(`/checkout/sessions/${encodeURIComponent(sessionId)}`)
  if (
    session.payment_status !== "paid" ||
    session.metadata?.basket_id !== basket.id ||
    session.amount_subtotal !== basket.totalPence ||
    session.currency !== "gbp"
  ) {
    return basket
  }
  return settleBasket(basket, {
    method: "card",
    stripePaymentIntent: session.payment_intent ?? undefined,
    payer: session.customer_details?.email ?? basket.email,
  })
}

/** USDC: look on Solana for a transfer that names this basket's reference and memo. */
export async function recordBasketPayment(basket: StoredBasket) {
  if (basket.status === PAID) return basket
  const rpc = serverRpc(basket.cluster)
  if (!rpc) throw new Error("Set SOLANA_RPC_URL on the server before payments can be checked.")
  const decision = await findPayment(new Connection(rpc, "confirmed"), basket)
  if (!decision.settled || !decision.signature) return null
  const flags = (
    [decision.overpaid ? "overpaid" : null, decision.duplicate ? "duplicate" : null, decision.split ? "split" : null] as const
  ).filter((flag): flag is "overpaid" | "duplicate" | "split" => flag !== null)
  return settleBasket(basket, {
    method: "usdc",
    signature: decision.signature,
    solscanUrl: solscanTx(decision.signature, basket.cluster),
    payer: decision.payer ?? undefined,
    flags,
  })
}

/** Run by the cron and the admin button, next to the single-order check. */
export async function reconcileBaskets() {
  const paid: StoredBasket[] = []
  for (const basket of await listUnpaidBaskets()) {
    try {
      const result = await recordBasketPayment(basket)
      if (result?.status === PAID) paid.push(result)
    } catch (error) {
      console.error("reconcile-basket", basket.id, error instanceof Error ? error.message : "failed")
    }
  }
  return paid
}
