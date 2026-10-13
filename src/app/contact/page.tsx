import type { Metadata } from "next"
import { LegalPage } from "@/components/shell/legal-page"

export const metadata: Metadata = { title: "Contact — OCHRÉ" }

export default function ContactPage() {
  return (
    <LegalPage kicker="Care" title="Contact">
      <p>[TRADING NAME]</p>
      <p>[REGISTERED ADDRESS]</p>
      <p>
        Email{" "}
        <a className="underline" href="mailto:segunjunaid1@gmail.com">
          segunjunaid1@gmail.com
        </a>
        . Include the order id if you already have one. There is no telephone line on this draft.
      </p>
      <p>Paid-order alerts and customer confirmations use the same address when email is switched on. If email is not configured, the order is still stored and the desk at /admin/orders is the record.</p>
    </LegalPage>
  )
}
