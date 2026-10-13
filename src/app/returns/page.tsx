import type { Metadata } from "next"
import { LegalPage } from "@/components/shell/legal-page"

export const metadata: Metadata = { title: "Returns and refunds — OCHRÉ" }

export default function ReturnsPage() {
  return (
    <LegalPage kicker="Care" title="Returns and refunds">
      <p>
        This is a draft for Ochre Store Ltd (trading as Ochré), company number 15837574, 20 Wenlock Road, London, England, N1 7GU. A solicitor should confirm it against the Consumer Contracts Regulations 2013 and the Consumer Rights Act 2015 before the shop takes payment.
      </p>
      <p>
        Pieces are made to order from the file and the size you chose. Personalised goods are usually outside the 14-day change-of-mind cancellation right. Once printing has started, a change of mind is not a refund.
      </p>
      <p>
        If the piece is faulty, damaged in transit, or not the material, size, or image you ordered, write to us with the order id and photographs. We will remake it or refund the USDC paid, including a reasonable cost of return when the fault is ours.
      </p>
      <p>
        A soft print that you accepted with “print it anyway” is the file at that size. That acknowledgement is not a waiver of a fault in the making.
      </p>
      <p>Refunds of USDC go back to the wallet that paid, after we have the piece back, unless we tell you to keep it.</p>
    </LegalPage>
  )
}
