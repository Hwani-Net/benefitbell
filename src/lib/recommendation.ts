import { Benefit } from '@/data/benefits'
import { UserProfile } from './context'

/**
 * Rule-based recommendation engine (v3 — 프로필 확장, 2026-03-11).
 * 
 * ① 배치 점수: computeRuleScore() — 프로필 vs 혜택 구조화 데이터 매칭
 *    → targetAge, incomeLevel, eligibilityChecks, 임신부, 기초수급, 자녀연령, 장애등급, 건강보험, 사업자
 *    → API 호출 0건, 즉시 응답 (0ms)
 * 
 * ② 3줄 요약 / ③ 상세 분석: 여전히 AI 사용 (/api/ai-check)
 */

// ── 규칙 기반 점수 (0~95) ────────────────────────────

/**
 * Enhanced rule-based scoring — replaces AI batch scoring.
 * Uses structured fields (targetAge, incomeLevel, category, eligibilityChecks)
 * instead of GPT API calls.
 */
export function computeRuleScore(benefit: Benefit, profile: UserProfile): {
  score: number
  verdict: 'likely' | 'partial' | 'unlikely'
  summary: string
} {
  const age = new Date().getFullYear() - profile.birthYear
  let score = 10 // base score (conservative — must earn points through matching)
  const text = (benefit.title + ' ' + (benefit.description || '')).toLowerCase()
  const matchReasons: string[] = []

  // ── 1. 카테고리 매칭 (핵심 — 감점도 반영!) ─────────
  const categoryMatch = matchCategory(benefit.category, profile, age)
  score += categoryMatch.score // 불일치 시 마이너스도 반영
  if (categoryMatch.score > 0 && categoryMatch.reason) {
    matchReasons.push(categoryMatch.reason)
  }

  // ── 2. targetAge 범위 매칭 ──────────────────────
  if (benefit.targetAge) {
    const ageResult = matchTargetAge(benefit.targetAge, age)
    score += ageResult.score
    if (ageResult.reason) matchReasons.push(ageResult.reason)
  }

  // ── 3. incomeLevel 매칭 ─────────────────────────
  if (benefit.incomeLevel) {
    const incomeResult = matchIncomeLevel(benefit.incomeLevel, profile.incomePercent)
    score += incomeResult.score
    if (incomeResult.reason) matchReasons.push(incomeResult.reason)
  }

  // ── 4. 지역 매칭 (보조 가점, 핵심이 아님) ──────────
  if (profile.region) {
    const regionParts = profile.region.split(' ')
    const regionBase = regionParts[0]?.replace('광역시', '').replace('특별시', '').replace('특별자치시', '').replace('특별자치도', '') || ''
    if (regionBase && text.includes(regionBase)) {
      score += 5 // 시/도 일치 (보조)
      matchReasons.push(`거주지(${regionParts[0]}) 일치`)
    }
    if (regionParts[1] && text.includes(regionParts[1])) {
      score += 5 // 시/군/구 일치 (보조)
    }
  }

  // ── 5. 고용상태 키워드 매칭 ──────────────────────
  const empMatch = matchEmployment(profile.employmentStatus, text, benefit.category)
  if (empMatch.score > 0) {
    score += empMatch.score
    matchReasons.push(empMatch.reason)
  }

  // ── 6. 주거형태 매칭 ────────────────────────────
  if (profile.housingType === 'monthly' && (text.includes('월세') || text.includes('임차'))) {
    score += 10
    matchReasons.push('월세 거주자 대상')
  }
  if (profile.housingType === 'deposit' && (text.includes('전세') || text.includes('임차'))) {
    score += 10
    matchReasons.push('전세 거주자 대상')
  }

  // 미혼(single)이면 자녀 데이터를 무시 (UX에서 리셋 안 됐을 때의 방어적 코딩)
  const effectiveHasChildren = profile.maritalStatus !== 'single' && profile.hasChildren
  const effectiveChildrenCount = profile.maritalStatus !== 'single' ? (profile.childrenCount || 0) : 0
  const effectiveChildrenAgeGroup = profile.maritalStatus !== 'single' ? (profile.childrenAgeGroup || []) : []

  const familyKeywords = ['자녀', '육아', '양육', '아동', '유아', '초등학생', '중학생', '고등학생', '돌봄', '어린이집', '출산']
  const hasFamilyContext = familyKeywords.some(k => text.includes(k))
  if (hasFamilyContext) {
    if (effectiveHasChildren) {
      score += 15
      matchReasons.push('자녀 양육 가구 대상')
    } else {
      // 무자녀 → 자녀 혜택에 감점 (과도하지 않게 -10)
      score -= 10
    }
  }
  if (text.includes('한부모')) {
    const isSingleParent =
      (profile.maritalStatus === 'divorced') && effectiveHasChildren
    if (isSingleParent || profile.specialStatus.includes('singleParent')) {
      score += 20
      matchReasons.push('한부모 가구 대상')
    } else if (!effectiveHasChildren) {
      score -= 10 // 자녀 없으면 한부모 혜택 해당 안 됨
    }
  }

  // ── 8. 특수상태 매칭 (고배점) ────────────────────
  for (const status of profile.specialStatus) {
    const specialResult = matchSpecialStatus(status, text)
    if (specialResult.score > 0) {
      score += specialResult.score
      matchReasons.push(specialResult.reason)
    }
  }

  // ── 9. eligibilityChecks 키워드 매칭 ────────────
  if (benefit.eligibilityChecks?.length > 0) {
    const checkMatch = matchEligibilityChecks(benefit.eligibilityChecks, profile, age)
    score += checkMatch.score
  }

  // ── 10. 임신부 매칭 ───────────────────────────
  const pregnancyKeywords = ['임신', '출산', '산후', '산모', '태아', '임산부']
  const hasPregnancyContext = pregnancyKeywords.some(k => text.includes(k))
  if (hasPregnancyContext) {
    if (profile.isPregnant) {
      score += 20
      matchReasons.push('임신부 대상 혜택')
    } else {
      score -= 10
    }
  }

  // ── 11. 기초수급자 매칭 ────────────────────────
  const basicLivingKeywords = ['기초수급', '수급자', '기초생활', '생계급여', '국민기초']
  const hasBasicLivingContext = basicLivingKeywords.some(k => text.includes(k))
  if (hasBasicLivingContext) {
    if (profile.isBasicLivingRecipient) {
      score += 25
      matchReasons.push('기초수급자 대상')
    }
  }

  // ── 12. 건강보험 매칭 ─────────────────────────
  if (text.includes('의료급여') && profile.healthInsuranceType === 'medicalAid') {
    score += 15
    matchReasons.push('의료급여 대상자')
  }

  // ── 13. 사업자 혜택 매칭 ───────────────────────
  const bizKeywords = ['소상공인', '사업자', '창업', '정책자금', '융자', '정부지원금', '사업자등록']
  const hasBizContext = bizKeywords.some(k => text.includes(k))
  if (hasBizContext && profile.isBusinessOwner) {
    score += 20
    matchReasons.push('사업자 대상 혜택')
    // 업력 매칭
    if (text.includes('창업') && profile.businessAge === 'under1') {
      score += 10
      matchReasons.push('창업 1년 미만 대상')
    }
    // 매출 규모 매칭
    if ((text.includes('소상공인') || text.includes('소기업')) && 
        (profile.annualRevenue === 'under1' || profile.annualRevenue === '1to3')) {
      score += 5
    }
  }

  // ── 14. 장애등급 상세 매칭 (기존 특수상태 보완) ───
  if (text.includes('장애') && profile.disabilityGrade !== 'none') {
    if (profile.disabilityGrade === 'severe' && (text.includes('중증') || text.includes('1급') || text.includes('2급') || text.includes('3급'))) {
      score += 10 // 기존 specialStatus +20 위에 추가
      matchReasons.push('중증장애 대상')
    } else if (profile.disabilityGrade === 'mild' && (text.includes('경증') || text.includes('4급') || text.includes('5급') || text.includes('6급'))) {
      score += 5
    }
  }

  // ── 15. 자녀 연령대 상세 매칭 (기존 가족 매칭 보완) ───
  if (effectiveChildrenCount > 0 && effectiveChildrenAgeGroup.length > 0) {
    if (effectiveChildrenAgeGroup.includes('infant') && 
        ('영유아,어린이집,보육,유치원,아동수당'.split(',').some(k => text.includes(k)))) {
      score += 10
      matchReasons.push('영유아 양육 가구')
    }
    if (effectiveChildrenAgeGroup.includes('elementary') &&
        ('초등,방과후,돌봄'.split(',').some(k => text.includes(k)))) {
      score += 10
    }
    if (effectiveChildrenAgeGroup.includes('teen') &&
        ('청소년,중학,고등학,장학'.split(',').some(k => text.includes(k)))) {
      score += 10
    }
  }

  // ── 점수 제한 + 판정 ────────────────────────────
  score = Math.min(score, 95) // 절대 100% 불가 (실제 확인 필요)
  score = Math.max(score, 5)  // 최소 5%

  const verdict: 'likely' | 'partial' | 'unlikely' =
    score >= 65 ? 'likely' : score >= 35 ? 'partial' : 'unlikely'

  const summary = matchReasons.length > 0
    ? matchReasons.slice(0, 2).join(', ')
    : verdict === 'likely' ? '프로필 조건이 대체로 부합합니다.'
    : verdict === 'partial' ? '일부 조건이 일치합니다. 세부 요건을 확인하세요.'
    : '현재 프로필 기준으로 해당 가능성이 낮습니다.'

  return { score, verdict, summary }
}

