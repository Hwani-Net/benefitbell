// Netlify Scheduled Function: 매일 17:00 UTC → /api/cron/prefetch-details 호출
import type { Config } from "@netlify/functions"

export default async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || "http://localhost:3000"
  const res = await fetch(`${siteUrl}/api/cron/prefetch-details`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET || ""}` },
  })
  const data = await res.json()
  console.log("[cron-prefetch-details]", JSON.stringify(data))
}

export const config: Config = {
  schedule: "0 17 * * *",
}
