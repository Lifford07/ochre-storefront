import { AccountShell } from "@/components/account/account-shell"
import { DetailsForm } from "@/components/account/details-form"
import { currentUser } from "@/lib/account-auth"

export const dynamic = "force-dynamic"
export const metadata = { title: "My details · OCHRÉ" }

export default async function DetailsPage() {
  const user = await currentUser()
  return (
    <AccountShell user={user} active="/account/details" title="My details">
      {user ? <DetailsForm firstName={user.firstName} lastName={user.lastName} email={user.email} /> : null}
    </AccountShell>
  )
}
