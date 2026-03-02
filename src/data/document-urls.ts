/**
 * Document URL Mapping — 공통 서류 → 정부24 발급 URL
 *
 * Phase 6: 서류 원스톱
 * Whitelist-based matching to prevent hallucination.
 * If a document name from the API matches a known document,
 * we link to the exact government issuance page.
 */

export interface DocumentInfo {
  /** Display name in Korean */
  name: string
  /** Normalized aliases (for fuzzy matching from API data) */
  aliases: string[]
  /** Direct issuance URL on 정부24 or relevant site */
  issueUrl: string
  /** Whether the document can be issued online for free */
  freeOnline: boolean
  /** Short description of the document */
  description: string
  /** Category for grouping */
  category: 'identity' | 'income' | 'housing' | 'insurance' | 'family' | 'other'
}

/**
 * Curated whitelist of commonly required welfare documents.
 * Each entry maps to a direct 정부24 issuance URL where available.
 */
export const DOCUMENT_DATABASE: DocumentInfo[] = [
  // ── 신원/신분 관련 ────────────────────────
  {
    name: '주민등록등본',
    aliases: ['주민등록등본', '등본', '주민등본', '주민등록 등본'],
    issueUrl: 'https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=A01010&CappBizCD=13100000015',
    freeOnline: true,
    description: '세대 구성원 확인',
    category: 'identity',
  },
  {
    name: '주민등록초본',
    aliases: ['주민등록초본', '초본', '주민초본'],
    issueUrl: 'https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=A01010&CappBizCD=13100000016',
    freeOnline: true,
    description: '개인 주소 이력 확인',
    category: 'identity',
  },
  // ── 소득/재산 관련 ────────────────────────
  {
    name: '소득금액증명원',
    aliases: ['소득금액증명원', '소득금액증명', '소득증명', '소득금액 증명원', '소득금액증명서'],
    issueUrl: 'https://www.hometax.go.kr',
    freeOnline: true,
    description: '연간 소득 금액 증명 (홈택스)',
    category: 'income',
  },
  {
    name: '사업자등록증명원',
    aliases: ['사업자등록증명원', '사업자등록증명', '사업자등록증', '사업자 등록증'],
    issueUrl: 'https://www.hometax.go.kr',
    freeOnline: true,
    description: '사업자 등록 확인 (홈택스)',
    category: 'income',
  },
  {
    name: '납세증명서',
    aliases: ['납세증명서', '납세증명', '국세납세증명', '국세 납세증명'],
    issueUrl: 'https://www.hometax.go.kr',
    freeOnline: true,
    description: '세금 납부 확인 (홈택스)',
    category: 'income',
  },
  {
    name: '재산세 과세증명서',
    aliases: ['재산세 과세증명서', '재산세 과세증명', '재산세 증명', '재산세과세증명'],
    issueUrl: 'https://www.wetax.go.kr',
    freeOnline: true,
    description: '재산세 납부 내역 (위택스)',
    category: 'income',
  },
  // ── 주거 관련 ────────────────────────────
  {
    name: '임대차계약서',
    aliases: ['임대차계약서', '임대차 계약서', '전세계약서', '월세계약서', '임대차계약서 사본'],
    issueUrl: '',
    freeOnline: false,
    description: '본인 보관 서류 (사본 제출)',
    category: 'housing',
  },
  {
    name: '건축물대장',
    aliases: ['건축물대장', '건축물 대장', '건물대장'],
    issueUrl: 'https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=A01010&CappBizCD=15000000089',
    freeOnline: true,
    description: '건물 정보 확인',
    category: 'housing',
  },
  {
    name: '등기부등본',
    aliases: ['등기부등본', '등기부 등본', '부동산등기부등본', '부동산 등기부등본'],
    issueUrl: 'https://www.iros.go.kr',
    freeOnline: false,
    description: '부동산 등기 확인 (인터넷등기소, 유료)',
    category: 'housing',
  },
  // ── 보험/건강 관련 ────────────────────────
  {
    name: '건강보험자격득실확인서',
    aliases: ['건강보험자격득실확인서', '건강보험 자격득실확인서', '건강보험자격확인서', '건강보험자격 득실확인서', '자격득실확인서'],
    issueUrl: 'https://www.nhis.or.kr',
    freeOnline: true,
    description: '건강보험 가입 이력 (국민건강보험)',
    category: 'insurance',
  },
  {
    name: '건강보험료 납부확인서',
    aliases: ['건강보험료 납부확인서', '건강보험료납부확인서', '건강보험료 납부 확인서', '보험료 납부확인서'],
    issueUrl: 'https://www.nhis.or.kr',
    freeOnline: true,
    description: '건보료 납부 내역 (국민건강보험)',
    category: 'insurance',
  },
  {
    name: '국민연금 가입증명서',
    aliases: ['국민연금 가입증명서', '국민연금가입증명서', '연금 가입증명', '국민연금 가입 확인서'],
    issueUrl: 'https://www.nps.or.kr',
    freeOnline: true,
    description: '국민연금 가입 확인 (NPS)',
    category: 'insurance',
  },
  {
    name: '고용보험 피보험자격 이력내역서',
    aliases: ['고용보험 피보험자격 이력내역서', '고용보험 이력내역서', '고용보험 피보험자격', '고용보험이력내역서'],
    issueUrl: 'https://www.ei.go.kr',
    freeOnline: true,
    description: '고용보험 가입 이력 (고용보험)',
    category: 'insurance',
  },
  // ── 가족 관련 ────────────────────────────
  {
    name: '가족관계증명서',
    aliases: ['가족관계증명서', '가족관계 증명서', '가족증명서'],
    issueUrl: 'https://efamily.scourt.go.kr',
    freeOnline: true,
    description: '가족 관계 확인 (대법원)',
    category: 'family',
  },
  {
    name: '혼인관계증명서',
    aliases: ['혼인관계증명서', '혼인관계 증명서', '혼인증명서'],
    issueUrl: 'https://efamily.scourt.go.kr',
    freeOnline: true,
    description: '혼인 관계 확인 (대법원)',
    category: 'family',
  },
  {
    name: '기본증명서',
    aliases: ['기본증명서', '기본 증명서'],
    issueUrl: 'https://efamily.scourt.go.kr',
    freeOnline: true,
    description: '출생·사망·국적 등 기본 사항 (대법원)',
    category: 'family',
  },
  // ── 기타 ─────────────────────────────────
  {
    name: '장애인증명서',
    aliases: ['장애인증명서', '장애인 증명서', '장애인등록증', '장애증명서'],
    issueUrl: 'https://www.gov.kr/mw/AA020InfoCappView.do?HighCtgCD=A09002&CappBizCD=16100000035',
    freeOnline: true,
    description: '장애인 등록 확인',
    category: 'other',
  },
  {
    name: '국가유공자확인서',
    aliases: ['국가유공자확인서', '국가유공자 확인서', '국가유공자 증명서', '국가유공자증명서'],
    issueUrl: 'https://www.mpva.go.kr',
    freeOnline: true,
    description: '국가유공자 확인 (보훈처)',
    category: 'other',
  },
  {
    name: '통장 사본',
    aliases: ['통장 사본', '통장사본', '통장 앞면 사본', '예금통장 사본'],
    issueUrl: '',
    freeOnline: false,
    description: '본인 보관 서류',
    category: 'other',
  },
  {
    name: '신분증 사본',
    aliases: ['신분증 사본', '신분증사본', '주민등록증 사본', '신분증'],
    issueUrl: '',
    freeOnline: false,
    description: '본인 보관 서류',
    category: 'identity',
  },
]

