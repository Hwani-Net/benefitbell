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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/src/lib/firebase-admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createKakaoCustomToken",
    ()=>createKakaoCustomToken,
    "getAdminAuth",
    ()=>getAdminAuth,
    "getAdminFirestore",
    ()=>getAdminFirestore,
    "getAdminMessaging",
    ()=>getAdminMessaging
]);
// Firebase Admin SDK (서버 전용 — API routes, cron jobs)
// 인증 우선순위: 개별 필드 → JSON 문자열 → 파일 경로 → ADC (Firebase App Hosting)
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/app [external] (firebase-admin/app, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/auth [external] (firebase-admin/auth, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$messaging__$5b$external$5d$__$28$firebase$2d$admin$2f$messaging$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/messaging [external] (firebase-admin/messaging, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$messaging__$5b$external$5d$__$28$firebase$2d$admin$2f$messaging$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$messaging__$5b$external$5d$__$28$firebase$2d$admin$2f$messaging$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
let adminApp = null;
function getAdminApp() {
    if (adminApp) return adminApp;
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getApps"])().length > 0) {
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getApps"])()[0];
        return adminApp;
    }
    // 우선순위: 개별 필드 → JSON 문자열 → 파일 경로 → ADC (Firebase App Hosting / Cloud Run)
    const projectId = process.env.FIREBASE_PROJECT_ID || ("TURBOPACK compile-time value", "ai-project-ce41f");
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    if (projectId && clientEmail && privateKey) {
        // 개별 필드 방식 — 환경변수 크기 최소화
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
            credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["cert"])({
                projectId,
                clientEmail,
                privateKey
            })
        });
    } else if (keyJson) {
        const serviceAccount = JSON.parse(keyJson);
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
            credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["cert"])(serviceAccount)
        });
    } else if (keyPath) {
        // Use fs.readFileSync instead of require() for Turbopack compatibility
        const fileContent = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(keyPath, 'utf-8');
        const serviceAccount = JSON.parse(fileContent);
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
            credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["cert"])(serviceAccount)
        });
    } else {
        // ADC (Application Default Credentials)
        // Firebase App Hosting / Cloud Run / GCE에서는 자동 인증
        // 로컬에서는 GOOGLE_APPLICATION_CREDENTIALS 또는 gcloud auth
        console.log('[firebase-admin] Using Application Default Credentials (ADC)');
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
            credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["applicationDefault"])(),
            projectId: projectId || undefined
        });
    }
    return adminApp;
}
function getAdminFirestore() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getFirestore"])(getAdminApp());
}
function getAdminAuth() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getAuth"])(getAdminApp());
}
function getAdminMessaging() {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$messaging__$5b$external$5d$__$28$firebase$2d$admin$2f$messaging$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getMessaging"])(getAdminApp());
}
async function createKakaoCustomToken(kakaoId, extraClaims) {
    const auth = getAdminAuth();
    return auth.createCustomToken(`kakao_${kakaoId}`, extraClaims);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/ai-eligibility/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-admin.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import, [project]/node_modules/firebase-admin)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
/**
 * POST /api/ai-eligibility
 *
 * Batch AI eligibility assessment with Firestore caching (C안).
 * Cache TTL: 24h. Key: sha256(profileHash + benefitIds).
 *
 * 2026-03-10: C+D 장기운영 최적화:
 *   C안: Firestore 서버사이드 캐싱 — 재방문 시 즉시 응답 (0.1s)
 *   D안: 클라이언트가 배치 단위로 호출 → 각 배치 완료 즉시 UI 반영
 */ const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h
;
/** 간단한 해시 (프로필 + 혜택 IDs 결합) */ function makeCacheKey(profileDesc, benefitIds) {
    // 길이 제한 있는 Firestore 문서 ID용 간단 키
    const raw = profileDesc + '|' + benefitIds.sort().join(',');
    // 앞 200자만 사용 (Firestore 문서 ID 최대 1500 bytes)
    return raw.slice(0, 200).replace(/[\/\s]/g, '_');
}
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
        // ── 프로필 설명 생성 ─────────────────────────────────
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
        const benefitIds = benefits.map((b)=>b.id);
        // ══ C안: Firestore 캐시 조회 ════════════════════════
        const cacheKey = makeCacheKey(profileDesc, benefitIds);
        try {
            const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdminFirestore"])();
            const cacheDoc = await db.collection('ai_eligibility_cache').doc(cacheKey).get();
            if (cacheDoc.exists) {
                const cached = cacheDoc.data();
                const cachedAt = cached.cachedAt?.toMillis?.() ?? 0;
                const isExpired = Date.now() - cachedAt > CACHE_TTL_MS;
                if (!isExpired) {
                    console.log(`[ai-eligibility] Cache HIT — key: ${cacheKey.slice(0, 30)}...`);
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        results: cached.results,
                        cached: true
                    });
                }
                console.log(`[ai-eligibility] Cache EXPIRED — refreshing`);
            }
        } catch (cacheErr) {
            // 캐시 실패는 무시하고 계속 진행
            console.warn('[ai-eligibility] Cache read failed:', cacheErr);
        }
        // ══ OpenAI API 호출 ══════════════════════════════════
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAIClient"])();
        const benefitsDesc = benefits.map((b, i)=>`[${i + 1}] ID: ${b.id}\n제목: ${b.title}\n설명: ${b.description}\n카테고리: ${b.category}\n대상연령: ${b.targetAge || '전체'}\n소득기준: ${b.incomeLevel || '없음'}${b.eligibility ? `\n자격요건: ${b.eligibility}` : ''}`).join('\n\n');
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
        // ══ C안: Firestore 캐시 저장 ════════════════════════
        try {
            const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdminFirestore"])();
            await db.collection('ai_eligibility_cache').doc(cacheKey).set({
                results,
                profileDesc: profileDesc.slice(0, 300),
                benefitCount: benefits.length,
                cachedAt: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["FieldValue"].serverTimestamp()
            });
            console.log(`[ai-eligibility] Cache STORED — key: ${cacheKey.slice(0, 30)}...`);
        } catch (cacheErr) {
            // 저장 실패는 무시 (결과는 이미 클라이언트에 반환)
            console.warn('[ai-eligibility] Cache write failed:', cacheErr);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            results,
            cached: false
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
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__68579d49._.js.map