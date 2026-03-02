import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { fetchAllWelfareList, transformListItemToBenefit } from '@/lib/welfare-api'

// Build a compact summary of all benefits for RAG context (from real API)
async function buildBenefitsContext(): Promise<string> {
  const items = await fetchAllWelfareList()
  if (items.length === 0) return '(혜택 데이터를 불러오지 못했습니다)'
  // Use first 100 items for context window (too many items = too many tokens)
  return items.slice(0, 100).map((item, i) => {
    const b = transformListItemToBenefit(item, i)
    return JSON.stringify({
      id: b.id,
      title: b.title,
      category: b.category,
      amount: b.amount,
      description: b.description.substring(0, 100),
      ministry: b.ministry,
    })
  }).join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { userMessage, lang = 'ko' } = await req.json()

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'userMessage required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 503 })
    }

    const openai = new OpenAI({ apiKey })

    const benefitsContext = await buildBenefitsContext()
    const isKo = lang === 'ko'

    const systemPrompt = isKo
      ? `당신은 대한민국 정부 복지·지원 혜택 안내 전문가입니다.
아래는 공공데이터포털 실 데이터 기반 혜택 목록입니다 (JSON 형식):

${benefitsContext}

사용자의 상황을 분석하여:
1. 가장 적합한 혜택 ID를 3~5개 선택하세요 (benefitIds 배열)
2. 왜 이 혜택들을 추천하는지 2~3문장으로 설명하세요 (message)
3. 각 혜택에 대한 짧은 추천 이유 (1줄씩)를 reasons 객체로 제공하세요 (key: benefitId, value: 이유)

반드시 아래 JSON 형식으로만 응답하세요:
{"benefitIds": ["id1", "id2"], "message": "설명", "reasons": {"id1": "이유1", "id2": "이유2"}}`
      : `You are a Korean government benefits expert.
Below is the benefits list from real government open data (JSON format):

${benefitsContext}

Analyze the user's situation and:
1. Select 3-5 most relevant benefit IDs (benefitIds array)
2. Explain why these benefits are recommended in 2-3 sentences (message)
3. Provide a short reason for each benefit (reasons object: key=benefitId, value=reason)

Respond ONLY in this JSON format:
{"benefitIds": ["id1", "id2"], "message": "explanation", "reasons": {"id1": "reason1", "id2": "reason2"}}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: isKo ? `사용자 상황: ${userMessage}` : `User situation: ${userMessage}` },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const text = completion.choices[0]?.message?.content?.trim() ?? '{}'

    const parsed = JSON.parse(text)
    return NextResponse.json({
      benefitIds: parsed.benefitIds ?? [],
      message: parsed.message ?? '',
      reasons: parsed.reasons ?? {},
    })
  } catch (err) {
    console.error('[ai-recommend] Error:', err)
    const msg = err instanceof Error ? err.message : String(err)
    // API Key invalid
    if (msg.includes('invalid_api_key') || msg.includes('Incorrect API key')) {
      return NextResponse.json({ error: 'AI_KEY_INVALID' }, { status: 503 })
    }
    // Quota exceeded / rate limit
    if (msg.includes('429') || msg.includes('quota') || msg.includes('rate_limit')) {
      return NextResponse.json({ error: 'AI_QUOTA' }, { status: 429 })
    }
    return NextResponse.json({ error: 'AI service error' }, { status: 500 })
  }
}
