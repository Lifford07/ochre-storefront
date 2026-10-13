import type { Metadata } from "next"
import { LegalPage } from "@/components/shell/legal-page"

export const metadata: Metadata = { title: "Terms — OCHRÉ" }

export default function TermsPage() {
  return (
    <LegalPage kicker="Care" title="Terms">
      <p>
        These terms are a draft for [TRADING NAME] of [REGISTERED ADDRESS], trading as Ochré. They are the contract for a made-to-order print paid in USDC on Solana.
      </p>
      <p>
        The contract starts when the USDC transfer matches the amount, the recipient, the token, and the order reference. Until then the order is only a request. An edition number on a numbered piece is assigned at that moment.
      </p>
      <p>
        You confirm that you own the image, or have permission to have it printed and sold back to you as a physical object. [TRADING NAME] may refuse a file that looks unlawful, that you do not have rights in, or that will not print at the size you chose.
      </p>
      <p id="image-rights">
        Image rights. The file is used to make your piece, to show it on your certificate, and to keep a record of the order. It is not licensed to [TRADING NAME] for a catalogue, an advertisement, or another customer. House editions in the collection are separate works.
      </p>
      <p>
        The certificate records the edition. It will be issued with the piece. It is not a token minted on Solana yet. The payment itself is the on-chain record.
      </p>
      <p>
        Prices are in pounds and include the print, packaging, and the shipping zone shown at checkout. The USDC amount adds a small buffer so a move in the pound does not leave the order short. Cards are not offered.
      </p>
      <p>
        Made-to-order goods that use your own image are personalised. The draft returns page explains what that means for a change of mind, and what still applies if the piece is faulty or not as described.
      </p>
      <p>These terms are governed by the law of England and Wales. Courts of England and Wales have jurisdiction, without limiting any rights you have as a consumer.</p>
    </LegalPage>
  )
}
