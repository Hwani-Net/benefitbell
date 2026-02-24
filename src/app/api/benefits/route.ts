/**
 * GET /api/benefits — Fetch welfare benefits from data.go.kr
 * Real government data only. No mock/fake data.
 */
import { NextResponse } from 'next/server'
import { fetchAllWelfareList, transformListItemToBenefit } from '@/lib/welfare-api'
import type { Benefit } from '@/data/benefits'

export const revalidate = 3600 // ISR: revalidate every 1 hour

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
    const apiItems = await fetchAllWelfareList()

    if (apiItems.length === 0) {
      return NextResponse.json({
        success: false,
        data: [],
        source: 'api_empty',
        message: '공공데이터 API에서 데이터를 가져오지 못했습니다.',
      })
    }

    let benefits: Benefit[] = apiItems.map((item, i) => transformListItemToBenefit(item, i))

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
      source: 'api',
      totalCount: benefits.length,
    })

  } catch (error) {
    console.error('[/api/benefits] Fetch Error:', error)
    return NextResponse.json(
      { success: false, data: [], source: 'error', message: 'API 호출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
