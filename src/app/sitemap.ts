import type { MetadataRoute } from "next"
import { works } from "@/config/works"

const base = "https://ochre-storefront.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const paths = [
    "/",
    "/make",
    "/collection",
    "/guide",
    "/terms",
    "/privacy",
    "/returns",
    "/shipping",
    "/contact",
    "/artists/example-artist",
    "/orders/preview",
    ...works.map((work) => `/collection/${work.slug}`),
  ]
  return paths.map((path) => ({ url: `${base}${path === "/" ? "" : path}`, lastModified: now }))
}
