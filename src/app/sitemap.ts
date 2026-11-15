import type { MetadataRoute } from "next"
import { works } from "@/config/works"
import { GALLERY_PIECES } from "@/lib/jewellery/pieces"
import { listPassports } from "@/lib/passports-store"

const base = "https://ochre-storefront.vercel.app"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const passports = await listPassports()
  const paths = [
    "/",
    "/make",
    "/collection",
    "/begin",
    "/house",
    "/exhibitions",
    "/commission",
    "/lines/jewellery",
    "/lines/home",
    "/lines/garms",
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
