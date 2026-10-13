import type { ReactNode } from "react"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export function LegalPage({
  kicker,
  title,
  children,
}: {
  kicker: string
  title: string
  children: ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-10">
        <p className="eyebrow">{kicker}</p>
        <h1 className="font-display mt-2 text-4xl">{title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--charcoal)]">{children}</div>
        <p className="mt-10 border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-xs leading-relaxed text-[var(--mute)]">
          Draft for [TRADING NAME], [REGISTERED ADDRESS]. Replace both placeholders, and have a solicitor read this, before the shop takes a customer&apos;s money.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
