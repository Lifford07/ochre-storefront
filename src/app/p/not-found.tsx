import Link from "next/link"
import { Crest, Wordmark } from "@/components/brand/mark"

export default function PassportNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-center px-5 py-16">
      <Crest className="size-10 text-[#e4d48a]" />
      <Wordmark tone="on-dark" className="mt-4 !text-[15px]" />
      <h1 className="font-display mt-8 text-4xl text-[#f6f1e7]">This passport is not in the house.</h1>
      <p className="mt-4 text-sm leading-relaxed text-[#d4cbbd]">The link may be mistyped, or the piece has not been recorded.</p>
      <Link href="/" prefetch={false} className="mt-8 inline-flex min-h-12 items-center text-[#f1e7b4] underline underline-offset-4">
        Back to the house
      </Link>
    </main>
  )
}
