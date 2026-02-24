/**
 * POST /api/indexnow — Notify search engines (Naver, Bing) of new/updated pages
 * IndexNow protocol: https://www.indexnow.org/
 * 
 * Usage: call this API after publishing new benefit data
 */
import { NextResponse } from 'next/server'

const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? 'benefitbell2026'
const BASE_URL = 'https://naedon-finder.vercel.app'

// IndexNow endpoints — Naver + Bing (Bing shares with others)
const ENDPOINTS = [
  'https://searchadvisor.naver.com/indexnow',
  'https://www.bing.com/indexnow',
]

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const urls: string[] = body?.urls ?? []

    if (urls.length === 0) {
      return NextResponse.json({ success: false, error: 'No URLs provided' }, { status: 400 })
    }

    const payload = {
      host: new URL(BASE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }

    const results = await Promise.allSettled(
      ENDPOINTS.map(endpoint =>
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
        })
      )
    )

    const statuses = results.map((r, i) => ({
      endpoint: ENDPOINTS[i],
      status: r.status === 'fulfilled' ? r.value.status : 'failed',
      error: r.status === 'rejected' ? String(r.reason) : undefined,
    }))

    return NextResponse.json({ success: true, submitted: urls.length, statuses })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

/**
 * GET /api/indexnow?trigger=all — Submit all sitemap URLs at once
 */
export async function GET() {
  try {
    // Fetch current sitemap URLs
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`)
    const xml = await sitemapRes.text()
    const matches = xml.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) ?? []
    const urls = matches
      .map(m => m.replace(/<\/?loc>/g, '').trim())
      .filter(u => !u.includes('/profile') && !u.includes('/premium') && !u.includes('/ai'))

    if (urls.length === 0) {
      return NextResponse.json({ success: false, error: 'No URLs found in sitemap' })
    }

    const payload = {
      host: new URL(BASE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }

    const results = await Promise.allSettled(
      ENDPOINTS.map(endpoint =>
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
        })
      )
    )

    const statuses = results.map((r, i) => ({
      endpoint: ENDPOINTS[i],
      status: r.status === 'fulfilled' ? r.value.status : 'failed',
    }))

    return NextResponse.json({ success: true, submitted: urls.length, statuses })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}
