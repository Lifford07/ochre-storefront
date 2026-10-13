import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/phone"],
    },
    sitemap: "https://ochre-storefront.vercel.app/sitemap.xml",
  }
}
