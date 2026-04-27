import { NextRequest, NextResponse } from "next/server";
import { createAIClient, callAIWithFallback } from "@/lib/ai-client";
import {
  fetchAllWelfareSources,
  transformListItemToBenefit,
} from "@/lib/welfare-api";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// In-memory cache for benefits context (expensive to rebuild every request)
// NOTE: Cloud Run 다중 인스턴스에서 각 인스턴스마다 warm-up 비용 발생하지만
//       RAG context는 읽기 전용이므로 인스턴스별 캐시도 안전.
let cachedContext: string | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// IP-based rate limiting — Firestore 기반 (Cloud Run 다중 인스턴스 안전)
// 이전 in-memory Map 방식은 인스턴스별 독립 카운터로 실질적 rate limit 없음 → 교체
const IP_RATE_LIMIT = 10; // 1분 내 최대 요청 수
const IP_RATE_WINDOW_SEC = 60; // TTL (초)

async function checkRateLimit(ip: string): Promise<boolean> {
  const safeIp = ip.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const windowStart = Math.floor(Date.now() / (IP_RATE_WINDOW_SEC * 1000));
  const docId = `rec:${safeIp}:${windowStart}`;

  try {
    const db = getAdminFirestore();
    const ref = db.collection("ai_rate_limits").doc(docId);

    // Firestore 트랜잭션으로 read-then-write 원자 처리 — 동시 요청 경쟁 방지
    const allowed = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const count = snap.exists ? (snap.data()?.count ?? 0) : 0;
      if (count >= IP_RATE_LIMIT) return false;

      tx.set(
        ref,
        {
          count: FieldValue.increment(1),
          updated_at: FieldValue.serverTimestamp(),
          // Firestore TTL 필드 — cleanup-welfare-dates cron 또는 Firestore TTL 정책 활용 가능
          expires_at: new Date(
            (windowStart + 1) * IP_RATE_WINDOW_SEC * 1000 + 60_000,
          ),
        },
        { merge: true },
      );
      return true;
    });
    return allowed;
  } catch (firestoreErr) {
    // Firestore 오류 시 허용 (availability > strict rate limit)
    console.error(
      "[ai-recommend] Firestore rate limit check failed — allowing request:",
      firestoreErr instanceof Error
        ? firestoreErr.message
        : String(firestoreErr),
    );
    return true;
  }
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
  if (!(await checkRateLimit(ip))) {
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

    // PP-R01: limit userMessage length to prevent token abuse / prompt injection
    if (userMessage.length > 500) {
      return NextResponse.json(
        { error: "userMessage too long (max 500 chars)" },
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
      console.error(
        "[ai-recommend] 파싱 실패 - AI 원본 응답:",
        text.substring(0, 500),
      );
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 },
      );
    }

    let parsed: {
      benefitIds?: string[];
      message?: string;
      reasons?: Record<string, string>;
    };
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error(
        "[ai-recommend] JSON 파싱 오류:",
        parseErr,
        "\n원본:",
        jsonMatch[0].substring(0, 300),
      );
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 },
      );
    }
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