// ── Helper: 카테고리 매칭 ──────────────────────────

function matchCategory(
  category: string,
  profile: UserProfile,
  age: number
): { score: number; reason: string } {
  switch (category) {
    case 'youth':
      return age >= 19 && age <= 39
        ? { score: 25, reason: '청년 대상 혜택' }
        : { score: -15, reason: '' }
    case 'senior':
      return age >= 60
        ? { score: 25, reason: '어르신 대상 혜택' }
        : { score: -15, reason: '' }
    case 'middle-aged':
      return age >= 40 && age < 65
        ? { score: 20, reason: '장년 대상 혜택' }
        : { score: -10, reason: '' }
    case 'employment':
      return profile.employmentStatus === 'jobSeeking'
        ? { score: 25, reason: '구직자 대상 취업 지원' }
        : { score: -5, reason: '' }
    case 'small-biz':
    case 'startup':
      if (profile.isBusinessOwner) {
        return { score: 25, reason: '사업자 대상 지원' }
      }
      return profile.employmentStatus === 'selfEmployed'
        ? { score: 15, reason: '자영업자 대상' }
        : { score: -15, reason: '' }
    case 'education':
      return profile.employmentStatus === 'student'
        ? { score: 25, reason: '학생 대상 교육 지원' }
        : { score: -10, reason: '' }
    case 'basic-living':
      if (profile.isBasicLivingRecipient) {
        return { score: 30, reason: '기초수급자 대상 지원' }
      }
      return profile.incomePercent <= 50
        ? { score: 20, reason: '저소득 대상 기초생활 지원' }
        : { score: -5, reason: '' }
    case 'near-poverty':
      return profile.incomePercent <= 75
        ? { score: 20, reason: '차상위 소득 대상' }
        : { score: -5, reason: '' }
    case 'housing':
      return profile.housingType !== 'owned'
        ? { score: 15, reason: '임차 거주자 대상 주거 지원' }
        : { score: -5, reason: '' }
    case 'debt-relief':
    case 'closure-restart':
      return { score: 5, reason: '' }
    case 'medical':
      return { score: 5, reason: '' }
    default:
      return { score: 0, reason: '' }
  }
}

