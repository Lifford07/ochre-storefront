import type { MetadataRoute } from "next"
import { PUBLIC_SITE } from "@/lib/public-site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/phone"],
    },
    sitemap: `${PUBLIC_SITE}/sitemap.xml`,
  }
}
