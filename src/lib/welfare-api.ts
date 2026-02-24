/**
 * Welfare API client — fetches real data from data.go.kr
 * 한국사회보장정보원 중앙부처 복지서비스 API
 */

const BASE_URL = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001'

// =====================
// API Response Types
// =====================
export interface WelfareListItem {
  servId: string
  servNm: string
  servDgst: string
  jurOrgNm: string        // 소관부처
  lifeNmArray: string     // 생애주기 카테고리 (comma separated)
  intrsThemNmArray: string // 관심주제 (comma separated)
  trgterIndvdlArray: string // 가구상황
  servDtlLink: string     // 복지로 상세 링크
  inqNum: number          // 조회수
  svcfrstRegTs: string    // 최초등록일
  lastModYmd: string      // 최종수정일
}

export interface WelfareDetailItem {
  servId: string
  servNm: string
  servDgst: string
  jurOrgNm: string
  trgterIndvdl: string    // 지원대상
  slctCriteria: string    // 선정기준
  alwServCn: string       // 서비스(지원)내용
  aplyMtdCn: string       // 신청방법
  applyBgnDt: string      // 신청시작일
  applyEndDt: string      // 신청종료일
  lifeNmArray: string
  intrsThemNmArray: string
  servDtlLink: string
  inqNum: number
}

// =====================
// Category Mapping
// =====================
import type { BenefitCategory, Benefit, BenefitStatus } from '@/data/benefits'

const CATEGORY_KEYWORDS: Record<BenefitCategory, string[]> = {
  'basic-living': ['기초생활', '생계급여', '기초수급', '긴급복지'],
  'near-poverty': ['차상위', '저소득'],
  'youth': ['청년', '청소년', '대학생', '도약계좌'],
  'middle-aged': ['장년', '중장년', '경력단절'],
  'senior': ['노인', '어르신', '기초연금', '노령'],
  'housing': ['주거', '월세', '임대', '전세', '주택'],
  'medical': ['의료', '건강', '보건', '치료', '간병'],
  'education': ['교육', '장학', '학비', '학자금', '돌봄'],
  'employment': ['취업', '고용', '일자리', '직업훈련', '취창업'],
  'small-biz': ['소상공인', '소공인', '자영업', '경영안정', '정책자금'],
  'startup': ['창업', '예비창업', '스타트업', '벤처'],
  'closure-restart': ['폐업', '재창업', '재기', '희망리턴'],
  'debt-relief': ['채무', '회생', '파산', '신용회복', '새출발', '워크아웃'],
}

const CATEGORY_LABELS: Record<BenefitCategory, { ko: string; en: string }> = {
  'basic-living': { ko: '기초생활수급', en: 'Basic Living' },
  'near-poverty': { ko: '차상위계층', en: 'Near Poverty' },
  'youth': { ko: '청년 지원', en: 'Youth Support' },
  'middle-aged': { ko: '장년 지원', en: 'Middle-Aged' },
  'senior': { ko: '노인 복지', en: 'Senior Welfare' },
  'housing': { ko: '주거 지원', en: 'Housing' },
  'medical': { ko: '의료 지원', en: 'Medical' },
  'education': { ko: '교육 지원', en: 'Education' },
  'employment': { ko: '취업 지원', en: 'Employment' },
  'small-biz': { ko: '소상공인 지원', en: 'Small Biz' },
  'startup': { ko: '창업 지원', en: 'Startup' },
  'closure-restart': { ko: '폐업·재창업', en: 'Closure & Restart' },
  'debt-relief': { ko: '채무조정·회생', en: 'Debt Relief' },
}

/**
 * Classify benefit into category based on keywords in title and content
 */
function classifyCategory(title: string, content: string = ''): BenefitCategory {
  const combined = `${title} ${content}`.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => combined.includes(kw))) {
      return category as BenefitCategory
    }
  }
  return 'basic-living' // fallback
}

/**
 * Calculate D-Day from application end date string
 * Supports: "YYYY.MM.DD", "YYYY-MM-DD", "YYYYMMDD", "상시", "연중"
 */
