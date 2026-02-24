import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { fetchWelfareDetail } from '@/lib/welfare-api'

// Resolve benefit id to servId (handles both "api-WLF000xxx" and raw "WLF000xxx")
function extractServId(benefitId: string): string {
  return benefitId.startsWith('api-') ? benefitId.replace('api-', '') : benefitId
}

export async function POST(req: NextRequest) {
  try {
    const { benefitId, lang = 'ko' } = await req.json()

    if (!benefitId) {
      return NextResponse.json({ error: 'benefitId required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 503 })
    }

    // Fetch real detail from data.go.kr
    const servId = extractServId(benefitId)
    const detail = await fetchWelfareDetail(servId)
    if (!detail) {
      return NextResponse.json({ error: 'Benefit not found' }, { status: 404 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const isKo = lang === 'ko'
    const benefitInfo = isKo
      ? `혜택명: ${detail.servNm}
설명: ${detail.servDgst}
지원내용: ${detail.alwServCn?.substring(0, 200) ?? ''}
지원대상: ${detail.trgterIndvdl ?? ''}
선정기준: ${detail.slctCriteria ?? ''}
주관부처: ${detail.jurOrgNm}`
      : `Benefit: ${detail.servNm}
Description: ${detail.servDgst}
Support: ${detail.alwServCn?.substring(0, 200) ?? ''}
Target: ${detail.trgterIndvdl ?? ''}
Criteria: ${detail.slctCriteria ?? ''}
Ministry: ${detail.jurOrgNm}`

    const prompt = isKo
      ? `${benefitInfo}

위 혜택의 자격 조건을 확인하는 Yes/No 질문을 5개 만들어주세요.
질문은 사용자가 쉽게 이해할 수 있어야 합니다.
형식:
{"questions": ["질문1", "질문2", "질문3", "질문4", "질문5"]}`
      : `${benefitInfo}

Create 5 Yes/No questions to check eligibility for the above benefit.
Questions should be easy for users to understand.
Format:
{"questions": ["Q1", "Q2", "Q3", "Q4", "Q5"]}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({
      benefitId,
      benefitTitle: detail.servNm,
      questions: parsed.questions ?? [],
    })
  } catch (err) {
    console.error('[ai-check] Error:', err)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}

// POST with answers to get verdict
export async function PUT(req: NextRequest) {
  try {
    const { benefitId, questions, answers, lang = 'ko' } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 503 })
    }

    // Fetch real detail
    const servId = extractServId(benefitId)
    const detail = await fetchWelfareDetail(servId)
    if (!detail) {
      return NextResponse.json({ error: 'Benefit not found' }, { status: 404 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const isKo = lang === 'ko'
    const qa = (questions as string[]).map((q: string, i: number) =>
      `${q}: ${(answers as boolean[])[i] ? (isKo ? '예' : 'Yes') : (isKo ? '아니오' : 'No')}`
    ).join('\n')

    const prompt = isKo
      ? `혜택명: ${detail.servNm}
사용자 답변:
${qa}

위 답변을 분석하여 해당 혜택을 받을 가능성을 판단해주세요.
* likely = 80% 이상 가능성 (대부분 조건 충족)
* partial = 일부 조건 미충족, 추가 확인 필요
* unlikely = 해당 가능성 낮음

형식:
{"verdict": "likely|partial|unlikely", "reason": "2~3문장 설명", "tips": "추가 안내 또는 다음 단계 (선택적)"}`
      : `Benefit: ${detail.servNm}
User answers:
${qa}

Analyze answers and judge likelihood of eligibility.
* likely = 80%+ likely (most conditions met)
* partial = some conditions unmet, additional check needed
* unlikely = unlikely to qualify

Format:
{"verdict": "likely|partial|unlikely", "reason": "2-3 sentence explanation", "tips": "additional guidance (optional)"}`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({
      verdict: parsed.verdict ?? 'partial',
      reason: parsed.reason ?? '',
      tips: parsed.tips ?? '',
    })
  } catch (err) {
    console.error('[ai-check PUT] Error:', err)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
