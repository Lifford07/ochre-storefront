import type { MetadataRoute } from "next"
import { works } from "@/config/works"
import { GALLERY_PIECES } from "@/lib/jewellery/pieces"
import { listPassports } from "@/lib/passports-store"
import { PUBLIC_SITE } from "@/lib/public-site"

const base = PUBLIC_SITE

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const passports = await listPassports()
  const paths = [
    "/",
    "/about",
    "/studio",
    "/salon",
    "/atelier",
    "/character",
    "/make",
    "/collection",
    "/verre-eglomise",
    "/jewellery",
    "/jewellery/design",
    "/jewellery/commission",
    "/guide",
    "/terms",
    "/privacy",
    "/returns",
    "/shipping",
    "/contact",
    "/artists/example-artist",
    "/orders/preview",
    ...works.map((work) => `/collection/${work.slug}`),
    ...GALLERY_PIECES.map((piece) => `/jewellery/pieces/${piece.kind}/${piece.slug}`),
    ...passports.filter((passport) => passport.status === "verified").map((passport) => `/p/${passport.id}`),
  ]
  return paths.map((path) => ({ url: `${base}${path === "/" ? "" : path}`, lastModified: now }))
}
