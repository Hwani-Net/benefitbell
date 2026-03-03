// Netlify Scheduled Function: 매일 23:00 UTC (08:00 KST) → /api/cron/check-new-benefits 호출
import type { Config } from "@netlify/functions"

export default async () => {
  const siteUrl = process.env.URL || process.env.DEPLOY_URL || "http://localhost:3000"
  const res = await fetch(`${siteUrl}/api/cron/check-new-benefits`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET || ""}` },
  })
  const data = await res.json()
  console.log("[cron-check-new-benefits]", JSON.stringify(data))
}

export const config: Config = {
  schedule: "0 23 * * *",
}
