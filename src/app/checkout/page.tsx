import type { Metadata } from "next"
import { BasketCheckout } from "@/components/checkout/basket-checkout"

export const metadata: Metadata = { title: "Checkout — OCHRÉ", robots: { index: false } }

export default function CheckoutPage() {
  return <BasketCheckout />
}
