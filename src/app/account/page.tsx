import Link from "next/link"
import { AccountShell } from "@/components/account/account-shell"
import { currentUser } from "@/lib/account-auth"

export const dynamic = "force-dynamic"
export const metadata = { title: "My account · OCHRÉ" }

const tiles = [
  ["My images", "/account/images", "Every photograph you have brought to Ochré, ready to make again."],
  ["My orders", "/account/orders", "Your pieces, their editions and certificates."],
  ["My details", "/account/details", "Your name, email and password."],
  ["Begin a new piece", "/make", "Upload an image and make it into an object."],
] as const

export default async function AccountPage() {
  const user = await currentUser()
  return (
    <AccountShell user={user} active="/account" title={user ? `Welcome, ${user.firstName}` : "My account"}>
      <p className="max-w-xl text-[var(--navy)]/75">Signed in as {user?.email}. This is your private room at Ochré.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tiles.map(([title, href, text]) => (
          <Link key={href} href={href} className="group border border-[var(--navy)]/15 bg-white/60 p-6 transition hover:border-[#C6B849]">
            <p className="font-display text-2xl group-hover:text-[var(--gold-ink)]">{title}</p>
            <p className="mt-2 text-sm text-[var(--navy)]/70">{text}</p>
            <p className="mt-4 text-[11px] tracking-[0.2em] text-[var(--gold-ink)] uppercase">Open →</p>
          </Link>
        ))}
      </div>
    </AccountShell>
  )
}
