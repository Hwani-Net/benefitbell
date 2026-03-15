module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/ai-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "callAIWithFallback",
    ()=>callAIWithFallback,
    "createAIClient",
    ()=>createAIClient
]);
/**
 * AI Client helper — OpenAI GPT-4o mini
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
;
function createAIClient() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured');
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
        apiKey
    });
}
async function callAIWithFallback(client, messages, options) {
    const { temperature = 0.3, maxTokens = 1000, jsonMode = false } = options ?? {};
    try {
        const completion = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature,
            max_tokens: maxTokens,
            ...jsonMode ? {
                response_format: {
                    type: 'json_object'
                }
            } : {}
        });
        const content = completion.choices[0]?.message?.content?.trim();
        if (!content) {
            throw new Error('GPT-4o mini returned empty content');
        }
        return content;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[ai-client] GPT-4o mini failed: ${msg.substring(0, 200)}`);
        throw err;
    }
}
}),
"[project]/src/app/api/ai-eligibility/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai-client.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const { profile, benefits } = await req.json();
        if (!profile || !benefits?.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'profile and benefits required'
            }, {
                status: 400
            });
        }
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAIClient"])();
        const profileDesc = [
            `나이: ${profile.age}세`,
            `성별: ${profile.gender === 'male' ? '남성' : '여성'}`,
            `거주지: ${profile.region}`,
            `고용상태: ${formatEmployment(profile.employmentStatus)}`,
            `주거형태: ${formatHousing(profile.housingType)}`,
            `가구원수: ${profile.householdSize}인`,
            `소득분위: 중위소득 ${profile.incomePercent}% 이하`,
            profile.specialStatus?.length > 0 ? `특이사항: ${profile.specialStatus.map(formatSpecial).join(', ')}` : null
        ].filter(Boolean).join('\n');
        const benefitsDesc = benefits.map((b, i)=>`[${i + 1}] ID: ${b.id}\n제목: ${b.title}\n설명: ${b.description}\n카테고리: ${b.category}\n대상연령: ${b.targetAge || '전체'}\n소득기준: ${b.incomeLevel || '없음'}`).join('\n\n');
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

주의: 반드시 위 JSON 형식만 반환하세요. 다른 텍스트를 포함하지 마세요.`;
        const text = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callAIWithFallback"])(client, [
            {
                role: 'system',
                content: '당신은 대한민국 정부 복지 혜택 자격 판정 전문가입니다. 반드시 JSON 형식으로만 응답하세요.'
            },
            {
                role: 'user',
                content: prompt
            }
        ], {
            temperature: 0.2,
            maxTokens: 2000,
            jsonMode: true
        });
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid AI response'
            }, {
                status: 500
            });
        }
        const parsed = JSON.parse(jsonMatch[0]);
        // Validate and normalize results
        const results = (parsed.results || []).map((r)=>({
                benefitId: r.benefitId,
                score: Math.min(Math.max(Math.round(r.score || 0), 0), 95),
                summary: r.summary || '',
                verdict: [
                    'likely',
                    'partial',
                    'unlikely'
                ].includes(r.verdict) ? r.verdict : 'partial'
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            results
        });
    } catch (err) {
        console.error('[ai-eligibility] Error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('429') || msg.includes('quota') || msg.includes('rate_limit')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Rate limit exceeded'
            }, {
                status: 429
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'AI eligibility service error'
        }, {
            status: 500
        });
    }
}
// ── Helpers ──────────────────────────────────
function formatEmployment(s) {
    const map = {
        jobSeeking: '구직중',
        employed: '재직중',
        selfEmployed: '자영업',
        student: '학생'
    };
    return map[s] || s;
}
function formatHousing(s) {
    const map = {
        monthly: '월세',
        deposit: '전세',
        owned: '자가'
    };
    return map[s] || s;
}
function formatSpecial(s) {
    const map = {
        disability: '장애',
        singleParent: '한부모',
        multicultural: '다문화',
        veteran: '국가유공자'
    };
    return map[s] || s;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e7c7205a._.js.map