export function calculateDDay(endDateStr: string | null | undefined): number {
  if (!endDateStr) return 365

  // Handle "상시", "연중" (year-round)
  if (endDateStr.includes('상시') || endDateStr.includes('연중') || endDateStr.includes('별도')) {
    return 365
  }

  // Normalize date separators
  const cleaned = endDateStr.replace(/[.\-/]/g, '').trim()
  if (cleaned.length < 8) return 365

  const year = parseInt(cleaned.substring(0, 4))
  const month = parseInt(cleaned.substring(4, 6)) - 1
  const day = parseInt(cleaned.substring(6, 8))

  if (isNaN(year) || isNaN(month) || isNaN(day)) return 365

  const endDate = new Date(year, month, day, 23, 59, 59)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

/**
 * Determine benefit status based on dates
 */
function getStatus(startDateStr: string | null, endDateStr: string | null): BenefitStatus {
  const dDay = calculateDDay(endDateStr)
  if (dDay < 0) return 'closed'

  if (startDateStr) {
    const startDDay = calculateDDay(startDateStr)
    if (startDDay > 0) return 'upcoming'
  }

  return 'open'
}

// =====================
// XML Parsing Utilities
// =====================

/** Get single XML tag value */
function xmlGet(text: string, tag: string): string {
  const m = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`))
  return m ? m[1].trim() : ''
}

/** Get all values of a repeated XML tag */
function xmlGetAll(text: string, tag: string): string[] {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`, 'g')
  const results: string[] = []
  let m
  while ((m = re.exec(text)) !== null) results.push(m[1].trim())
  return results
}

/** Extract all <item> blocks and parse them into objects with specified fields */
function xmlParseItems(text: string, fields: string[]): Record<string, string>[] {
  const itemBlocks = text.match(/<servList>[\s\S]*?<\/servList>/g) ?? []
  return itemBlocks.map(block => {
    const obj: Record<string, string> = {}
    for (const f of fields) obj[f] = xmlGet(block, f)
    return obj
  })
}

// =====================
// API Fetching
// =====================

/**
 * Fetch welfare service list from data.go.kr
 */
export async function fetchWelfareList(pageNo = 1, numOfRows = 500): Promise<WelfareListItem[]> {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY
  if (!serviceKey) {
    console.warn('[welfare-api] DATA_GO_KR_SERVICE_KEY not set')
    return []
  }

  // ⚠️ srchKeyCode=001 필수 — 없으면 resultCode:10 에러
  // ⚠️ _type=json 무시됨 — XML 파싱으로 처리
  const url = `${BASE_URL}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&srchKeyCode=001&pageNo=${pageNo}&numOfRows=${numOfRows}`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } }) // ISR 1h cache
    if (!res.ok) {
      console.error(`[welfare-api] List fetch failed: ${res.status}`)
      return []
    }

    const text = await res.text()
    const resultCode = xmlGet(text, 'resultCode')
    if (resultCode !== '0' && resultCode !== '00') {
      console.error(`[welfare-api] API error: ${resultCode} - ${xmlGet(text, 'resultMessage')}`)
      return []
    }

    const LIST_FIELDS = ['servId', 'servNm', 'servDgst', 'jurMnofNm', 'lifeArray', 'intrsThemaArray', 'trgterIndvdlArray', 'servDtlLink', 'inqNum', 'svcfrstRegTs', 'lastModYmd']
    const items = xmlParseItems(text, LIST_FIELDS)
    return items as unknown as WelfareListItem[]
  } catch (err) {
    console.error('[welfare-api] List fetch error:', err)
    return []
  }
}

/**
 * Fetch ALL welfare services across all pages
 * Automatically paginates to retrieve all records from data.go.kr
 */
export async function fetchAllWelfareList(): Promise<WelfareListItem[]> {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY
  if (!serviceKey) return []

  const numOfRows = 500
  const allItems: WelfareListItem[] = []
  const LIST_FIELDS = ['servId', 'servNm', 'servDgst', 'jurMnofNm', 'lifeArray', 'intrsThemaArray', 'trgterIndvdlArray', 'servDtlLink', 'inqNum', 'svcfrstRegTs', 'lastModYmd']

  try {
    // First page to get totalCount
    const firstUrl = `${BASE_URL}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&srchKeyCode=001&pageNo=1&numOfRows=${numOfRows}`
    const firstRes = await fetch(firstUrl, { next: { revalidate: 3600 } })
    if (!firstRes.ok) return []

    const firstText = await firstRes.text()
    const resultCode = xmlGet(firstText, 'resultCode')
    if (resultCode !== '0' && resultCode !== '00') {
      console.error(`[welfare-api] API error on first page: ${resultCode}`)
      return []
    }

    const totalCount = parseInt(xmlGet(firstText, 'totalCount') || '0', 10)
    const firstItems = xmlParseItems(firstText, LIST_FIELDS)
    allItems.push(...(firstItems as unknown as WelfareListItem[]))

    console.log(`[welfare-api] Total: ${totalCount}, fetched page 1 (${allItems.length})`)

    // Fetch remaining pages in parallel (up to 10 pages max = 5000 items)
    const totalPages = Math.min(Math.ceil(totalCount / numOfRows), 10)
    if (totalPages > 1) {
      const pageNums = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
      const results = await Promise.all(
        pageNums.map(async (page) => {
          const url = `${BASE_URL}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&srchKeyCode=001&pageNo=${page}&numOfRows=${numOfRows}`
          const res = await fetch(url, { next: { revalidate: 3600 } })
          if (!res.ok) return []
          const text = await res.text()
          return xmlParseItems(text, LIST_FIELDS) as unknown as WelfareListItem[]
        })
      )
      results.forEach(items => allItems.push(...items))
    }

    console.log(`[welfare-api] Total fetched: ${allItems.length} items`)
    return allItems
  } catch (err) {
    console.error('[welfare-api] fetchAllWelfareList error:', err)
    return []
  }
}

