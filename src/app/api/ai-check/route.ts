import { NextRequest, NextResponse } from 'next/server'
import { createAIClient, callAIWithFallback } from '@/lib/ai-client'
import { fetchWelfareDetail } from '@/lib/welfare-api'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// =====================
// Rate Limiting (free: 3 req/day, premium: unlimited) — Firestore 기반
// =====================
const FREE_DAILY_LIMIT = 10

async function checkRateLimit(req: NextRequest, isPremium: boolean): Promise<{ allowed: boolean; remaining: number }> {
  if (isPremium) return { allowed: true, remaining: 999 }

  const cookieHeader = req.headers.get('cookie') ?? ''
  const kakaoMatch = cookieHeader.match(/kakao_profile=([^;]+)/)
  let identifier = 'ip:' + (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown')
  if (kakaoMatch) {
    try {
      const profile = JSON.parse(decodeURIComponent(kakaoMatch[1]))
      if (profile.id) identifier = 'kakao:' + profile.id
    } catch { /* cookie parse failed, use IP */ }
  }

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const docId = `${identifier.replace(/[^a-zA-Z0-9_-]/g, '_')}:${today}`

  try {
    const db = getAdminFirestore()
    const ref = db.collection('ai_rate_limits').doc(docId)
    const snap = await ref.get()
    const count = snap.exists ? (snap.data()?.count ?? 0) : 0

    if (count >= FREE_DAILY_LIMIT) return { allowed: false, remaining: 0 }

    await ref.set(
      { count: FieldValue.increment(1), date: today, updated_at: FieldValue.serverTimestamp() },
      { merge: true }
    )
    return { allowed: true, remaining: FREE_DAILY_LIMIT - count - 1 }
  } catch {
    // Firestore 오류 시 허용 (availability > security)
    return { allowed: true, remaining: FREE_DAILY_LIMIT }
  }
}

function extractServId(benefitId: string): string {
  // Remove known prefixes (api-, LG-, SUB-, BIZ-, KSU-)
  return benefitId.replace(/^(api-|LG-|SUB-|BIZ-|KSU-)/, '')
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { benefitId, benefitTitle = '', lang = 'ko', isPremium = false } = body

    if (!benefitId) {
      return NextResponse.json({ error: 'benefitId required' }, { status: 400 })
    }

    const { allowed, remaining } = await checkRateLimit(req, isPremium)
    if (!allowed) {
      return NextResponse.json(
        { error: '오늘 AI 분석 횟수를 모두 사용했어요.', code: 'RATE_LIMIT_EXCEEDED', remaining: 0 },
        { status: 429 }
      )
    }

    const client = createAIClient()

    const servId = extractServId(benefitId)
    const detail = await fetchWelfareDetail(servId)

    // Fallback: API상세 조회 실패 시 benefitTitle로 대체
    const hasDetail = detail && detail.servNm
    const benefitName = hasDetail ? detail.servNm : benefitTitle || benefitId
    const targetInfo = hasDetail ? (detail.trgterIndvdl || '정보 없음') : '정보 없음'
    const criteriaInfo = hasDetail ? (detail.slctCriteria || '정보 없음') : '정보 없음'
    const supportInfo = hasDetail ? (detail.alwServCn || '정보 없음') : '정보 없음'
    const overviewInfo = hasDetail ? (detail.servDgst || '정보 없음') : '정보 없음'

    const isKo = lang === 'ko'
    const prompt = isKo ? `
다음 정부 지원 혜택에 대해 분석해주세요:

제목: ${benefitName}
대상: ${targetInfo}
선발 기준: ${criteriaInfo}
지원 내용: ${supportInfo}
개요: ${overviewInfo}

다음 형식의 JSON으로 답해주세요:
{
  "summary": ["3줄 요약 첫번째", "3줄 요약 두번째", "3줄 요약 세번째"],
  "quickVerdict": "likely" | "partial" | "unlikely",
  "questions": [
    "자격 확인을 위한 질문 1",
    "자격 확인을 위한 질문 2",
    "자격 확인을 위한 질문 3"
  ]
}

summary는 일반인이 이해하기 쉬운 말로, quickVerdict는 이 혜택을 대부분의 사람이 받을 수 있는지 추정값입니다.
    ` : `
Analyze this government benefit:

Title: ${benefitName}
Target: ${targetInfo}
Criteria: ${criteriaInfo}
Support: ${supportInfo}

Respond in JSON:
{
  "summary": ["line1", "line2", "line3"],
  "quickVerdict": "likely" | "partial" | "unlikely",
  "questions": ["question1", "question2", "question3"]
}
    `

    const text = await callAIWithFallback(client, [
      { role: 'system', content: '당신은 대한민국 정부 복지 혜택 분석 전문가입니다. 반드시 JSON 형식으로만 응답하세요.' },
      { role: 'user', content: prompt },
    ], { temperature: 0.3, maxTokens: 800, jsonMode: true })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI 분석 결과를 파싱할 수 없습니다.' }, { status: 500 })
    }

    const parsed: { summary?: string[]; quickVerdict?: string; questions?: string[] } = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      questions: parsed.questions ?? [],
      summary: parsed.summary ?? [],
      quickVerdict: parsed.quickVerdict ?? 'partial',
      remaining,
    })
  } catch (err) {
    console.error('[ai-check] Error:', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('429') || message.toLowerCase().includes('quota') || message.includes('rate_limit')) {
      return NextResponse.json({ error: 'AI 서비스가 일시적으로 과부하 상태입니다.', code: 'AI_OVERLOADED' }, { status: 503 })
    }
    return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

// =====================
// PUT — 직접 상세 분석 (질문 없이 AI가 바로 판단)
// =====================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { benefitId, benefitTitle = '', lang = 'ko' } = body

    if (!benefitId) {
      return NextResponse.json({ error: 'benefitId required' }, { status: 400 })
    }

    const client = createAIClient()
    const servId = extractServId(benefitId)
    const detail = await fetchWelfareDetail(servId)

    // ── Build prompt context: use API detail if available, otherwise fallback to title ──
    const hasDetail = detail && detail.servNm
    const benefitName = hasDetail ? detail.servNm : benefitTitle || benefitId
    const targetInfo = hasDetail ? (detail.trgterIndvdl || '정보 없음') : '정보 없음'
    const criteriaInfo = hasDetail ? (detail.slctCriteria || '정보 없음') : '정보 없음'
    const supportInfo = hasDetail ? (detail.alwServCn || '정보 없음') : '정보 없음'
    const overviewInfo = hasDetail ? (detail.servDgst || '정보 없음') : '정보 없음'

    const isKo = lang === 'ko'
    const prompt = isKo ? `
다음 정부 지원 혜택에 대해 일반 시민이 해당될 가능성을 상세 분석해주세요.
사용자에게 질문하지 말고, 혜택 정보만으로 직접 판단하세요.

혜택명: ${benefitName}
대상: ${targetInfo}
선발 기준: ${criteriaInfo}
지원 내용: ${supportInfo}
개요: ${overviewInfo}

다음 형식의 JSON으로 답해주세요:
{
  "verdict": "likely" | "partial" | "unlikely",
  "reason": "누가 주로 해당되는지 쉬운 말로 2~3문장 설명",
  "details": [
    "✅ 해당되는 경우: ~한 경우",
    "⚠️ 확인 필요: ~의 조건이 있음",
    "📋 필요한 서류나 절차"
  ],
  "tips": "지금 바로 할 수 있는 행동 1가지"
}

verdict 기준:
- likely: 대부분의 해당 계층이 받을 수 있는 보편적 혜택
- partial: 소득, 나이, 지역 등 특정 조건 확인이 필요
- unlikely: 매우 제한적인 대상만 해당 (장애인, 특수직업 등)
    ` : `
Analyze this government benefit and determine general eligibility.
Do NOT ask the user any questions. Judge based on the information provided.

Benefit: ${benefitName}
Target: ${targetInfo}
Criteria: ${criteriaInfo}
Support: ${supportInfo}
Summary: ${overviewInfo}

Respond in JSON:
{
  "verdict": "likely" | "partial" | "unlikely",
  "reason": "2-3 sentence explanation of who qualifies",
  "details": [
    "✅ Eligible if: ...",
    "⚠️ Check: ...",
    "📋 Required documents/steps"
  ],
  "tips": "1 actionable next step"
}
    `

    const text = await callAIWithFallback(client, [
      { role: 'system', content: '당신은 대한민국 정부 복지 혜택 자격 분석 전문가입니다. 사용자에게 질문하지 말고 혜택 정보만으로 직접 판단하세요. 반드시 JSON 형식으로만 응답하세요.' },
      { role: 'user', content: prompt },
    ], { temperature: 0.3, maxTokens: 800, jsonMode: true })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI 분석 결과를 파싱할 수 없습니다.' }, { status: 500 })
    }

    const parsed: { verdict?: string; reason?: string; tips?: string; details?: string[] } = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      verdict: parsed.verdict ?? 'partial',
      reason: parsed.reason ?? '',
      tips: parsed.tips ?? '',
      details: parsed.details ?? [],
    })
  } catch (err) {
    console.error('[ai-check PUT] Error:', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('429') || message.toLowerCase().includes('quota') || message.includes('rate_limit')) {
      return NextResponse.json({ error: 'AI 서비스가 일시적으로 과부하 상태입니다.', code: 'AI_OVERLOADED' }, { status: 503 })
    }
    return NextResponse.json({ error: 'AI 분석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

