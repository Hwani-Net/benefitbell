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

  // ── 3. Dynamic benefit detail pages (fetch from API)
  let detailPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${BASE_URL}/api/benefits`, {
      next: { revalidate: 3600 },
    })
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
    console.warn('[sitemap] Failed to fetch benefit IDs:', e)
  }

  return [...staticPages, ...categoryPages, ...detailPages]
}
