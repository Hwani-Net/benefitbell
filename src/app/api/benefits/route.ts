import { NextResponse } from 'next/server'
import { BENEFITS as mockBenefits, Benefit, BenefitCategory  } from '@/data/benefits'

// Public Data Portal API endpoint
const API_BASE = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001'

// Category mapping from API to internal category
function mapCategory(apiCategory: string): BenefitCategory {
  const lower = apiCategory?.toLowerCase() || ''
  if (lower.includes('생활') || lower.includes('기초')) return 'basic-living'
  if (lower.includes('차상위')) return 'near-poverty'
  if (lower.includes('청년') || lower.includes('청소년')) return 'youth'
  if (lower.includes('노인') || lower.includes('어르신') || lower.includes('고령')) return 'senior'
  if (lower.includes('장년') || lower.includes('중장년')) return 'middle-aged'
  if (lower.includes('주거') || lower.includes('주택')) return 'housing'
  if (lower.includes('의료') || lower.includes('건강')) return 'medical'
  if (lower.includes('교육') || lower.includes('학자')) return 'education'
  if (lower.includes('취업') || lower.includes('고용') || lower.includes('일자리')) return 'employment'
  return 'basic-living'
}

function mapCategoryLabel(cat: BenefitCategory): { ko: string; en: string } {
  const map: Record<BenefitCategory, { ko: string; en: string }> = {
    'basic-living': { ko: '기초생활수급', en: 'Basic Living' },
    'near-poverty': { ko: '차상위계층', en: 'Near Poverty' },
    'youth': { ko: '청년 지원', en: 'Youth Support' },
    'middle-aged': { ko: '장년 지원', en: 'Middle-Aged' },
    'senior': { ko: '노인 복지', en: 'Senior Welfare' },
    'housing': { ko: '주거 지원', en: 'Housing' },
    'medical': { ko: '의료 지원', en: 'Medical' },
    'education': { ko: '교육 지원', en: 'Education' },
    'employment': { ko: '취업 지원', en: 'Employment' },
  }
  return map[cat] || map['basic-living']
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiBenefitToLocal(item: any, idx: number): Benefit {
  const cat = mapCategory(item.서비스분야 || item.소관기관명 || '')
  const catLabel = mapCategoryLabel(cat)
  const title = item.서비스명 || `복지서비스 #${idx + 1}`
  const ministry = item.소관기관명 || item.부서명 || '정부기관'
  const desc = item.서비스목적요약 || item.서비스목적 || title

  return {
    id: `api-${item.서비스ID || idx}`,
    title,
    titleEn: title, // API doesn't provide English title
    category: cat,
    categoryLabel: catLabel.ko,
    categoryLabelEn: catLabel.en,
    amount: item.선정기준 || '상세 확인 필요',
    amountEn: item.선정기준 || 'See details',
    description: desc,
    descriptionEn: desc,
    targetAge: item.지원대상 || undefined,
    incomeLevel: item.선정기준 || undefined,
    applicationStart: item.신청기한?.split('~')[0]?.trim() || '상시',
    applicationEnd: item.신청기한?.split('~')[1]?.trim() || '상시',
    dDay: 30, // Default since API doesn't give specific deadlines reliably  
    status: 'open',
    applyUrl: item.신청URL || 'https://www.bokjiro.go.kr',
    ministry,
    ministryEn: ministry,
    steps: [
      { title: '온라인 신청', titleEn: 'Apply Online', desc: '복지로 또는 정부24에서 신청합니다.', descEn: 'Apply via Bokjiro or Gov24.' },
      { title: '서류 제출', titleEn: 'Submit Documents', desc: '필요서류를 제출합니다.', descEn: 'Submit required documents.' },
      { title: '심사', titleEn: 'Review', desc: '자격 요건 심사가 진행됩니다.', descEn: 'Eligibility review process.' },
      { title: '결과 안내', titleEn: 'Result', desc: '결과를 안내받습니다.', descEn: 'Receive the result.' },
    ],
    documents: ['신분증', '주민등록등본'],
    documentsEn: ['ID Card', 'Resident Registration'],
    eligibilityChecks: [
      { label: '지원 대상 확인 필요', labelEn: 'Eligibility Check Required', pass: false },
    ],
    popular: idx < 5,
    new: idx < 3,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const keyword = searchParams.get('keyword')

  const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY

  // Fallback to mock data if no API key
  if (!PUBLIC_DATA_API_KEY || PUBLIC_DATA_API_KEY === 'placeholder') {
    let filtered = [...mockBenefits]
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
    // Fetch real data from Public Data Portal
    const apiUrl = `${API_BASE}/NationalWelfarelistV001?serviceKey=${PUBLIC_DATA_API_KEY}&callTp=L&pageNo=1&numOfRows=100&srchKeyCode=003`
    
    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // Cache for 1 hour
      headers: { 'Accept': 'application/xml' },
    })

    if (!response.ok) {
      console.error('Public API Error:', response.status, response.statusText)
      // Fallback to mock on API error
      return NextResponse.json({ success: true, data: mockBenefits, source: 'mock_fallback' })
    }

    const xmlText = await response.text()
    
    // Parse XML response - extract <servList> items
    const items: Benefit[] = []
    const servListRegex = /<servList>([\s\S]*?)<\/servList>/g
    let match

    while ((match = servListRegex.exec(xmlText)) !== null) {
      const block = match[1]
      const getValue = (tag: string) => {
        const m = new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(block)
        return m ? m[1].trim() : ''
      }

      const item: Record<string, string> = {
        '서비스ID': getValue('servId'),
        '서비스명': getValue('servNm'),
        '서비스분야': getValue('servDgst') || getValue('jurMnofNm'),
        '소관기관명': getValue('jurMnofNm'),
        '부서명': getValue('jurOrgNm'),
        '서비스목적요약': getValue('servDgst'),
        '서비스목적': getValue('servDtlLink'),
        '지원대상': getValue('trgterIndvdlArray') || getValue('intrsThemaNmArray'),
        '선정기준': getValue('slctCritCn'),
        '신청기한': getValue('aplyMtdCn'),
        '신청URL': getValue('servDtlLink'),
      }

      items.push(mapApiBenefitToLocal(item, items.length))
    }

    // If XML parsing yields no results, try JSON format
    if (items.length === 0) {
      console.warn('XML parsing returned empty. Attempting JSON or falling back to mock data.')
      // Merge: API items (if any) + mock data for enrichment
      return NextResponse.json({ success: true, data: mockBenefits, source: 'mock_xml_empty' })
    }

    // Combine API data with mock data for richer UX  
    // API data first, then append unique mock items not yet in API
    const apiIds = new Set(items.map(i => i.title))
    const uniqueMock = mockBenefits.filter(m => !apiIds.has(m.title))
    const combined = [...items, ...uniqueMock]

    // Apply filters
    let filtered = combined
    if (category && category !== 'all') {
      filtered = filtered.filter(b => b.category === category)
    }
    if (keyword) {
      filtered = filtered.filter(b =>
        b.title.includes(keyword) || b.ministry.includes(keyword) || b.description.includes(keyword)
      )
    }

    return NextResponse.json({
      success: true,
      data: filtered,
      source: 'api',
      apiCount: items.length,
      totalCount: filtered.length,
    })

  } catch (error) {
    console.error('Public Data API Fetch Error:', error)
    // Always fallback to mock on error
    return NextResponse.json({ success: true, data: mockBenefits, source: 'mock_error' })
  }
}
