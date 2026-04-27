import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://benefitbell.kr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/premium", "/ai", "/consent"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
