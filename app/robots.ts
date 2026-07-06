import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/admin", "/super-admin", "/notes/", "/notices", "/events", "/marketplace", "/rentals", "/lost-found", "/tests", "/profile", "/onboarding"],
    },
    sitemap: "https://campushub-nine-lake.vercel.app/sitemap.xml",
  }
}