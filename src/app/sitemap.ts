import { MetadataRoute } from 'next'
import { CATEGORY_INFO } from '@/data/benefits'

const BASE_URL = 'https://naedon-finder.vercel.app'

// All benefit categories for search page indexing
const CATEGORIES = Object.keys(CATEGORY_INFO) as (keyof typeof CATEGORY_INFO)[]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // ── 1. Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/ai`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/calendar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/premium`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/profile`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // ── 2. Category search pages (/search?cat=xxx)
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map(cat => ({
    url: `${BASE_URL}/search?cat=${cat}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.75,
  }))

  // ── 3. Dynamic benefit detail pages (fetch from API with timeout)
  let detailPages: MetadataRoute.Sitemap = []
  try {
    // 5초 타임아웃 — API가 느릴 때 sitemap 전체가 실패하지 않도록
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(`${BASE_URL}/api/benefits`, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const json = await res.json()
      const benefits: { id: string }[] = json.data ?? []
      detailPages = benefits.map(b => ({
        url: `${BASE_URL}/detail/${b.id}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (e) {
    // API 실패 or 타임아웃 → detailPages는 빈 배열로 유지
    // staticPages + categoryPages는 항상 반환됨
    console.warn('[sitemap] Benefit API unavailable, serving partial sitemap:', e)
  }

  return [...staticPages, ...categoryPages, ...detailPages]
}
