import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { BENEFITS } from '@/data/benefits'

// Build a compact summary of all benefits for RAG context
function buildBenefitsContext(): string {
  return BENEFITS.map(b => ({
    id: b.id,
    title: b.title,
    titleEn: b.titleEn,
    category: b.category,
    amount: b.amount,
    description: b.description,
    targetAge: b.targetAge,
    incomeLevel: b.incomeLevel,
    status: b.status,
    ministry: b.ministry,
    eligibilityChecks: b.eligibilityChecks.map(e => e.label),
  })).map(b => JSON.stringify(b)).join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { userMessage, lang = 'ko' } = await req.json()

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'userMessage required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 503 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const benefitsContext = buildBenefitsContext()
    const isKo = lang === 'ko'

    const systemPrompt = isKo
      ? `당신은 대한민국 정부 복지·지원 혜택 안내 전문가입니다.
아래는 현재 등록된 혜택 데이터베이스입니다 (JSON 형식):

${benefitsContext}

사용자의 상황을 분석하여:
1. 가장 적합한 혜택 ID를 3~5개 선택하세요 (benefitIds 배열)
2. 왜 이 혜택들을 추천하는지 2~3문장으로 설명하세요 (message)
3. 각 혜택에 대한 짧은 추천 이유 (1줄씩)를 reasons 객체로 제공하세요 (key: benefitId, value: 이유)

반드시 아래 JSON 형식으로만 응답하세요:
{"benefitIds": ["id1", "id2"], "message": "설명", "reasons": {"id1": "이유1", "id2": "이유2"}}`
      : `You are a Korean government benefits expert.
Below is the current benefits database (JSON format):

${benefitsContext}

Analyze the user's situation and:
1. Select 3-5 most relevant benefit IDs (benefitIds array)
2. Explain why these benefits are recommended in 2-3 sentences (message)
3. Provide a short reason for each benefit (reasons object: key=benefitId, value=reason)

Respond ONLY in this JSON format:
{"benefitIds": ["id1", "id2"], "message": "explanation", "reasons": {"id1": "reason1", "id2": "reason2"}}`

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: isKo ? `사용자 상황: ${userMessage}` : `User situation: ${userMessage}` },
    ])

    const text = result.response.text().trim()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 })
    }

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json({
      benefitIds: parsed.benefitIds ?? [],
      message: parsed.message ?? '',
      reasons: parsed.reasons ?? {},
    })
  } catch (err) {
    console.error('[ai-recommend] Error:', err)
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
