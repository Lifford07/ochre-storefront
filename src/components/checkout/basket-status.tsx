"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { UsdcPay } from "@/components/checkout/pay-panel"
import { clearBasket } from "@/lib/basket"
import type { BuyerBasket } from "@/lib/order-public"

/** Once paid, the pieces leave the visitor's basket. */
export function BasketPaid({ id }: { id: string }) {
  useEffect(() => {
    try {
      const open = JSON.parse(sessionStorage.getItem("ochre-open-basket") || "null") as { id?: string } | null
      if (open?.id === id) sessionStorage.removeItem("ochre-open-basket")
      if (localStorage.getItem("ochre-paid-basket") !== id) {
        localStorage.setItem("ochre-paid-basket", id)
        clearBasket()
      }
    } catch {}
  }, [id])
  return null
}

/** Card: Stripe may tell the shop a few seconds after the customer is back, so look again. USDC: show the code. */
export function BasketWaiting({ basket, returningFromCard }: { basket: BuyerBasket; returningFromCard: boolean }) {
  const router = useRouter()
  const [tries, setTries] = useState(0)
  useEffect(() => {
    if (!returningFromCard || tries >= 10) return
    const handle = window.setTimeout(() => {
      setTries((n) => n + 1)
      router.refresh()
    }, 3000)
    return () => window.clearTimeout(handle)
  }, [returningFromCard, tries, router])

  if (returningFromCard) {
    return (
      <p className="mt-6 text-sm text-[var(--charcoal)]" role="status">
        {tries < 10 ? "Confirming your card payment with Stripe…" : "Stripe has not confirmed the payment yet. If you were charged, it will appear here shortly, and we will email you."}
      </p>
    )
  }
  if (basket.paymentMethod === "card") {
    return (
      <p className="mt-6 text-sm text-[var(--charcoal)]">
        This order was opened for card payment and has not been paid. Nothing was charged. Return to your basket to try again.
      </p>
    )
  }
  return (
    <div className="mt-6">
      <UsdcPay
        cluster={basket.cluster}
        target={{
          id: basket.id,
          payUrl: basket.payUrl,
          usdcAmount: basket.usdcAmount,
          pricePence: basket.totalPence,
          recipient: basket.recipient,
          mint: basket.mint,
          reference: basket.reference,
          memo: basket.memo,
          status: basket.status,
          viewToken: basket.viewToken,
        }}
      />
    </div>
  )
}
