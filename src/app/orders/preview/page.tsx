import type { Metadata } from "next"
import { WorkImage } from "@/components/art/motif"
import { CertificatePage } from "@/components/certificate/certificate-card"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { solanaSettings } from "@/config/solana"
import { works } from "@/config/works"

export const metadata: Metadata = {
  title: "Certificate preview — OCHRÉ",
  description: "An example edition certificate. A paid order uses the same page.",
}

export default async function CertificatePreview({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>
}) {
  const { kind } = await searchParams
  const drop = kind === "drop"
  const settings = solanaSettings()
  const work = works[0]

  return (
    <>
      <SiteHeader />
      <CertificatePage
        view={{
          id: drop ? "OC-0107" : "OC-1-1",
          title: drop ? work.title : "Your image",
          artist: drop ? work.artist : undefined,
          materialName: drop ? "Acrylic" : "Acrylic",
          sizeName: drop ? "A3 portrait" : "60 × 40 cm",
          editionLabel: drop ? "Edition No. 007 of 50" : "Edition 1/1",
          number: drop ? 7 : 1,
          size: drop ? 50 : 1,
          owner: "8vQe…3LmT",
          mint: settings.mint,
          network: settings.cluster === "mainnet-beta" ? "Solana mainnet" : "Solana devnet",
          signature: "example",
          solscanUrl: undefined,
          issued: "28 Sep 2026",
          example: true,
          paid: true,
          image: drop ? (
            <WorkImage motif={work.motif} image={work.image} title={work.title} />
          ) : (
            <div className="h-full bg-gradient-to-b from-[#f3d2b0] to-[#1b3a4b]" />
          ),
        }}
      />
      <SiteFooter />
    </>
  )
}
