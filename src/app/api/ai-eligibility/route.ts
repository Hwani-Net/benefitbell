import { NextRequest, NextResponse } from 'next/server'
import { createAIClient, callAIWithFallback } from '@/lib/ai-client'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * POST /api/ai-eligibility
 *
 * Batch AI eligibility assessment with Firestore caching (C안).
 * Cache TTL: 24h. Key: sha256(profileHash + benefitIds).
 *
 * 2026-03-10: C+D 장기운영 최적화:
 *   C안: Firestore 서버사이드 캐싱 — 재방문 시 즉시 응답 (0.1s)
 *   D안: 클라이언트가 배치 단위로 호출 → 각 배치 완료 즉시 UI 반영
 */

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h

/** 간단한 해시 (프로필 + 혜택 IDs 결합) */
function makeCacheKey(profileDesc: string, benefitIds: string[]): string {
  // 길이 제한 있는 Firestore 문서 ID용 간단 키
  const raw = profileDesc + '|' + benefitIds.sort().join(',')
  // 앞 200자만 사용 (Firestore 문서 ID 최대 1500 bytes)
  return raw.slice(0, 200).replace(/[\/\s]/g, '_')
}

export async function POST(req: NextRequest) {
  try {
    const { profile, benefits } = await req.json()

    if (!profile || !benefits?.length) {
      return NextResponse.json({ error: 'profile and benefits required' }, { status: 400 })
    }

    // ── 프로필 설명 생성 ─────────────────────────────────
    const profileDesc = [
      `나이: ${profile.age}세`,
      `성별: ${profile.gender === 'male' ? '남성' : '여성'}`,
      `거주지: ${profile.region}`,
      `고용상태: ${formatEmployment(profile.employmentStatus)}`,
      `주거형태: ${formatHousing(profile.housingType)}`,
      `가구원수: ${profile.householdSize}인`,
      `소득분위: 중위소득 ${profile.incomePercent}% 이하`,
      profile.specialStatus?.length > 0
        ? `특이사항: ${profile.specialStatus.map(formatSpecial).join(', ')}`
        : null,
    ].filter(Boolean).join('\n')

    const benefitIds = benefits.map((b: { id: string }) => b.id)

    // ══ C안: Firestore 캐시 조회 ════════════════════════
    const cacheKey = makeCacheKey(profileDesc, benefitIds)
    try {
      const db = getAdminFirestore()
      const cacheDoc = await db.collection('ai_eligibility_cache').doc(cacheKey).get()

      if (cacheDoc.exists) {
        const cached = cacheDoc.data()!
        const cachedAt: number = cached.cachedAt?.toMillis?.() ?? 0
        const isExpired = Date.now() - cachedAt > CACHE_TTL_MS

        if (!isExpired) {
          console.log(`[ai-eligibility] Cache HIT — key: ${cacheKey.slice(0, 30)}...`)
          return NextResponse.json({ results: cached.results, cached: true })
        }
        console.log(`[ai-eligibility] Cache EXPIRED — refreshing`)
      }
    } catch (cacheErr) {
      // 캐시 실패는 무시하고 계속 진행
      console.warn('[ai-eligibility] Cache read failed:', cacheErr)
    }

    // ══ OpenAI API 호출 ══════════════════════════════════
    const client = createAIClient()

    const benefitsDesc = benefits.map((b: { id: string; title: string; description: string; category: string; targetAge: string; incomeLevel: string; eligibility?: string }, i: number) =>
      `[${i + 1}] ID: ${b.id}\n제목: ${b.title}\n설명: ${b.description}\n카테고리: ${b.category}\n대상연령: ${b.targetAge || '전체'}\n소득기준: ${b.incomeLevel || '없음'}${b.eligibility ? `\n자격요건: ${b.eligibility}` : ''}`
    ).join('\n\n')

    const prompt = `당신은 대한민국 정부 복지 혜택 자격 판정 전문가입니다.

아래 사용자 프로필과 복지 혜택 목록을 비교 분석하여 각 혜택에 대한 수령 가능성을 판정하세요.

## 사용자 프로필
${profileDesc}

## 혜택 목록
${benefitsDesc}

## 판정 규칙
- 점수는 0~100 (100 = 거의 확실히 수령 가능)
- 절대 100점을 주지 마세요. 최대 95점.
- 프로필과 완전히 무관한 혜택은 10~20점
- 일부 조건 일치는 40~60점
- 대부분 조건 일치는 70~95점
- summary는 반드시 한국어 1~2문장으로 작성 (핵심만 간결하게)

## 응답 형식 (JSON만 반환)
{
  "results": [
    {
      "benefitId": "혜택ID",
      "score": 75,
      "summary": "나이와 고용상태가 지원 조건에 부합합니다.",
      "verdict": "likely"
    }
  ]
}

verdict 기준: score >= 70 → "likely", 40~69 → "partial", < 40 → "unlikely"

주의: 반드시 위 JSON 형식만 반환하세요. 다른 텍스트를 포함하지 마세요.`

    const text = await callAIWithFallback(client, [
      { role: 'system', content: '당신은 대한민국 정부 복지 혜택 자격 판정 전문가입니다. 반드시 JSON 형식으로만 응답하세요.' },
      { role: 'user', content: prompt },
    ], { temperature: 0.2, maxTokens: 2000, jsonMode: true })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])

    const results = (parsed.results || []).map((r: { benefitId: string; score: number; summary: string; verdict: string }) => ({
      benefitId: r.benefitId,
      score: Math.min(Math.max(Math.round(r.score || 0), 0), 95),
      summary: r.summary || '',
      verdict: (['likely', 'partial', 'unlikely'].includes(r.verdict) ? r.verdict : 'partial'),
    }))

    // ══ C안: Firestore 캐시 저장 ════════════════════════
    try {
      const db = getAdminFirestore()
      await db.collection('ai_eligibility_cache').doc(cacheKey).set({
        results,
        profileDesc: profileDesc.slice(0, 300), // 디버깅용
        benefitCount: benefits.length,
        cachedAt: FieldValue.serverTimestamp(),
      })
      console.log(`[ai-eligibility] Cache STORED — key: ${cacheKey.slice(0, 30)}...`)
    } catch (cacheErr) {
      // 저장 실패는 무시 (결과는 이미 클라이언트에 반환)
      console.warn('[ai-eligibility] Cache write failed:', cacheErr)
    }

    return NextResponse.json({ results, cached: false })

  } catch (err) {
    console.error('[ai-eligibility] Error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate_limit')) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    return NextResponse.json({ error: 'AI eligibility service error' }, { status: 500 })
  }
}

// ── Helpers ──────────────────────────────────
function formatEmployment(s: string): string {
  const map: Record<string, string> = {
    jobSeeking: '구직중',
    employed: '재직중',
    selfEmployed: '자영업',
    student: '학생',
  }
  return map[s] || s
}

function formatHousing(s: string): string {
  const map: Record<string, string> = {
    monthly: '월세',
    deposit: '전세',
    owned: '자가',
  }
  return map[s] || s
}

function formatSpecial(s: string): string {
  const map: Record<string, string> = {
    disability: '장애',
    singleParent: '한부모',
    multicultural: '다문화',
    veteran: '국가유공자',
  }
  return map[s] || s
}