/**
 * Fetch welfare service detail from data.go.kr
 */
export async function fetchWelfareDetail(servId: string): Promise<WelfareDetailItem | null> {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY
  if (!serviceKey) return null

  const url = `${BASE_URL}/NationalWelfaredetailedV001?serviceKey=${serviceKey}&callTp=D&servId=${servId}&_type=json`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const data = await res.json()
    const item = data?.response?.body?.items?.item
    if (!item) return null
    return Array.isArray(item) ? item[0] : item
  } catch (err) {
    console.error('[welfare-api] Detail fetch error:', err)
    return null
  }
}

// =====================
// Transform to Benefit type
// =====================

/**
 * Transform API list item to Benefit type
 */
export function transformListItemToBenefit(item: WelfareListItem, index: number): Benefit {
  const category = classifyCategory(item.servNm, item.servDgst)
  const labels = CATEGORY_LABELS[category]

  return {
    id: item.servId || `api-${index}`,
    title: item.servNm || '(제목 없음)',
    titleEn: item.servNm || '(No Title)',
    category,
    categoryLabel: labels.ko,
    categoryLabelEn: labels.en,
    amount: item.servDgst || '상세 페이지 확인',
    amountEn: item.servDgst || 'See details',
    description: item.servDgst || '',
    descriptionEn: item.servDgst || '',
    applicationStart: '',
    applicationEnd: '',
    dDay: 365,
    status: 'open' as BenefitStatus,
    applyUrl: item.servDtlLink || 'https://www.bokjiro.go.kr',
    ministry: item.jurOrgNm || '미정',
    ministryEn: item.jurOrgNm || 'TBD',
    steps: [],
    documents: [],
    documentsEn: [],
    eligibilityChecks: [],
    popular: (item.inqNum || 0) > 1000,
    new: (() => {
      // svcfrstRegTs: 최초등록일 — 90일 이내면 신규
      const ts = String(item.svcfrstRegTs || '')
      const dateStr = ts.replace(/[\s.\-/T:]/g, '').substring(0, 8)
      if (dateStr.length < 8) return false
      try {
        const regDate = new Date(
          parseInt(dateStr.substring(0, 4)),
          parseInt(dateStr.substring(4, 6)) - 1,
          parseInt(dateStr.substring(6, 8))
        )
        const daysDiff = (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysDiff <= 90
      } catch { return false }
    })(),
  }
}

/**
 * Transform API detail item to Benefit type (richer data)
 */
export function transformDetailToBenefit(item: WelfareDetailItem): Benefit {
  const category = classifyCategory(item.servNm, `${item.trgterIndvdl} ${item.alwServCn}`)
  const labels = CATEGORY_LABELS[category]

  const startDate = item.applyBgnDt || ''
  const endDate = item.applyEndDt || ''
  const dDay = calculateDDay(endDate)
  const status = getStatus(startDate, endDate)

  // Parse application method into steps
  const steps = item.aplyMtdCn
    ? item.aplyMtdCn.split(/[.\n]/).filter(s => s.trim()).slice(0, 4).map((s, i) => ({
        title: `Step ${i + 1}`,
        titleEn: `Step ${i + 1}`,
        desc: s.trim(),
        descEn: s.trim(),
      }))
    : []

  return {
    id: item.servId,
    title: item.servNm || '(제목 없음)',
    titleEn: item.servNm || '(No Title)',
    category,
    categoryLabel: labels.ko,
    categoryLabelEn: labels.en,
    amount: item.alwServCn?.substring(0, 60) || '상세 페이지 확인',
    amountEn: item.alwServCn?.substring(0, 60) || 'See details',
    description: item.alwServCn || item.servDgst || '',
    descriptionEn: item.alwServCn || item.servDgst || '',
    targetAge: item.trgterIndvdl || undefined,
    incomeLevel: item.slctCriteria || undefined,
    applicationStart: startDate,
    applicationEnd: endDate,
    dDay,
    status,
    applyUrl: item.servDtlLink || 'https://www.bokjiro.go.kr',
    ministry: item.jurOrgNm || '미정',
    ministryEn: item.jurOrgNm || 'TBD',
    steps,
    documents: [],
    documentsEn: [],
    eligibilityChecks: [],
    popular: (item.inqNum || 0) > 1000,
    new: false,
  }
}