// ── Helper: targetAge 파싱 ─────────────────────────

function matchTargetAge(targetAge: string, age: number): { score: number; reason: string } {
  // Examples: "19세~39세", "만 65세 이상", "전체", "18~34", "60세 이상"
  const normalized = targetAge.replace(/만\s*/g, '').replace(/세/g, '')

  if (normalized.includes('전체') || normalized.includes('제한없')) {
    return { score: 5, reason: '' }
  }

  // Range: "19~39", "18~34"
  const rangeMatch = normalized.match(/(\d+)\s*[~\-]\s*(\d+)/)
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1])
    const max = parseInt(rangeMatch[2])
    if (age >= min && age <= max) {
      return { score: 15, reason: `연령 조건(${min}~${max}세) 부합` }
    }
    return { score: -15, reason: '' }
  }

  // "이상": "65 이상"
  const aboveMatch = normalized.match(/(\d+)\s*이상/)
  if (aboveMatch) {
    const min = parseInt(aboveMatch[1])
    if (age >= min) return { score: 15, reason: `${min}세 이상 조건 부합` }
    return { score: -15, reason: '' }
  }

  // "이하": "34 이하"
  const belowMatch = normalized.match(/(\d+)\s*이하/)
  if (belowMatch) {
    const max = parseInt(belowMatch[1])
    if (age <= max) return { score: 15, reason: `${max}세 이하 조건 부합` }
    return { score: -15, reason: '' }
  }

  return { score: 0, reason: '' }
}

