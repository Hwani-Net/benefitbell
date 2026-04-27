import { NextRequest, NextResponse } from "next/server";
import { createAIClient, callAIWithFallback } from "@/lib/ai-client";
import {
  fetchAllWelfareSources,
  transformListItemToBenefit,
} from "@/lib/welfare-api";

// In-memory cache for benefits context (expensive to rebuild every request)
let cachedContext: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// IP-based rate limiting (anonymous users)
const IP_RATE_LIMIT = 10; // max requests per window
const IP_RATE_WINDOW = 60 * 1000; // 1 minute
const ipCounters = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounters.get(ip);
  if (!entry || now - entry.windowStart > IP_RATE_WINDOW) {
    ipCounters.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= IP_RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

// Build a compact summary of all benefits for RAG context (from real API)
async function buildBenefitsContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && now - cacheTimestamp < CACHE_TTL) {
    return cachedContext;
  }

  const items = await fetchAllWelfareSources();
  if (items.length === 0) return "(혜택 데이터를 불러오지 못했습니다)";
  // Use first 100 items for context window (too many items = too many tokens)
  const context = items
    .slice(0, 100)
    .map((item, i) => {
      const b = transformListItemToBenefit(item, i);
      return JSON.stringify({
        id: b.id,
        title: b.title,
        category: b.category,
        amount: b.amount,
        description: b.description.substring(0, 100),
        ministry: b.ministry,
      });
    })
    .join("\n");

  cachedContext = context;
  cacheTimestamp = now;
  return context;
}

export async function POST(req: NextRequest) {
  // IP-based rate limiting to prevent anonymous abuse
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const { userMessage, lang = "ko" } = await req.json();

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "userMessage required" },
        { status: 400 },
      );
    }

    const client = createAIClient();

    const benefitsContext = await buildBenefitsContext();
    const isKo = lang === "ko";

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
{"benefitIds": ["id1", "id2"], "message": "explanation", "reasons": {"id1": "reason1", "id2": "reason2"}}`;

    const text = await callAIWithFallback(
      client,
      [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: isKo
            ? `사용자 상황: ${userMessage}`
            : `User situation: ${userMessage}`,
        },
      ],
      { temperature: 0.3, maxTokens: 1500, jsonMode: true },
    );

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      benefitIds: parsed.benefitIds ?? [],
      message: parsed.message ?? "",
      reasons: parsed.reasons ?? {},
    });
  } catch (err) {
    console.error("[ai-recommend] Error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number }).status;
    if (
      status === 401 ||
      msg.includes("invalid_api_key") ||
      msg.includes("Incorrect API key") ||
      msg.includes("not configured")
    ) {
      return NextResponse.json({ error: "AI_KEY_INVALID" }, { status: 503 });
    }
    if (
      msg.includes("429") ||
      msg.includes("quota") ||
      msg.includes("rate_limit")
    ) {
      return NextResponse.json({ error: "AI_QUOTA" }, { status: 429 });
    }
    return NextResponse.json({ error: "AI service error" }, { status: 500 });
  }
}
