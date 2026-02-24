// 혜택 데이터 타입 정의

export type BenefitCategory =
  | 'basic-living'    // 기초생활수급
  | 'near-poverty'    // 차상위계층
  | 'youth'           // 청년
  | 'middle-aged'     // 장년
  | 'senior'          // 노인
  | 'housing'         // 주거
  | 'medical'         // 의료
  | 'education'       // 교육
  | 'employment'      // 취업
  | 'small-biz'       // 소상공인 지원
  | 'startup'         // 창업 지원
  | 'closure-restart' // 폐업·재창업
  | 'debt-relief'     // 채무조정·회생

export type BenefitStatus = 'open' | 'upcoming' | 'closed'

export interface Benefit {
  id: string
  title: string
  titleEn: string
  category: BenefitCategory
  categoryLabel: string
  categoryLabelEn: string
  amount: string
  amountEn: string
  description: string
  descriptionEn: string
  targetAge?: string
  incomeLevel?: string
  applicationStart: string
  applicationEnd: string
  dDay: number  // negative = closed, 0 = today, positive = days remaining
  status: BenefitStatus
  applyUrl: string
  ministry: string
  ministryEn: string
  steps: { title: string; titleEn: string; desc: string; descEn: string }[]
  documents: string[]
  documentsEn: string[]
  eligibilityChecks: { label: string; labelEn: string; pass: boolean }[]
  popular?: boolean
  new?: boolean
}

// =====================
// UI Utilities (not data — pure functions)
// =====================

export function getDDayColor(dDay: number): string {
  if (dDay < 0) return 'var(--text-tertiary)'
  if (dDay === 0) return '#ef4444'
  if (dDay <= 3) return '#f97316'
  if (dDay <= 7) return '#eab308'
  return 'var(--text-secondary)'
}

export function getDDayText(dDay: number, lang: 'ko' | 'en' = 'ko'): string {
  if (dDay < 0) return lang === 'ko' ? '마감' : 'Closed'
  if (dDay === 0) return lang === 'ko' ? 'D-Day' : 'Today!'
  return `D-${dDay}`
}

export const CATEGORY_INFO: Record<BenefitCategory, { icon: string; color: string; label: string; labelEn: string }> = {
  'basic-living': { icon: '🏠', color: '#6366f1', label: '기초생활수급', labelEn: 'Basic Living' },
  'near-poverty': { icon: '💙', color: '#8b5cf6', label: '차상위계층', labelEn: 'Near Poverty' },
  'youth': { icon: '🌱', color: '#10b981', label: '청년 지원', labelEn: 'Youth Support' },
  'middle-aged': { icon: '👔', color: '#3b82f6', label: '장년 지원', labelEn: 'Middle-Aged' },
  'senior': { icon: '👴', color: '#f59e0b', label: '노인 복지', labelEn: 'Senior Welfare' },
  'housing': { icon: '🏡', color: '#06b6d4', label: '주거 지원', labelEn: 'Housing' },
  'medical': { icon: '🏥', color: '#ef4444', label: '의료 지원', labelEn: 'Medical' },
  'education': { icon: '📚', color: '#8b5cf6', label: '교육 지원', labelEn: 'Education' },
  'employment': { icon: '💼', color: '#14b8a6', label: '취업 지원', labelEn: 'Employment' },
  'small-biz': { icon: '🏪', color: '#f97316', label: '소상공인 지원', labelEn: 'Small Biz' },
  'startup': { icon: '🚀', color: '#a855f7', label: '창업 지원', labelEn: 'Startup' },
  'closure-restart': { icon: '🔄', color: '#78716c', label: '폐업·재창업', labelEn: 'Closure & Restart' },
  'debt-relief': { icon: '💳', color: '#64748b', label: '채무조정·회생', labelEn: 'Debt Relief' },
}

/** Returns benefits expiring within N days (uses real API data passed in) */
export function getUrgentBenefits(benefits: Benefit[], daysThreshold: number): Benefit[] {
  return benefits.filter(b => b.dDay >= 0 && b.dDay <= daysThreshold && b.status !== 'closed')
}
