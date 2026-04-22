import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile", "/premium", "/ai"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
