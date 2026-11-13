import type { MetadataRoute } from "next"
import { works } from "@/config/works"
import { listPassports } from "@/lib/passports-store"

const base = "https://ochre-storefront.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const passports = await listPassports()
  const paths = [
    "/",
    "/make",
    "/collection",
    "/verre-eglomise",
    "/guide",
    "/terms",
    "/privacy",
    "/returns",
    "/shipping",
    "/contact",
    "/artists/example-artist",
    "/orders/preview",
    ...works.map((work) => `/collection/${work.slug}`),
    ...passports.filter((passport) => passport.status === "verified").map((passport) => `/p/${passport.id}`),
  ]
  return paths.map((path) => ({ url: `${base}${path === "/" ? "" : path}`, lastModified: now }))
}
