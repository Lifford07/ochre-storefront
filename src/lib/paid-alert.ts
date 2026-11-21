import { alertFounder, mailEnabled } from "./mail.ts"
import { abortOnce, beginOnce, finishOnce } from "./once.ts"
import type { StoredOrder } from "./order-types.ts"

/** Sends the paid-order note once. A retry sends it only if the last attempt did not finish. */
export async function notifyFounderOnce(paid: StoredOrder) {
  const key = `paid-alert:${paid.id}`
  const state = await beginOnce(key)
  if (state === "done") return
  if (state === "busy") throw new Error("The paid-order note is already being sent.")
  try {
    if (!mailEnabled()) {
      console.error("founder-alert", paid.id, "email is not configured, so the paid-order note was not sent")
      await finishOnce(key)
      return
    }
    const ship = [paid.fullName, paid.address, paid.city, paid.postcode, paid.country, paid.email, paid.phone].filter(Boolean).join("\n")
    const result = await alertFounder({
      id: paid.id,
      summary: paid.paymentMethod === "card"
        ? `${paid.materialName}, ${paid.sizeName}, ${paid.editionLabel}, paid by card (Stripe)`
        : `${paid.materialName}, ${paid.sizeName}, ${paid.editionLabel}, ${paid.usdcAmount} USDC`,
      ship,
      payer: paid.payer || (paid.paymentMethod === "card" ? "card" : "not recorded"),
    })
    if (!result.sent) {
      console.error("founder-alert", paid.id, "the paid-order email was not accepted")
      await abortOnce(key)
      throw new Error("The paid-order email was not accepted.")
    }
    await finishOnce(key)
  } catch (error) {
    await abortOnce(key)
    if (!(error instanceof Error) || error.message !== "The paid-order email was not accepted.") {
      console.error("founder-alert", paid.id, error instanceof Error ? error.message : "failed")
    }
    throw error
  }
}
