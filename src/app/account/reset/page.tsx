import { ResetForm } from "@/components/account/reset-form"
import { SiteFooter, SiteHeader } from "@/components/shell/site-chrome"

export const metadata = { title: "Reset password · OCHRÉ" }

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams
  return (
    <>
      <SiteHeader />
      <main className="bg-[#F3EFE7] px-5 py-16 text-[var(--navy)]">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-4xl">Choose a new password</h1>
          <ResetForm token={token} />
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
