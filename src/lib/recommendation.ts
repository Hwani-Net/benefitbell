import { Benefit } from '@/data/benefits'
import { UserProfile } from './context'
import { assessBatch, EligibilityResult, clearEligibilityCache } from './ai-eligibility'

/**
 * Enhanced recommendation engine.
 * 1. AI-powered: Calls OpenRouter for eligibility % scoring (async)
 * 2. Keyword fallback: Instant scoring without API call (sync)
 * 
 * The AI assessment runs asynchronously via assessBatch().
 * Use getPersonalizedBenefits() for instant keyword results.
 * Use getAiPersonalizedBenefits() for AI-enhanced results.
 */

// Re-export for convenience
export { clearEligibilityCache }

/**
 * Synchronous keyword-based personalization (instant, no API call).
 * Used as initial render while AI scores load.
 */
/**
 * Compute keyword score for a single benefit against a profile.
 */
function computeKeywordScore(benefit: Benefit, profile: UserProfile): number {
  const age = new Date().getFullYear() - profile.birthYear
  let score = 0
  const text = (benefit.title + ' ' + (benefit.description || '')).toLowerCase()

  // Age
  if (age < 35 && (benefit.category === 'youth' || text.includes('청년'))) score += 10
  if (age >= 60 && (benefit.category === 'senior' || text.includes('노인') || text.includes('고령'))) score += 10
  if (age >= 40 && age < 60 && (benefit.category === 'middle-aged' || text.includes('중장년'))) score += 10

  // Region
  if (profile.region) {
    const parts = profile.region.split(' ')
    if (parts[0] && text.includes(parts[0].replace('광역시', '').replace('특별시', ''))) score += 15
    if (parts[1] && text.includes(parts[1])) score += 20
  }

  // Employment
  if (profile.employmentStatus === 'jobSeeking' && (benefit.category === 'employment' || text.includes('구직') || text.includes('취업'))) score += 15
  if (profile.employmentStatus === 'selfEmployed' && (benefit.category === 'small-biz' || benefit.category === 'startup' || text.includes('소상공인') || text.includes('자영업'))) score += 15
  if (profile.employmentStatus === 'student' && (benefit.category === 'education' || text.includes('학생') || text.includes('장학'))) score += 15

  // Housing
  if (profile.housingType === 'monthly' && text.includes('월세')) score += 10
  if (profile.housingType === 'deposit' && text.includes('전세')) score += 10

  // Special status
  for (const status of profile.specialStatus) {
    if (status === 'disability' && text.includes('장애')) score += 20
    if (status === 'singleParent' && text.includes('한부모')) score += 20
    if (status === 'multicultural' && text.includes('다문화')) score += 20
    if (status === 'veteran' && text.includes('국가유공자')) score += 20
  }

  // Income
  if (profile.incomePercent <= 50 && (benefit.category === 'basic-living' || benefit.category === 'near-poverty')) score += 15

  return score
}

/**
 * Synchronous keyword-based personalization (instant, no API call).
 * Returns only benefits with score > 0, sorted by score desc.
 */
export function getPersonalizedBenefits(benefits: Benefit[], profile: UserProfile | null): Benefit[] {
  if (!profile) return benefits
  const scored = benefits.map(benefit => ({ benefit, score: computeKeywordScore(benefit, profile) }))
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.benefit)
}

/**
 * Keyword-scored ALL benefits (including 0-score) for full filtering UI.
 * Returns { benefit, keywordScore } pairs sorted by score desc.
 */
export function getAllScoredBenefits(
  benefits: Benefit[],
  profile: UserProfile,
): { benefit: Benefit; keywordScore: number }[] {
  return benefits
    .map(benefit => ({ benefit, keywordScore: computeKeywordScore(benefit, profile) }))
    .sort((a, b) => b.keywordScore - a.keywordScore)
}

export type FilteredBenefit = Benefit & {
  keywordScore: number
  aiScore?: number
  aiVerdict?: 'likely' | 'partial' | 'unlikely'
  aiSummary?: string
}

/**
 * Merge keyword scores + AI scores into a unified filtered list.
 * Groups: likely → partial → unscored → unlikely
 */
export function getFilteredBenefits(
  benefits: Benefit[],
  profile: UserProfile,
  aiScores: Map<string, { score: number; verdict: string; summary: string }>,
): { likely: FilteredBenefit[]; partial: FilteredBenefit[]; unlikely: FilteredBenefit[] } {
  const all = getAllScoredBenefits(benefits, profile)

  const likely: FilteredBenefit[] = []
  const partial: FilteredBenefit[] = []
  const unlikely: FilteredBenefit[] = []

  for (const { benefit, keywordScore } of all) {
    const ai = aiScores.get(benefit.id)
    const enriched: FilteredBenefit = {
      ...benefit,
      keywordScore,
      aiScore: ai?.score,
      aiVerdict: ai?.verdict as FilteredBenefit['aiVerdict'],
      aiSummary: ai?.summary,
    }

    if (ai) {
      if (ai.verdict === 'likely') likely.push(enriched)
      else if (ai.verdict === 'partial') partial.push(enriched)
      else unlikely.push(enriched)
    } else {
      // No AI score yet — use keyword score to bucket
      if (keywordScore >= 25) likely.push(enriched)
      else if (keywordScore >= 10) partial.push(enriched)
      else unlikely.push(enriched)
    }
  }

  // Sort each group by AI score (if available) then keyword score
  const sortFn = (a: FilteredBenefit, b: FilteredBenefit) => {
    if (a.aiScore !== undefined && b.aiScore !== undefined) return b.aiScore - a.aiScore
    if (a.aiScore !== undefined) return -1
    if (b.aiScore !== undefined) return 1
    return b.keywordScore - a.keywordScore
  }
  likely.sort(sortFn)
  partial.sort(sortFn)
  unlikely.sort(sortFn)

  return { likely, partial, unlikely }
}

/**
 * AI-enhanced personalization (async, uses OpenRouter API).
 * Returns benefits with aiScore and aiSummary attached.
 * Falls back to keyword scoring if API fails.
 */
export async function getAiPersonalizedBenefits(
  benefits: Benefit[],
  profile: UserProfile | null,
): Promise<(Benefit & { aiScore?: number; aiSummary?: string; aiVerdict?: 'likely' | 'partial' | 'unlikely' })[]> {
  if (!profile) return benefits

  // Get AI scores for first 30 benefits (cost control)
  const toAssess = benefits.slice(0, 30).map(b => ({
    id: b.id,
    title: b.title,
    description: b.description || '',
    category: b.category,
    targetAge: b.targetAge,
    incomeLevel: b.incomeLevel,
  }))

  let aiResults: EligibilityResult[] = []
  try {
    aiResults = await assessBatch(profile, toAssess)
  } catch (err) {
    console.warn('[recommendation] AI assessment failed:', err)
  }

  // Build lookup map
  const scoreMap = new Map<string, EligibilityResult>()
  for (const r of aiResults) {
    scoreMap.set(r.benefitId, r)
  }

  // Merge AI scores with benefits
  const enriched = benefits.map(b => {
    const ai = scoreMap.get(b.id)
    return {
      ...b,
      aiScore: ai?.score,
      aiSummary: ai?.summary,
      aiVerdict: ai?.verdict,
    }
  })

  // Sort: AI-scored benefits first (by score desc), then unscored
  return enriched.sort((a, b) => {
    if (a.aiScore !== undefined && b.aiScore !== undefined) {
      return b.aiScore - a.aiScore
    }
    if (a.aiScore !== undefined) return -1
    if (b.aiScore !== undefined) return 1
    return 0
  })
}
