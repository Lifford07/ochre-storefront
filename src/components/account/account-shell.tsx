import Link from "next/link"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"
import { SignInPrompt } from "@/components/account/sign-in-prompt"
import type { User } from "@/lib/account-auth"

const nav = [
  ["Overview", "/account"],
  ["My images", "/account/images"],
  ["My orders", "/account/orders"],
  ["My details", "/account/details"],
] as const

export function AccountShell({ user, active, title, children }: { user: User | null; active: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh] bg-[#F3EFE7] text-[var(--navy)]">
        <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-10 md:py-16">
          {user ? (
            <div className="grid gap-10 md:grid-cols-[220px_1fr]">
              <aside>
                <p className="eyebrow text-[var(--gold-ink)]">My account</p>
                <nav className="mt-4 flex gap-4 overflow-x-auto md:flex-col md:gap-1" aria-label="Account">
                  {nav.map(([label, href]) => (
                    <Link
                      key={href}
                      href={href}
                      className={`whitespace-nowrap py-2 text-sm md:border-l-2 md:pl-4 ${active === href ? "font-semibold md:border-[#C6B849]" : "text-[var(--navy)]/70 md:border-transparent hover:text-[var(--navy)]"}`}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </aside>
              <section>
                <h1 className="font-display text-4xl md:text-5xl">{title}</h1>
                <div className="mt-8">{children}</div>
              </section>
            </div>
          ) : (
            <SignInPrompt />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
