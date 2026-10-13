import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata: Metadata = {
  title: "Sample certificate — OCHRÉ",
  description: "A sample Ochré certificate of authenticity, issued with every physical piece.",
}

export default function CertificatePreview() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--navy)] text-[var(--porcelain)]">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-14 md:grid-cols-[1fr_1.1fr] md:px-12 md:py-20">
          <div>
            <p className="eyebrow text-[var(--gold)]">Sample certificate</p>
            <h1 className="font-display mt-3 text-4xl md:text-6xl">
              A <span className="italic text-[var(--foil)]">certificate of authenticity</span> for every piece.
            </h1>
            <p className="mt-5 max-w-md text-[var(--porcelain)]/75">
              Every physical piece we make is numbered and leaves the studio with its own certificate. This is a sample; yours carries your title, edition number and details.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/ochre-certificate-sample.pdf" download className="btn-foil">
                Download PDF
              </a>
              <Link href="/make" className="inline-flex items-center border border-[var(--porcelain)]/40 px-6 py-3 text-[12px] tracking-[0.2em] uppercase">
                Begin with your image
              </Link>
            </div>
            <p className="mt-3 text-xs text-[var(--porcelain)]/50">PDF, about 11 MB.</p>
          </div>
          <figure className="mx-auto w-full max-w-[460px]">
            <div className="rotate-[-1.5deg] bg-[#1a1a1a] p-3 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.75)]">
              <div className="bg-[#F3EFE7] p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/certificate-of-authenticity.webp" alt="Sample Ochré certificate of authenticity" width={990} height={1400} className="block h-auto w-full" />
              </div>
            </div>
          </figure>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
