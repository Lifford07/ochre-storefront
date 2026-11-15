import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { PassportView } from "@/components/passport/passport-view"
import { passportEditionLabel, passportOriginFrom, passportUrl } from "@/lib/passport"
import { getPassport } from "@/lib/passports-store"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const passport = await getPassport(id)
  if (!passport) return { title: "Passport — OCHRÉ", robots: { index: false, follow: false } }
  const edition = passportEditionLabel(passport.editionNumber, passport.editionSize)
  const description =
    passport.status === "draft"
      ? `Draft provenance passport for ${passport.title}. This piece is not yet made.`
      : `Provenance passport for ${passport.title}, ${edition}. An Ochré original by ${passport.makerName}.`
  return {
    title: `${passport.title} · ${edition} — OCHRÉ`,
    description,
    alternates: { canonical: `/p/${passport.id}` },
    robots: passport.status === "verified" ? { index: true, follow: true } : { index: false, follow: false },
  }
}

export default async function PassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const passport = await getPassport(id)
  if (!passport) notFound()
  const origin = passportOriginFrom(await headers())
  return <PassportView passport={passport} url={passportUrl(passport.id, origin)} />
}