/**
 * Match a raw document name from the API against our whitelist.
 * Returns the DocumentInfo if found, null otherwise.
 * Uses simple substring/exact matching — no AI needed.
 */
export function matchDocument(rawName: string): DocumentInfo | null {
  const normalized = rawName.trim().replace(/\s+/g, ' ')

  // 1. Exact alias match
  for (const doc of DOCUMENT_DATABASE) {
    if (doc.aliases.some(a => a === normalized)) return doc
  }

  // 2. Substring match (rawName contains alias OR alias contains rawName)
  for (const doc of DOCUMENT_DATABASE) {
    if (doc.aliases.some(a => normalized.includes(a) || a.includes(normalized))) return doc
  }

  return null
}

/**
 * Match multiple document names and return enriched results.
 * Unmatched documents are returned with issueUrl = '' (manual docs).
 */
export function matchDocuments(rawNames: string[]): Array<DocumentInfo & { matched: boolean }> {
  return rawNames
    .filter(name => name.trim().length > 0)
    .map(rawName => {
      const match = matchDocument(rawName)
      if (match) {
        return { ...match, matched: true }
      }
      return {
        name: rawName.trim(),
        aliases: [],
        issueUrl: '',
        freeOnline: false,
        description: '',
        category: 'other' as const,
        matched: false,
      }
    })
}
