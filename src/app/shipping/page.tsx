import type { Metadata } from "next"
import { LegalPage } from "@/components/shell/legal-page"

export const metadata: Metadata = { title: "Shipping — OCHRÉ" }

export default function ShippingPage() {
  return (
    <LegalPage kicker="Care" title="Shipping">
      <p>
        [TRADING NAME] currently prices delivery to the United Kingdom, a single European Union zone, and the United States. Other countries are not offered at checkout.
      </p>
      <p>
        The price you pay already includes packaging and shipping for that zone. The working assumptions, until a carrier contract replaces them, are £6 packaging, £8 inside the UK, £18 to the EU, and £28 to the US. Duties and local taxes outside the UK are not included.
      </p>
      <p>
        Making the object takes the working days shown on the material, and then the courier. Tracked delivery goes to the address on the order. We email the tracking link when it exists. We do not promise a signature on the doorstep.
      </p>
      <p>House works in the collection are stand-in drawings until the artist file replaces them. A paid house order is checked before anything is printed.</p>
    </LegalPage>
  )
}
