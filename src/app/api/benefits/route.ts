/**
 * GET /api/benefits — Fetch welfare benefits from data.go.kr
 * Uses JSON format, auto-calculates D-Day, falls back to mock data.
 */
import { NextResponse } from 'next/server'
import { fetchWelfareList, transformListItemToBenefit, calculateDDay } from '@/lib/welfare-api'
import { BENEFITS as mockBenefitsRaw, Benefit, BenefitStatus } from '@/data/benefits'

export const revalidate = 3600 // ISR: revalidate every 1 hour

/** Recalculate D-Day for mock benefits using applicationEnd */
function recalcMockBenefits(): Benefit[] {
  return mockBenefitsRaw.map(b => {
    const dDay = calculateDDay(b.applicationEnd)
    const status: BenefitStatus = dDay < 0 ? 'closed' : 'open'
    return { ...b, dDay, status }
  })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const keyword = searchParams.get('keyword')

  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY

  // No API key → mock with recalculated D-Day
  if (!serviceKey || serviceKey === 'placeholder') {
    let filtered = recalcMockBenefits()
    if (category && category !== 'all') {
      filtered = filtered.filter(b => b.category === category)
    }
    if (keyword) {
      filtered = filtered.filter(b =>
        b.title.includes(keyword) || b.ministry.includes(keyword) || b.description.includes(keyword)
      )
    }
    return NextResponse.json({ success: true, data: filtered, source: 'mock' })
  }

  try {
    // Fetch real data from data.go.kr (JSON format)
    const apiItems = await fetchWelfareList(1, 100)

    if (apiItems.length > 0) {
      const apiBenefits = apiItems.map((item, i) => transformListItemToBenefit(item, i))

      // Merge: API data first, then unique mock items (with recalculated D-Day)
      const apiTitles = new Set(apiBenefits.map(b => b.title))
      const uniqueMock = recalcMockBenefits().filter(m => !apiTitles.has(m.title))
      let combined = [...apiBenefits, ...uniqueMock]

      // Apply filters
      if (category && category !== 'all') {
        combined = combined.filter(b => b.category === category)
      }
      if (keyword) {
        combined = combined.filter(b =>
          b.title.includes(keyword) || b.ministry.includes(keyword) || b.description.includes(keyword)
        )
      }

      return NextResponse.json({
        success: true,
        data: combined,
        source: 'api',
        apiCount: apiBenefits.length,
        totalCount: combined.length,
      })
    }

    // API returned 0 items → fallback
    console.warn('[/api/benefits] API returned 0 results, using mock data')
    return NextResponse.json({ success: true, data: recalcMockBenefits(), source: 'mock_fallback' })

  } catch (error) {
    console.error('[/api/benefits] Fetch Error:', error)
    return NextResponse.json({ success: true, data: recalcMockBenefits(), source: 'mock_error' })
  }
}
