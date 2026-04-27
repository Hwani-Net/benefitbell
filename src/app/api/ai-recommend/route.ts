import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-client";

export const dynamic = "force-dynamic";
import {
  fetchAllWelfareSources,
  transformListItemToBenefit,
} from "@/lib/welfare-api";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// In-memory cache for benefits context (expensive to rebuild every request)
// NOTE: Cloud Run 다중 인스턴스에서 각 인스턴스마다 warm-up 비용 발생하지만
//       RAG context는 읽기 전용이므로 인스턴스별 캐시도 안전.
let cachedContext: string | null = null;
let cacheTimestamp = 0;
let fetching = false; // single-flight: stampede 방지
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const EMPTY_CACHE_TTL = 5 * 60 * 1000; // 빈 결과 캐시 TTL (5분) — 반복 API 호출 방지

// =====================
// Rate Limiting (free: 20 req/day, premium: unlimited) — Firestore 기반
// docId prefix "recommend:" — ai-check("check:") 와 충돌 방지
// =====================
const FREE_DAILY_LIMIT = 20; // ai-check(10)보다 넉넉하게

async function checkRateLimit(
  req: NextRequest,
): Promise<{ allowed: boolean; remaining: number }> {
  // Bearer 토큰이 있으면 Firebase uid로 식별 + 프리미엄 서버 확인
  let identifier =
    "ip:" +
    (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown");
  let isPremium = false; // 항상 서버에서 직접 검증, 요청 바디 신뢰 금지

  const authHeader = req.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (bearerToken) {
    try {
      const decoded = await getAdminAuth().verifyIdToken(bearerToken);
      if (decoded.uid) {
        identifier = "uid:" + decoded.uid;
        // 서버 사이드 프리미엄 상태 확인
        try {
          const userSnap = await getAdminFirestore()
            .collection("users")
            .doc(decoded.uid)
            .get();
          isPremium = userSnap.exists
            ? userSnap.data()?.is_premium === true
            : false;
        } catch (fsErr) {
          console.error(
            "[ai-recommend] isPremium Firestore lookup failed — treating as free:",
            fsErr instanceof Error ? fsErr.message : String(fsErr),
          );
        }
      }
    } catch (tokenErr) {
      // 토큰 만료/무효 — IP 기반으로 폴백
      console.warn(
        "[ai-recommend] Bearer token verification failed:",
        tokenErr instanceof Error ? tokenErr.message : String(tokenErr),
      );
    }
  }

  // 프리미엄 사용자는 무제한
  if (isPremium) return { allowed: true, remaining: 999 };

  // 로그인 없는 익명 사용자: IP 기반 일일 제한
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const safeId = identifier.replace(/[^a-zA-Z0-9_-]/g, "_");
  const docId = `recommend:${safeId}:${today}`;

  try {
    const db = getAdminFirestore();
    const ref = db.collection("ai_rate_limits").doc(docId);
    const snap = await ref.get();
    const count = snap.exists ? (snap.data()?.count ?? 0) : 0;

    if (count >= FREE_DAILY_LIMIT) return { allowed: false, remaining: 0 };

    await ref.set(
      {
        count: FieldValue.increment(1),
        date: today,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { allowed: true, remaining: FREE_DAILY_LIMIT - count - 1 };
  } catch (firestoreErr) {
    // Firestore 오류 시 허용 (availability > strict rate limit)
    console.error(
      "[ai-recommend] Firestore rate limit check failed — allowing request:",
      firestoreErr instanceof Error
        ? firestoreErr.message
        : String(firestoreErr),
    );
    return { allowed: true, remaining: FREE_DAILY_LIMIT };
  }
}

// Build a compact summary of all benefits for RAG context (from real API)
async function buildBenefitsContext(): Promise<string> {
  const now = Date.now();
  if (cachedContext && now - cacheTimestamp < CACHE_TTL) {
    return cachedContext;
  }
  // single-flight: 동시 갱신 요청 시 stale-while-revalidate 반환
  if (fetching) {
    return cachedContext ?? "";
  }
  fetching = true;
  try {
    const items = await fetchAllWelfareSources();
    if (items.length === 0) {
      // 빈 결과도 캐싱 — 반복 API 호출 방지 (EMPTY_CACHE_TTL 후 자연 만료)
      cachedContext = "";
      cacheTimestamp = Date.now() - (CACHE_TTL - EMPTY_CACHE_TTL);
      return "(혜택 데이터를 불러오지 못했습니다)";
    }
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
    cacheTimestamp = Date.now();
    return cachedContext;
  } finally {
    fetching = false;
  }
}

export async function POST(req: NextRequest) {
  // Rate limiting: 프리미엄 무제한 / 익명 IP 하루 20회
  const { allowed, remaining } = await checkRateLimit(req);
  if (!allowed) {
    return NextResponse.json(
      {
        error: "오늘 AI 추천 횟수를 모두 사용했어요.",
        code: "RATE_LIMIT_EXCEEDED",
        remaining: 0,
      },
      { status: 429 },
    );
  }
  void remaining; // 현재 응답에 포함하지 않으나 향후 헤더 추가 시 활용

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

    const text = await callAI(
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
