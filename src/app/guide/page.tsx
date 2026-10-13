import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { CARE_PROMISE } from "@/lib/copy"

export const metadata: Metadata = {
  title: "Image guide — OCHRÉ",
  description: "How resolution, colour, and crop work when you make a piece with Ochré.",
}

export default function GuidePage() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-8">
        <p className="eyebrow">Image guide</p>
        <h1 className="font-serif text-4xl">Image guide</h1>
        <p className="mt-3 text-base leading-relaxed">
          A print is the file, the crop, and the size, working together. This is the short version.
        </p>

        <section className="mt-8">
          <h2 className="font-serif text-2xl">Resolution</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3c3832]">
            We score the pixels that actually land on the print.
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#3c3832]">
            <li>Perfect is 300 DPI and above. The needle sits in the green.</li>
            <li>Good is 150–299. The print will hold, with a softer edge on fine detail.</li>
            <li>
              Too small is under 150. Ready stays off until you tick print it anyway, or choose a smaller size.
              Smoothing a preview does not add detail, and the print file uses your original pixels.
            </li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl">Colour</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3c3832]">
            Print-optimised colour is on when you arrive. Colour, black and white, and sepia are baked into the print
            file. Turn colour off if you have already colour-edited the image. A screen glows. Paper, acrylic, and glass
            do not. They will be close. They will not be identical.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl">Crop</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3c3832]">
            Fill covers the whole print. Drag to choose what stays. Fit keeps the entire photo, with a quiet margin
            when the shapes do not match. The meter scores the crop, not the unused edges of the file.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl">File types</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3c3832]">
            JPG, PNG, WEBP, HEIC from an iPhone, TIFF, and the first page of a PDF. Up to 25MB. We convert to
            sRGB where the file allows, so you do not have to export it yourself. A large file shows its progress and
            does not freeze the page.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl">Phone photos</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#3c3832]">
            HEIC from an iPhone is welcome. Upload the file on the computer you are using. Sending a photo from another
            device is not available.
          </p>
        </section>

        <p className="mt-10 border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm">{CARE_PROMISE}</p>
        <p className="mt-6">
          <Link href="/make" className="lnk">
            Begin with your image
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
