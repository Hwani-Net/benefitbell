/**
 * GET /api/benefits — Fetch welfare benefits from all government data sources
 * Real government data only. No mock/fake data.
 * Sources: 중앙부처 + 지자체 + 보조금24 + 기업마당 + K-Startup + 민간복지
 *
 * ⚡ PERFORMANCE: In-memory cache with 1-hour TTL.
 * Without this, every request would call 6 external APIs (~14s).
 */
import { NextResponse } from 'next/server'
import { fetchAllWelfareSources, transformListItemToBenefit } from '@/lib/welfare-api'
import type { Benefit } from '@/data/benefits'

// Force dynamic to use in-memory cache (ISR cache fails for >2MB responses)
export const dynamic = 'force-dynamic'

// ─── In-memory cache ───
let cachedBenefits: Benefit[] = []
let cacheTimestamp = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in ms
let fetchPromise: Promise<Benefit[]> | null = null // prevent duplicate fetches

async function getCachedBenefits(): Promise<Benefit[]> {
  const now = Date.now()

  // Return cache if still fresh
  if (cachedBenefits.length > 0 && now - cacheTimestamp < CACHE_TTL) {
    return cachedBenefits
  }

  // Prevent thundering herd — reuse in-flight promise
  if (fetchPromise) return fetchPromise

  fetchPromise = (async () => {
    try {
      const start = Date.now()
      const apiItems = await fetchAllWelfareSources()
      const benefits = apiItems.map((item, i) => transformListItemToBenefit(item, i))
      cachedBenefits = benefits
      cacheTimestamp = Date.now()
      console.log(`[/api/benefits] Cached ${benefits.length} benefits in ${Date.now() - start}ms`)
      return benefits
    } finally {
      fetchPromise = null
    }
  })()

  return fetchPromise
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const keyword = searchParams.get('keyword')

  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY

  if (!serviceKey || serviceKey === 'placeholder') {
    return NextResponse.json({
      success: false,
      data: [],
      source: 'no_key',
      message: 'DATA_GO_KR_SERVICE_KEY is not configured',
    })
  }

  try {
    let benefits = await getCachedBenefits()

    if (benefits.length === 0) {
      return NextResponse.json({
        success: false,
        data: [],
        source: 'api_empty',
        message: '공공데이터 API에서 데이터를 가져오지 못했습니다.',
      })
    }

    // Apply filters
    if (category && category !== 'all') {
      benefits = benefits.filter(b => b.category === category)
    }
    if (keyword) {
      benefits = benefits.filter(b =>
        b.title.includes(keyword) || b.ministry.includes(keyword) || b.description.includes(keyword)
      )
    }

    return NextResponse.json({
      success: true,
      data: benefits,
      source: cachedBenefits.length > 0 ? 'cache' : 'api',
      totalCount: benefits.length,
    })

  } catch (error) {
    console.error('[/api/benefits] Fetch Error:', error)

    // Return stale cache if available (better than error)
    if (cachedBenefits.length > 0) {
      return NextResponse.json({
        success: true,
        data: cachedBenefits,
        source: 'stale_cache',
        totalCount: cachedBenefits.length,
      })
    }

    return NextResponse.json(
      { success: false, data: [], source: 'error', message: 'API 호출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
