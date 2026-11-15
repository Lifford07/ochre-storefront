import type { Metadata } from "next"
import { PassportDesk } from "@/components/passport/passport-desk"

export const metadata: Metadata = {
  title: "Passports — OCHRÉ",
  robots: { index: false, follow: false },
}

export default function AdminPassportsPage() {
  return <PassportDesk />
}
