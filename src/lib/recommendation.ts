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
export function getPersonalizedBenefits(benefits: Benefit[], profile: UserProfile | null): Benefit[] {
  if (!profile) return benefits

  const age = new Date().getFullYear() - profile.birthYear

  const scoredBenefits = benefits.map(benefit => {
    let score = 0
    const textToSearch = (benefit.title + ' ' + (benefit.description || '')).toLowerCase()
    
    // 1. Age matching
    if (age < 35 && (benefit.category === 'youth' || textToSearch.includes('청년'))) score += 10
    if (age >= 60 && (benefit.category === 'senior' || textToSearch.includes('노인') || textToSearch.includes('고령'))) score += 10
    if (age >= 40 && age < 60 && (benefit.category === 'middle-aged' || textToSearch.includes('중장년'))) score += 10

    // 2. Region matching
    if (profile.region) {
      const regionParts = profile.region.split(' ')
      if (regionParts[0] && textToSearch.includes(regionParts[0].replace('광역시', '').replace('특별시', ''))) score += 15
      if (regionParts[1] && textToSearch.includes(regionParts[1])) score += 20
    }

    // 3. Employment matching
    if (profile.employmentStatus === 'jobSeeking' && (benefit.category === 'employment' || textToSearch.includes('구직') || textToSearch.includes('취업'))) score += 15
    if (profile.employmentStatus === 'selfEmployed' && (benefit.category === 'small-biz' || benefit.category === 'startup' || textToSearch.includes('소상공인') || textToSearch.includes('자영업'))) score += 15
    if (profile.employmentStatus === 'student' && (benefit.category === 'education' || textToSearch.includes('학생') || textToSearch.includes('장학'))) score += 15

    // 4. Housing matching
    if (profile.housingType === 'monthly' && textToSearch.includes('월세')) score += 10
    if (profile.housingType === 'deposit' && textToSearch.includes('전세')) score += 10

    // 5. Special status matching
    profile.specialStatus.forEach(status => {
      if (status === 'disability' && textToSearch.includes('장애')) score += 20
      if (status === 'singleParent' && textToSearch.includes('한부모')) score += 20
      if (status === 'multicultural' && textToSearch.includes('다문화')) score += 20
      if (status === 'veteran' && textToSearch.includes('국가유공자')) score += 20
    })

    // 6. Income matching
    if (profile.incomePercent <= 50 && (benefit.category === 'basic-living' || benefit.category === 'near-poverty')) score += 15

    return { benefit, score }
  })

  // Sort by score descending, filter out 0-score
  const matched = scoredBenefits.filter(s => s.score > 0).sort((a, b) => b.score - a.score)
  return matched.map(s => s.benefit)
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
