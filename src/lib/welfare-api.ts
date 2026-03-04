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

// ── Category classification: score-based system ─────────
// Each keyword has a weight. Title matches get 2x bonus.
// "회생" and "채무" use word-boundary regex to avoid false positives
// (e.g., "사회생활" should NOT match "회생", "채무자에게 회수" should NOT match for non-debt benefits)

interface CategoryRule {
  keywords: string[]            // simple includes() match
  patterns?: RegExp[]           // precise regex match (for ambiguous terms)
  titleBonus?: string[]         // extra score when matched in title specifically
}

const CATEGORY_RULES: Record<BenefitCategory, CategoryRule> = {
  'basic-living': {
    keywords: ['기초생활', '생계급여', '기초수급', '긴급복지', '긴급돌봄'],
  },
  'near-poverty': {
    keywords: ['차상위', '저소득'],
  },
  'youth': {
    keywords: ['청년', '청소년', '대학생', '도약계좌'],
    titleBonus: ['청년', '청소년'],
  },
  'middle-aged': {
    keywords: ['장년', '중장년', '경력단절'],
    titleBonus: ['장년', '중장년'],
  },
  'senior': {
    keywords: ['노인', '어르신', '기초연금', '노령'],
    titleBonus: ['노인', '어르신'],
  },
  'housing': {
    keywords: ['주거', '월세', '임대', '전세', '주택'],
    titleBonus: ['주거', '임대', '주택'],
  },
  'medical': {
    keywords: ['의료', '보건', '치료', '간병'],
    // "건강" 제거 — 너무 광범위 ("건강보험", "건강검진" 등 많은 혜택에 포함)
    titleBonus: ['의료'],
  },
  'education': {
    keywords: ['교육', '장학', '학비', '학자금'],
    // "돌봄" 제거 — "긴급돌봄"은 basic-living → 별도 처리
    titleBonus: ['교육', '장학'],
  },
  'employment': {
    keywords: ['취업', '고용', '일자리', '직업훈련', '취창업'],
    titleBonus: ['취업', '고용', '일자리'],
  },
  'small-biz': {
    keywords: ['소상공인', '소공인', '자영업', '경영안정', '정책자금'],
    titleBonus: ['소상공인'],
  },
  'startup': {
    keywords: ['창업', '예비창업', '스타트업', '벤처'],
    titleBonus: ['창업'],
  },
  'closure-restart': {
    keywords: ['폐업', '재창업', '희망리턴'],
    // "재기" 제거 — "재기지원"은 OK이지만 "재기할 수 있도록" 같은 일반적 문맥과 겹침
    patterns: [/재기\s*지원/, /재기\s*프로그램/],
    titleBonus: ['폐업', '재창업'],
  },
  'debt-relief': {
    keywords: ['채무조정', '채무자조정', '신용회복', '새출발', '워크아웃'],
    // "채무", "회생" 단독 사용 금지 → 복합어로만 매칭 (오분류 방지)
    // "채무조정", "개인회생", "파산면책" 등 정확한 복합어 패턴
    patterns: [/개인\s*회생/, /채무\s*조정/, /파산\s*면책/, /파산\s*신청/, /채무\s*감면/],
    titleBonus: ['채무', '회생', '파산'],
  },
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
 * Classify benefit into category based on weighted keyword scoring.
 * - Each keyword match = +1 point
 * - Each regex pattern match = +2 points (more precise)
 * - Title match bonus = +2 extra points (title is most indicative)
 * - Highest scoring category wins (ties: first in declaration order)
 */
function classifyCategory(title: string, content: string = ''): BenefitCategory {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  const combined = `${titleLower} ${contentLower}`

  let bestCategory: BenefitCategory = 'basic-living'
  let bestScore = 0

  for (const [category, rule] of Object.entries(CATEGORY_RULES) as [BenefitCategory, CategoryRule][]) {
    let score = 0

    // Simple keyword matching
    for (const kw of rule.keywords) {
      if (combined.includes(kw)) {
        score += 1
        // Title bonus: keywords in title are much more indicative
        if (titleLower.includes(kw)) score += 2
      }
    }

    // Regex pattern matching (for ambiguous terms)
    if (rule.patterns) {
      for (const pat of rule.patterns) {
        if (pat.test(combined)) score += 2
        if (pat.test(titleLower)) score += 2
      }
    }

    // Title-specific bonus keywords
    if (rule.titleBonus) {
      for (const kw of rule.titleBonus) {
        if (titleLower.includes(kw) && !rule.keywords.includes(kw)) {
          score += 3 // strong signal if title-only keyword matches
        }
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  return bestCategory
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

    // ⚠️ 실제 XML 태그: jurMnofNm(부처명), lifeArray(생애주기), intrsThemaArray(관심주제)
    const RAW_FIELDS = ['servId', 'servNm', 'servDgst', 'jurMnofNm', 'lifeArray', 'intrsThemaArray', 'trgterIndvdlArray', 'servDtlLink', 'inqNum', 'svcfrstRegTs', 'lastModYmd']
    const items = xmlParseItems(text, RAW_FIELDS).map(item => ({
      servId: item.servId,
      servNm: item.servNm,
      servDgst: item.servDgst,
      jurOrgNm: item.jurMnofNm,
      lifeNmArray: item.lifeArray,
      intrsThemNmArray: item.intrsThemaArray,
      trgterIndvdlArray: item.trgterIndvdlArray,
      servDtlLink: item.servDtlLink,
      inqNum: Number(item.inqNum) || 0,
      svcfrstRegTs: item.svcfrstRegTs,
      lastModYmd: item.lastModYmd,
    })) as WelfareListItem[]
    return items
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
  // ⚠️ 실제 XML 태그: jurMnofNm(부처명), lifeArray(생애주기), intrsThemaArray(관심주제)
  const RAW_FIELDS = ['servId', 'servNm', 'servDgst', 'jurMnofNm', 'lifeArray', 'intrsThemaArray', 'trgterIndvdlArray', 'servDtlLink', 'inqNum', 'svcfrstRegTs', 'lastModYmd']

  const remapItems = (raw: Record<string, string>[]): WelfareListItem[] =>
    raw.map(item => ({
      servId: item.servId,
      servNm: item.servNm,
      servDgst: item.servDgst,
      jurOrgNm: item.jurMnofNm,
      lifeNmArray: item.lifeArray,
      intrsThemNmArray: item.intrsThemaArray,
      trgterIndvdlArray: item.trgterIndvdlArray,
      servDtlLink: item.servDtlLink,
      inqNum: Number(item.inqNum) || 0,
      svcfrstRegTs: item.svcfrstRegTs,
      lastModYmd: item.lastModYmd,
    }))

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
    allItems.push(...remapItems(xmlParseItems(firstText, RAW_FIELDS)))

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
          return remapItems(xmlParseItems(text, RAW_FIELDS))
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

// =====================
// Source 2: 지자체복지서비스 API (LocalGovernmentWelfareInformations)
// =====================
// ⚠️ 필요: data.go.kr에서 "한국사회보장정보원_지자체복지서비스" 활용신청
// 같은 DATA_GO_KR_SERVICE_KEY를 사용하되, 별도 API에 대한 인가 필요

const LOCAL_GOV_BASE = 'https://apis.data.go.kr/B554287/LocalGovernmentWelfareInformations'

export async function fetchLocalGovWelfareList(): Promise<WelfareListItem[]> {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY
  if (!serviceKey) return []

  const numOfRows = 500
  const RAW_FIELDS = ['servId', 'servNm', 'servDgst', 'jurMnofNm', 'lifeArray', 'intrsThemaArray', 'trgterIndvdlArray', 'servDtlLink', 'inqNum', 'svcfrstRegTs', 'lastModYmd']

  const remapItems = (raw: Record<string, string>[]): WelfareListItem[] =>
    raw.map(item => ({
      servId: `LG-${item.servId}`, // Prefix to avoid ID collision with national
      servNm: item.servNm,
      servDgst: item.servDgst,
      jurOrgNm: item.jurMnofNm || '지자체',
      lifeNmArray: item.lifeArray,
      intrsThemNmArray: item.intrsThemaArray,
      trgterIndvdlArray: item.trgterIndvdlArray,
      servDtlLink: item.servDtlLink,
      inqNum: Number(item.inqNum) || 0,
      svcfrstRegTs: item.svcfrstRegTs,
      lastModYmd: item.lastModYmd,
    }))

  try {
    // Test with first page
    const firstUrl = `${LOCAL_GOV_BASE}/LcgvWelfarelist?serviceKey=${serviceKey}&callTp=L&pageNo=1&numOfRows=${numOfRows}&srchKeyCode=001`
    const firstRes = await fetch(firstUrl, { next: { revalidate: 3600 } })

    if (firstRes.status === 403 || firstRes.status === 401) {
      console.warn('[welfare-api] 지자체 API 미인가 — data.go.kr에서 활용신청 필요')
      return []
    }
    if (!firstRes.ok) return []

    const firstText = await firstRes.text()
    const resultCode = xmlGet(firstText, 'resultCode')
    if (resultCode !== '0' && resultCode !== '00') {
      console.warn(`[welfare-api] 지자체 API error: ${resultCode}`)
      return []
    }

    const allItems: WelfareListItem[] = []
    const totalCount = parseInt(xmlGet(firstText, 'totalCount') || '0', 10)
    allItems.push(...remapItems(xmlParseItems(firstText, RAW_FIELDS)))

    console.log(`[welfare-api] 지자체: ${totalCount} total, page 1 (${allItems.length})`)

    // Fetch remaining pages (max 10 pages = 5000 items)
    const totalPages = Math.min(Math.ceil(totalCount / numOfRows), 10)
    if (totalPages > 1) {
      const pageNums = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
      const results = await Promise.all(
        pageNums.map(async (page) => {
          try {
            const url = `${LOCAL_GOV_BASE}/LcgvWelfarelist?serviceKey=${serviceKey}&callTp=L&pageNo=${page}&numOfRows=${numOfRows}&srchKeyCode=001`
            const res = await fetch(url, { next: { revalidate: 3600 } })
            if (!res.ok) return []
            const text = await res.text()
            return remapItems(xmlParseItems(text, RAW_FIELDS))
          } catch { return [] }
        })
      )
      results.forEach(items => allItems.push(...items))
    }

    console.log(`[welfare-api] 지자체 total fetched: ${allItems.length}`)
    return allItems
  } catch (err) {
    console.warn('[welfare-api] 지자체 fetch error:', err)
    return []
  }
}

// =====================
// Source 3: 보조금24 API (행정안전부)
// =====================
// ⚠️ 별도 서비스키 필요: DATA_GO_KR_SUBSIDY_KEY
// data.go.kr에서 "보조금24" 검색 → 활용신청

const SUBSIDY_BASE = 'https://apis.data.go.kr/1741000/SubsidyService'

export async function fetchSubsidy24List(): Promise<WelfareListItem[]> {
  const subsidyKey = process.env.DATA_GO_KR_SUBSIDY_KEY
  if (!subsidyKey) return [] // 키 없으면 조용히 스킵

  try {
    const url = `${SUBSIDY_BASE}/getSubsidyList?serviceKey=${subsidyKey}&pageNo=1&numOfRows=500&type=json`
    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (res.status === 403 || res.status === 401 || res.status === 500) {
      console.warn('[welfare-api] 보조금24 API 미인가/에러 — data.go.kr에서 활용신청 필요')
      return []
    }
    if (!res.ok) return []

    const data = await res.json()
    const items = data?.response?.body?.items?.item
    if (!items || !Array.isArray(items)) return []

    console.log(`[welfare-api] 보조금24: ${items.length} items fetched`)

    return items.map((item: Record<string, string>) => ({
      servId: `SUB-${item.servId || item.서비스ID || ''}`,
      servNm: item.servNm || item.서비스명 || '',
      servDgst: item.servDgst || item.서비스요약 || '',
      jurOrgNm: item.jurOrgNm || item.소관기관명 || '행정안전부',
      lifeNmArray: '',
      intrsThemNmArray: '',
      trgterIndvdlArray: '',
      servDtlLink: item.servDtlLink || '',
      inqNum: Number(item.inqNum) || 0,
      svcfrstRegTs: '',
      lastModYmd: item.lastModYmd || '',
    }))
  } catch (err) {
    console.warn('[welfare-api] 보조금24 fetch error:', err)
    return []
  }
}

// =====================
// Source 4: 기업마당 API (bizinfo.go.kr) — 중소기업/소상공인 지원사업
// =====================
// ⚠️ 별도 서비스키 필요: BIZINFO_API_KEY
// https://www.bizinfo.go.kr/apiDetail.do?id=bizinfoApi 에서 발급

const BIZINFO_URL = 'https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do'

export async function fetchBizinfoList(): Promise<WelfareListItem[]> {
  const bizKey = process.env.BIZINFO_API_KEY
  if (!bizKey) return []

  try {
    const url = `${BIZINFO_URL}?crtfcKey=${bizKey}&dataType=json&searchCnt=1000`
    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) {
      console.warn(`[welfare-api] 기업마당 API error: ${res.status}`)
      return []
    }

    const data = await res.json()
    const items = data?.jsonArray
    if (!items || !Array.isArray(items)) return []

    console.log(`[welfare-api] 기업마당: ${items.length} items (totCnt: ${items[0]?.totCnt || '?'})`)

    return items.map((item: Record<string, string>) => ({
      servId: `BIZ-${item.pblancId || ''}`,
      servNm: item.pblancNm || '',
      servDgst: item.bsnsSumryCn || item.pblancNm || '',
      jurOrgNm: item.jrsdInsttNm || item.excInsttNm || '중소벤처기업부',
      lifeNmArray: '',
      intrsThemNmArray: item.pldirSportRealmLclasCodeNm || '',
      trgterIndvdlArray: item.trgetNm || '',
      servDtlLink: item.rceptEngnHmpgUrl || (item.pblancUrl ? `https://www.bizinfo.go.kr${item.pblancUrl}` : ''),
      inqNum: Number(item.inqireCo) || 0,
      svcfrstRegTs: item.creatPnttm || '',
      lastModYmd: item.creatPnttm?.substring(0, 10) || '',
    }))
  } catch (err) {
    console.warn('[welfare-api] 기업마당 fetch error:', err)
    return []
  }
}

// =====================
// Source 5: K-Startup API (창업진흥원) — 창업지원 사업공고
// =====================
// data.go.kr 키 사용 (동일 SERVICE_KEY)
// https://www.data.go.kr/data/15125364/openapi.do

const KSTARTUP_BASE = 'https://apis.data.go.kr/B552735/kisedKstartupService01'

export async function fetchKStartupList(): Promise<WelfareListItem[]> {
  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY
  if (!serviceKey) return []

  try {
    // 사업공고 API — 최신 500건 가져오기
    const url = `${KSTARTUP_BASE}/getAnnouncementInformation01?serviceKey=${encodeURIComponent(serviceKey)}&pageNo=1&numOfRows=500`
    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (res.status === 403 || res.status === 401) {
      console.warn('[welfare-api] K-Startup API 미인가 — data.go.kr 활용신청 필요')
      return []
    }
    if (!res.ok) return []

    const xml = await res.text()

    // Parse totalCount
    const tcMatch = xml.match(/<totalCount>(\d+)<\/totalCount>/)
    const totalCount = tcMatch ? Number(tcMatch[1]) : 0

    // Parse XML items
    const itemBlocks = xml.split('<item>').slice(1)
    const items: WelfareListItem[] = []

    for (const block of itemBlocks) {
      const getCol = (name: string) => {
        const m = block.match(new RegExp(`col name="${name}">(.*?)</col`, 's'))
        return m?.[1]?.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#xD;&#xA;/g, ' ').replace(/&amp;#\d+;/g, '') || ''
      }

      // 모집중인 공고만 포함
      const isRecruiting = getCol('rcrt_prgs_yn')
      if (isRecruiting !== 'Y') continue

      const pbancSn = getCol('pbanc_sn') || getCol('id')
      const title = getCol('biz_pbanc_nm') || getCol('intg_pbanc_biz_nm') || getCol('pbanc_nm')
      const detlUrl = getCol('detl_pg_url')

      items.push({
        servId: `KSU-${pbancSn}`,
        servNm: title,
        servDgst: getCol('aply_trgt_ctnt') || getCol('pbanc_ctnt') || title,
        jurOrgNm: getCol('sprv_inst') || '창업진흥원',
        lifeNmArray: '',
        intrsThemNmArray: getCol('supt_biz_clsfc') || '창업지원',
        trgterIndvdlArray: getCol('aply_trgt') || '',
        servDtlLink: detlUrl.startsWith('http') ? detlUrl : (detlUrl ? `https://${detlUrl}` : ''),
        inqNum: 0,
        svcfrstRegTs: '',
        lastModYmd: getCol('pbanc_rcpt_bgng_dt')?.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || '',
      })
    }

    console.log(`[welfare-api] K-Startup: ${items.length} recruiting / ${totalCount} total`)
    return items
  } catch (err) {
    console.warn('[welfare-api] K-Startup fetch error:', err)
    return []
  }
}

// =====================
// Source 6: 민간복지서비스 (정적 CSV 데이터 — data.go.kr 15116392)
// =====================
// 한국사회보장정보원에서 제공하는 민간 복지서비스 정보 (335건)
// API가 아닌 파일데이터 → JSON으로 변환하여 정적 임포트

import privateWelfareData from '@/data/private-welfare.json'

interface PrivateWelfareItem {
  id: string
  orgName: string
  name: string
  startDate: string
  endDate: string
  purpose: string
  target: string
  content: string
  howToApply: string
  documents: string
  etc: string
  lifeCycle: string
  household: string
  interest: string
}

function getPrivateWelfareList(): WelfareListItem[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (privateWelfareData as PrivateWelfareItem[])
    .filter(item => {
      // 만료된 사업 제외 (endDate가 오늘 이전이면 스킵)
      if (item.endDate) {
        const end = new Date(item.endDate)
        if (!isNaN(end.getTime()) && end < today) return false
      }
      return true
    })
    .map(item => ({
      servId: item.id,
      servNm: item.name,
      servDgst: item.content || item.purpose || item.name,
      jurOrgNm: item.orgName || '민간',
      lifeNmArray: item.lifeCycle || '',
      intrsThemNmArray: item.interest || '',
      trgterIndvdlArray: item.household || '',
      servDtlLink: '',
      inqNum: 0,
      svcfrstRegTs: item.startDate || '',
      lastModYmd: item.endDate || '',
    }))
}

// =====================
// Unified Data Fetcher — All Sources Combined
// =====================

/**
 * Fetch and merge welfare data from ALL available sources.
 * Each source is opt-in based on env variables — no code change needed.
 *
 * Sources:
 * 1. 중앙부처 복지서비스 (DATA_GO_KR_SERVICE_KEY)
 * 2. 지자체 복지서비스 (same key, separate API auth)
 * 3. 보조금24 (DATA_GO_KR_SUBSIDY_KEY)
 * 4. 기업마당 (BIZINFO_API_KEY) — 중소기업/소상공인 지원사업
 * 5. K-Startup (DATA_GO_KR_SERVICE_KEY) — 창업지원 사업공고
 * 6. 민간복지서비스 (정적 JSON 데이터) — 335건
 *
 * Deduplication: by servId (stripped of source prefix)
 */
export async function fetchAllWelfareSources(): Promise<WelfareListItem[]> {
  // Source 6: 정적 데이터 (동기)
  const privateWelfare = getPrivateWelfareList()

  // Fetch all API sources in parallel
  const [national, local, subsidy, bizinfo, kstartup] = await Promise.all([
    fetchAllWelfareList(),
    fetchLocalGovWelfareList(),
    fetchSubsidy24List(),
    fetchBizinfoList(),
    fetchKStartupList(),
  ])

  // Stats logging
  const stats = {
    national: national.length,
    local: local.length,
    subsidy: subsidy.length,
    bizinfo: bizinfo.length,
    kstartup: kstartup.length,
    privateWelfare: privateWelfare.length,
    total: 0,
  }

  // Merge with deduplication (national has priority)
  const seen = new Set<string>()
  const merged: WelfareListItem[] = []

  for (const item of [...national, ...local, ...subsidy, ...bizinfo, ...kstartup, ...privateWelfare]) {
    // Normalize ID for dedup (strip source prefix)
    const rawId = item.servId.replace(/^(LG-|SUB-|BIZ-|KSU-|PW-)/, '')
    if (!rawId || seen.has(rawId)) continue
    seen.add(rawId)
    merged.push(item)
  }

  stats.total = merged.length
  console.log(`[welfare-api] 📊 Sources: 중앙부처=${stats.national}, 지자체=${stats.local}, 보조금24=${stats.subsidy}, 기업마당=${stats.bizinfo}, K-Startup=${stats.kstartup}, 민간복지=${stats.privateWelfare} → 통합 ${stats.total}건`)

  return merged
}