// ── Helper: 소득 매칭 ──────────────────────────────

function matchIncomeLevel(incomeLevel: string, userIncomePercent: number): { score: number; reason: string } {
  // Examples: "중위소득 50% 이하", "기준중위소득 120%", "소득기준 없음"
  if (incomeLevel.includes('없음') || incomeLevel.includes('무관') || incomeLevel.includes('제한없')) {
    return { score: 5, reason: '' }
  }

  const percentMatch = incomeLevel.match(/(\d+)\s*%/)
  if (percentMatch) {
    const threshold = parseInt(percentMatch[1])
    if (userIncomePercent <= threshold) {
      return { score: 15, reason: `소득 조건(중위소득 ${threshold}% 이하) 부합` }
    }
    return { score: -10, reason: '' }
  }

  return { score: 0, reason: '' }
}

// ── Helper: 고용상태 매칭 ──────────────────────────

function matchEmployment(
  status: string,
  text: string,
  category: string
): { score: number; reason: string } {
  if (status === 'jobSeeking') {
    if (text.includes('구직') || text.includes('취업') || text.includes('실업') || category === 'employment')
      return { score: 15, reason: '구직자 대상' }
  }
  if (status === 'selfEmployed') {
    if (text.includes('소상공인') || text.includes('자영업') || text.includes('사업자') || text.includes('창업'))
      return { score: 15, reason: '소상공인/자영업자 대상' }
  }
  if (status === 'student') {
    if (text.includes('학생') || text.includes('장학') || text.includes('대학'))
      return { score: 15, reason: '학생 대상' }
  }
  if (status === 'employed') {
    if (text.includes('근로자') || text.includes('재직'))
      return { score: 10, reason: '근로자 대상' }
  }
  return { score: 0, reason: '' }
}

// ── Helper: 특수상태 매칭 ──────────────────────────

