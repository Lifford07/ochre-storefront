import type { MetadataRoute } from "next"
import { works } from "@/config/works"
import { GALLERY_PIECES } from "@/lib/jewellery/pieces"

const base = "https://ochre-storefront.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const paths = [
    "/",
    "/make",
    "/collection",
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
  ]
  return paths.map((path) => ({ url: `${base}${path === "/" ? "" : path}`, lastModified: now }))
}
