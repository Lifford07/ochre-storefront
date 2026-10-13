import type { Metadata } from "next"
import { LegalPage } from "@/components/shell/legal-page"

export const metadata: Metadata = { title: "Privacy — OCHRÉ" }

export default function PrivacyPage() {
  return (
    <LegalPage kicker="Care" title="Privacy">
      <p>
        [TRADING NAME] of [REGISTERED ADDRESS] is the controller for this shop. This draft says what the shop stores so an order can be made and delivered.
      </p>
      <p>
        We store your name, email, street address, city, postcode, country, and phone if you give one. We store the print file, the crop and colour choices, the order id, the price, and the Solana wallet that paid. Payment confirmation is a public transaction on Solana.
      </p>
      <p>
        The purpose is to make the piece, ship it, send the order email, and keep a record of a paid sale. The legal bases to confirm with a solicitor are contract, and a legitimate interest in preventing fraud and keeping tax records.
      </p>
      <p>
        The shop runs on Vercel. Order records sit in Upstash Redis. Print files sit in a private Vercel Blob store. Email, when it is switched on, is sent through Resend. A wallet connection uses a server-side Solana RPC. Those processors see only what they need to do that job.
      </p>
      <p>
        We keep the order and the print file while the piece is being made, and for as long as a UK business must keep a sales record. You can ask for a copy, a correction, or deletion where the law allows, by writing to the address on the contact page.
      </p>
      <p>You can complain to the Information Commissioner&apos;s Office. This page is a draft and is not a completed privacy notice.</p>
    </LegalPage>
  )
}