function matchSpecialStatus(status: string, text: string): { score: number; reason: string } {
  const map: Record<string, { keywords: string[]; label: string }> = {
    disability: { keywords: ['장애', '장애인'], label: '장애인 대상' },
    singleParent: { keywords: ['한부모', '한 부모', '모자가정', '부자가정'], label: '한부모 가정 대상' },
    multicultural: { keywords: ['다문화', '결혼이민'], label: '다문화 가정 대상' },
    veteran: { keywords: ['국가유공자', '보훈'], label: '국가유공자 대상' },
  }
  const entry = map[status]
  if (!entry) return { score: 0, reason: '' }
  for (const kw of entry.keywords) {
    if (text.includes(kw)) return { score: 20, reason: entry.label }
  }
  return { score: 0, reason: '' }
}

// ── Helper: eligibilityChecks 매칭 ─────────────────

function matchEligibilityChecks(
  checks: { label: string; labelEn?: string; pass: boolean }[],
  profile: UserProfile,
  age: number
): { score: number } {
  let bonus = 0
  for (const check of checks) {
    const label = check.label.toLowerCase()
    // 나이 관련 체크
    if (label.includes('청년') && age >= 19 && age <= 39) bonus += 3
    if (label.includes('어르신') && age >= 60) bonus += 3
    // 소득 관련
    if (label.includes('저소득') && profile.incomePercent <= 50) bonus += 3
    if (label.includes('차상위') && profile.incomePercent <= 75) bonus += 3
    // 수급/보험
    if (label.includes('수급자') && profile.isBasicLivingRecipient) bonus += 5
    if (label.includes('의료급여') && profile.healthInsuranceType === 'medicalAid') bonus += 5
    if (label.includes('임신') && profile.isPregnant) bonus += 5
    // 사업자
    if ((label.includes('사업자') || label.includes('소상공인')) && profile.isBusinessOwner) bonus += 5
    // 특수상태
    for (const s of profile.specialStatus) {
      if (s === 'disability' && label.includes('장애')) bonus += 5
      if (s === 'singleParent' && label.includes('한부모')) bonus += 5
    }
  }
  return { score: Math.min(bonus, 15) } // 체크리스트 보너스 상한 15점
}

// ══════════════════════════════════════════════════
// Public API
// ══════════════════════════════════════════════════

export type FilteredBenefit = Benefit & {
  ruleScore: number
  verdict: 'likely' | 'partial' | 'unlikely'
  ruleSummary: string
}

/**
 * Get filtered benefits grouped by verdict (likely/partial/unlikely).
 * 100% rule-based — no API calls, instant response.
 */
export function getFilteredBenefits(
  benefits: Benefit[],
  profile: UserProfile,
): { likely: FilteredBenefit[]; partial: FilteredBenefit[]; unlikely: FilteredBenefit[] } {
  const likely: FilteredBenefit[] = []
  const partial: FilteredBenefit[] = []
  const unlikely: FilteredBenefit[] = []

  for (const benefit of benefits) {
    const { score, verdict, summary } = computeRuleScore(benefit, profile)
    const enriched: FilteredBenefit = {
      ...benefit,
      ruleScore: score,
      verdict,
      ruleSummary: summary,
    }

    if (verdict === 'likely') likely.push(enriched)
    else if (verdict === 'partial') partial.push(enriched)
    else unlikely.push(enriched)
  }

  // 점수 내림차순 정렬
  const sortFn = (a: FilteredBenefit, b: FilteredBenefit) => b.ruleScore - a.ruleScore
  likely.sort(sortFn)
  partial.sort(sortFn)
  unlikely.sort(sortFn)

  return { likely, partial, unlikely }
}

/**
 * Synchronous keyword-based personalization (for home page).
 * Returns only benefits with score > 0, sorted by score desc.
 */
export function getPersonalizedBenefits(benefits: Benefit[], profile: UserProfile | null): Benefit[] {
  if (!profile || !profile.birthYear || !profile.region) return benefits
  return benefits
    .map(b => ({ benefit: b, score: computeRuleScore(b, profile).score }))
    .filter(s => s.score > 20) // above base score
    .sort((a, b) => b.score - a.score)
    .map(s => s.benefit)
}
