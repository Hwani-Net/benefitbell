/**
 * AI Eligibility Engine — OpenAI-based batch eligibility assessment
 * 
 * Assesses user eligibility for benefits using profile data + benefit metadata.
 * Designed for batch processing (multiple benefits per API call) to minimize costs.
 * Falls back to keyword matching if API fails.
 */

import { UserProfile } from './context'

// ── Types ────────────────────────────────────────────
export interface EligibilityResult {
  benefitId: string
  score: number        // 0–100 eligibility percentage
  summary: string      // 3-line AI summary in Korean
  verdict: 'likely' | 'partial' | 'unlikely'
}

interface BenefitMeta {
  id: string
  title: string
  description: string
  category: string
  targetAge?: string
  incomeLevel?: string
}

// ── In-memory cache ──────────────────────────────────
// Key: `${profileHash}_${benefitId}`
const cache = new Map<string, EligibilityResult>()

function profileHash(p: UserProfile): string {
  return `${p.birthYear}_${p.gender}_${p.region}_${p.employmentStatus}_${p.housingType}_${p.incomePercent}_${p.householdSize}_${(p.specialStatus || []).sort().join(',')}`
}

// ── Batch assessment ─────────────────────────────────
/**
 * Assess eligibility for multiple benefits at once.
 * Uses a single OpenAI API call for up to 10 benefits at a time.
 * Returns cached results when available.
 */
export async function assessBatch(
  profile: UserProfile,
  benefits: BenefitMeta[],
): Promise<EligibilityResult[]> {
  const hash = profileHash(profile)
  const uncached: BenefitMeta[] = []
  const results: EligibilityResult[] = []

  // Check cache first
  for (const b of benefits) {
    const key = `${hash}_${b.id}`
    const cached = cache.get(key)
    if (cached) {
      results.push(cached)
    } else {
      uncached.push(b)
    }
  }

  if (uncached.length === 0) return results

  // Process in batches of 10
  const BATCH_SIZE = 10
  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE)
    try {
      const batchResults = await callAIEligibility(profile, batch)
      for (const r of batchResults) {
        const key = `${hash}_${r.benefitId}`
        cache.set(key, r)
        results.push(r)
      }
    } catch (err) {
      console.warn('[ai-eligibility] OpenAI batch failed, using fallback:', err)
      // Fallback: keyword-based scoring
      for (const b of batch) {
        const fallback = keywordFallback(profile, b)
        const key = `${hash}_${fallback.benefitId}`
        cache.set(key, fallback)
        results.push(fallback)
      }
    }
  }

  return results
}

// ── Single benefit assessment (for detail page) ──────
export async function assessSingle(
  profile: UserProfile,
  benefit: BenefitMeta,
): Promise<EligibilityResult> {
  const hash = profileHash(profile)
  const key = `${hash}_${benefit.id}`
  const cached = cache.get(key)
  if (cached) return cached

  try {
    const [result] = await callAIEligibility(profile, [benefit])
    cache.set(key, result)
    return result
  } catch {
    const fallback = keywordFallback(profile, benefit)
    cache.set(key, fallback)
    return fallback
  }
}

// ── Clear cache (for profile changes) ────────────────
export function clearEligibilityCache() {
  cache.clear()
}

// ── OpenAI API call (via /api/ai-eligibility route) ──
async function callAIEligibility(
  profile: UserProfile,
  benefits: BenefitMeta[],
): Promise<EligibilityResult[]> {
  const res = await fetch('/api/ai-eligibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile: {
        age: new Date().getFullYear() - profile.birthYear,
        gender: profile.gender,
        region: profile.region,
        employmentStatus: profile.employmentStatus,
        housingType: profile.housingType,
        incomePercent: profile.incomePercent,
        householdSize: profile.householdSize,
        specialStatus: profile.specialStatus,
      },
      benefits: benefits.map(b => ({
        id: b.id,
        title: b.title,
        description: b.description?.substring(0, 200) || '',
        category: b.category,
        targetAge: b.targetAge || '',
        incomeLevel: b.incomeLevel || '',
      })),
    }),
  })

  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const data = await res.json()
  return data.results as EligibilityResult[]
}

// ── Keyword fallback (no API needed) ─────────────────
function keywordFallback(profile: UserProfile, benefit: BenefitMeta): EligibilityResult {
  const age = new Date().getFullYear() - profile.birthYear
  const text = (benefit.title + ' ' + (benefit.description || '')).toLowerCase()
  let score = 30 // base score

  // Age matching
  if (age < 35 && (benefit.category === 'youth' || text.includes('청년'))) score += 20
  if (age >= 60 && (benefit.category === 'senior' || text.includes('노인') || text.includes('고령'))) score += 20
  if (age >= 40 && age < 60 && (benefit.category === 'middle-aged' || text.includes('중장년'))) score += 20

  // Region matching
  if (profile.region) {
    const parts = profile.region.split(' ')
    if (parts[0] && text.includes(parts[0].replace('광역시', '').replace('특별시', ''))) score += 10
    if (parts[1] && text.includes(parts[1])) score += 10
  }

  // Employment matching
  if (profile.employmentStatus === 'jobSeeking' && (benefit.category === 'employment' || text.includes('구직') || text.includes('취업'))) score += 15
  if (profile.employmentStatus === 'selfEmployed' && (benefit.category === 'small-biz' || text.includes('소상공인'))) score += 15
  if (profile.employmentStatus === 'student' && (benefit.category === 'education' || text.includes('학생'))) score += 15

  // Housing
  if (profile.housingType === 'monthly' && text.includes('월세')) score += 10
  if (profile.housingType === 'deposit' && text.includes('전세')) score += 10

  // Special status
  for (const status of profile.specialStatus) {
    if (status === 'disability' && text.includes('장애')) score += 15
    if (status === 'singleParent' && text.includes('한부모')) score += 15
    if (status === 'multicultural' && text.includes('다문화')) score += 15
    if (status === 'veteran' && text.includes('국가유공자')) score += 15
  }

  // Income
  if (profile.incomePercent <= 50 && (benefit.category === 'basic-living' || benefit.category === 'near-poverty')) score += 15

  score = Math.min(score, 95) // never 100% without AI verification

  const verdict: EligibilityResult['verdict'] =
    score >= 70 ? 'likely' : score >= 40 ? 'partial' : 'unlikely'

  const summaryMap = {
    likely: `프로필 기반 분석 결과, 이 혜택의 수령 가능성이 높습니다.`,
    partial: `일부 조건이 일치합니다. 세부 자격 조건을 확인해보세요.`,
    unlikely: `현재 프로필 기준으로 수령 가능성이 낮습니다.`,
  }

  return {
    benefitId: benefit.id,
    score,
    summary: summaryMap[verdict],
    verdict,
  }
}
