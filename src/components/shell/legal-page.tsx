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
          Ochre Store Ltd (trading as Ochré). Registered in England and Wales, company number 15837574. Registered office: 20 Wenlock Road, London, England, N1 7GU.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
