import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata: Metadata = {
  title: "Upload on this computer — OCHRÉ",
}

export default function PhoneClosedPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-16">
        <p className="eyebrow">Upload</p>
        <h1 className="font-display mt-2 text-4xl">Upload on this computer</h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--charcoal)]">
          Sending a photo from another device is not available. Open the editor on the computer you are using and upload the file there.
        </p>
        <Link href="/make" className="btn-foil mt-8 inline-flex">
          Begin with your image
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
