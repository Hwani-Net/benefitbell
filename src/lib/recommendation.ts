import { Benefit } from '@/data/benefits'
import { UserProfile } from './context'

/**
 * 사용자 프로필을 기반으로 혜택에 점수를 매겨 추천 목록을 반환합니다.
 */
export function getPersonalizedBenefits(benefits: Benefit[], profile: UserProfile | null): Benefit[] {
  if (!profile) return benefits

  const age = new Date().getFullYear() - profile.birthYear

  // 점수 매기기
  const scoredBenefits = benefits.map(benefit => {
    let score = 0
    const textToSearch = (benefit.title + ' ' + (benefit.description || '')).toLowerCase()
    
    // 1. 나이 
    if (age < 35 && (benefit.category === 'youth' || textToSearch.includes('청년'))) score += 10
    if (age >= 60 && (benefit.category === 'senior' || textToSearch.includes('노인') || textToSearch.includes('고령'))) score += 10
    if (age >= 40 && age < 60 && (benefit.category === 'middle-aged' || textToSearch.includes('중장년'))) score += 10

    // 2. 지역 매칭
    if (profile.region) {
      const regionParts = profile.region.split(' ') // "서울특별시 강남구"
      if (regionParts[0] && textToSearch.includes(regionParts[0].replace('광역시', '').replace('특별시', ''))) score += 15
      if (regionParts[1] && textToSearch.includes(regionParts[1])) score += 20
    }

    // 3. 고용상태 매칭
    if (profile.employmentStatus === 'jobSeeking' && (benefit.category === 'employment' || textToSearch.includes('구직') || textToSearch.includes('취업'))) score += 15
    if (profile.employmentStatus === 'selfEmployed' && (benefit.category === 'small-biz' || benefit.category === 'startup' || textToSearch.includes('소상공인') || textToSearch.includes('자영업'))) score += 15
    if (profile.employmentStatus === 'student' && (benefit.category === 'education' || textToSearch.includes('학생') || textToSearch.includes('장학'))) score += 15

    // 4. 주거형태 매칭
    if (profile.housingType === 'monthly' && textToSearch.includes('월세')) score += 10
    if (profile.housingType === 'deposit' && textToSearch.includes('전세')) score += 10

    // 5. 특이사항 매칭
    profile.specialStatus.forEach(status => {
      if (status === 'disability' && textToSearch.includes('장애')) score += 20
      if (status === 'singleParent' && textToSearch.includes('한부모')) score += 20
      if (status === 'multicultural' && textToSearch.includes('다문화')) score += 20
      if (status === 'veteran' && textToSearch.includes('국가유공자')) score += 20
    })

    // 6. 소득 분위 매칭 (간단히 저소득일 경우 기초생활/차상위 가점)
    if (profile.incomePercent <= 50 && (benefit.category === 'basic-living' || benefit.category === 'near-poverty')) score += 15

    return { benefit, score }
  })

  // 점수가 높은 순으로 정렬하고, 0점짜리 무관 혜택은 제거
  const matched = scoredBenefits.filter(s => s.score > 0).sort((a, b) => b.score - a.score)

  return matched.map(s => s.benefit)
}
