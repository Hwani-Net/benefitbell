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
 * AI Client helper — OpenRouter (free tier)
 * 
 * Uses OpenRouter's free endpoint via OpenAI-compatible SDK.
 * Model fallback: tries multiple models if primary fails.
 * Free tier: 20 req/min, 200 req/day — sufficient for MVP.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/client.mjs [app-route] (ecmascript) <export OpenAI as default>");
;
// Model priority list — first available wins
const FREE_MODELS = [
    'openrouter/free',
    'meta-llama/llama-3.3-70b-instruct:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'google/gemma-3-27b-it:free'
];
function createAIClient() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$client$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__OpenAI__as__default$3e$__["default"]({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
            'HTTP-Referer': 'https://zippy-lolly-1f23de.netlify.app',
            'X-Title': 'BenefitBell'
        }
    });
}
async function callAIWithFallback(client, messages, options) {
    const { temperature = 0.3, maxTokens = 1000, jsonMode = false } = options ?? {};
    let lastError = null;
    for (const model of FREE_MODELS){
        try {
            const params = {
                model,
                messages,
                temperature,
                max_tokens: maxTokens
            };
            // Note: response_format may not work on all free models
            // We rely on prompt engineering for JSON output instead
            const completion = await client.chat.completions.create(params);
            const content = completion.choices[0]?.message?.content?.trim();
            if (!content) {
                console.warn(`[ai-client] Model ${model} returned empty content, trying next...`);
                continue;
            }
            return content;
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            const msg = lastError.message;
            console.warn(`[ai-client] Model ${model} failed: ${msg.substring(0, 100)}`);
            // Don't retry on auth errors
            if (msg.includes('401') || msg.includes('invalid_api_key')) {
                throw lastError;
            }
            continue;
        }
    }
    throw lastError ?? new Error('All AI models failed');
}
}),
"[project]/src/lib/welfare-api.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateDDay",
    ()=>calculateDDay,
    "fetchAllWelfareList",
    ()=>fetchAllWelfareList,
    "fetchWelfareDetail",
    ()=>fetchWelfareDetail,
    "fetchWelfareList",
    ()=>fetchWelfareList,
    "transformDetailToBenefit",
    ()=>transformDetailToBenefit,
    "transformListItemToBenefit",
    ()=>transformListItemToBenefit
]);
/**
 * Welfare API client — fetches real data from data.go.kr
 * 한국사회보장정보원 중앙부처 복지서비스 API
 */ const BASE_URL = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
const CATEGORY_KEYWORDS = {
    'basic-living': [
        '기초생활',
        '생계급여',
        '기초수급',
        '긴급복지'
    ],
    'near-poverty': [
        '차상위',
        '저소득'
    ],
    'youth': [
        '청년',
        '청소년',
        '대학생',
        '도약계좌'
    ],
    'middle-aged': [
        '장년',
        '중장년',
        '경력단절'
    ],
    'senior': [
        '노인',
        '어르신',
        '기초연금',
        '노령'
    ],
    'housing': [
        '주거',
        '월세',
        '임대',
        '전세',
        '주택'
    ],
    'medical': [
        '의료',
        '건강',
        '보건',
        '치료',
        '간병'
    ],
    'education': [
        '교육',
        '장학',
        '학비',
        '학자금',
        '돌봄'
    ],
    'employment': [
        '취업',
        '고용',
        '일자리',
        '직업훈련',
        '취창업'
    ],
    'small-biz': [
        '소상공인',
        '소공인',
        '자영업',
        '경영안정',
        '정책자금'
    ],
    'startup': [
        '창업',
        '예비창업',
        '스타트업',
        '벤처'
    ],
    'closure-restart': [
        '폐업',
        '재창업',
        '재기',
        '희망리턴'
    ],
    'debt-relief': [
        '채무',
        '회생',
        '파산',
        '신용회복',
        '새출발',
        '워크아웃'
    ]
};
const CATEGORY_LABELS = {
    'basic-living': {
        ko: '기초생활수급',
        en: 'Basic Living'
    },
    'near-poverty': {
        ko: '차상위계층',
        en: 'Near Poverty'
    },
    'youth': {
        ko: '청년 지원',
        en: 'Youth Support'
    },
    'middle-aged': {
        ko: '장년 지원',
        en: 'Middle-Aged'
    },
    'senior': {
        ko: '노인 복지',
        en: 'Senior Welfare'
    },
    'housing': {
        ko: '주거 지원',
        en: 'Housing'
    },
    'medical': {
        ko: '의료 지원',
        en: 'Medical'
    },
    'education': {
        ko: '교육 지원',
        en: 'Education'
    },
    'employment': {
        ko: '취업 지원',
        en: 'Employment'
    },
    'small-biz': {
        ko: '소상공인 지원',
        en: 'Small Biz'
    },
    'startup': {
        ko: '창업 지원',
        en: 'Startup'
    },
    'closure-restart': {
        ko: '폐업·재창업',
        en: 'Closure & Restart'
    },
    'debt-relief': {
        ko: '채무조정·회생',
        en: 'Debt Relief'
    }
};
/**
 * Classify benefit into category based on keywords in title and content
 */ function classifyCategory(title, content = '') {
    const combined = `${title} ${content}`.toLowerCase();
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)){
        if (keywords.some((kw)=>combined.includes(kw))) {
            return category;
        }
    }
    return 'basic-living' // fallback
    ;
}
function calculateDDay(endDateStr) {
    if (!endDateStr) return 365;
    // Handle "상시", "연중" (year-round)
    if (endDateStr.includes('상시') || endDateStr.includes('연중') || endDateStr.includes('별도')) {
        return 365;
    }
    // Normalize date separators
    const cleaned = endDateStr.replace(/[.\-/]/g, '').trim();
    if (cleaned.length < 8) return 365;
    const year = parseInt(cleaned.substring(0, 4));
    const month = parseInt(cleaned.substring(4, 6)) - 1;
    const day = parseInt(cleaned.substring(6, 8));
    if (isNaN(year) || isNaN(month) || isNaN(day)) return 365;
    const endDate = new Date(year, month, day, 23, 59, 59);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
}
/**
 * Determine benefit status based on dates
 */ function getStatus(startDateStr, endDateStr) {
    const dDay = calculateDDay(endDateStr);
    if (dDay < 0) return 'closed';
    if (startDateStr) {
        const startDDay = calculateDDay(startDateStr);
        if (startDDay > 0) return 'upcoming';
    }
    return 'open';
}
// =====================
// XML Parsing Utilities
// =====================
/** Get single XML tag value */ function xmlGet(text, tag) {
    const m = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`));
    return m ? m[1].trim() : '';
}
/** Get all values of a repeated XML tag */ function xmlGetAll(text, tag) {
    const re = new RegExp(`<${tag}>([\\s\\S]*?)<\/${tag}>`, 'g');
    const results = [];
    let m;
    while((m = re.exec(text)) !== null)results.push(m[1].trim());
    return results;
}
/** Extract all <item> blocks and parse them into objects with specified fields */ function xmlParseItems(text, fields) {
    const itemBlocks = text.match(/<servList>[\s\S]*?<\/servList>/g) ?? [];
    return itemBlocks.map((block)=>{
        const obj = {};
        for (const f of fields)obj[f] = xmlGet(block, f);
        return obj;
    });
}
async function fetchWelfareList(pageNo = 1, numOfRows = 500) {
    const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
    if (!serviceKey) {
        console.warn('[welfare-api] DATA_GO_KR_SERVICE_KEY not set');
        return [];
    }
    // ⚠️ srchKeyCode=001 필수 — 없으면 resultCode:10 에러
    // ⚠️ _type=json 무시됨 — XML 파싱으로 처리
    const url = `${BASE_URL}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&srchKeyCode=001&pageNo=${pageNo}&numOfRows=${numOfRows}`;
    try {
        const res = await fetch(url, {
            next: {
                revalidate: 3600
            }
        }) // ISR 1h cache
        ;
        if (!res.ok) {
            console.error(`[welfare-api] List fetch failed: ${res.status}`);
            return [];
        }
        const text = await res.text();
        const resultCode = xmlGet(text, 'resultCode');
        if (resultCode !== '0' && resultCode !== '00') {
            console.error(`[welfare-api] API error: ${resultCode} - ${xmlGet(text, 'resultMessage')}`);
            return [];
        }
        // ⚠️ 실제 XML 태그: jurMnofNm(부처명), lifeArray(생애주기), intrsThemaArray(관심주제)
        const RAW_FIELDS = [
            'servId',
            'servNm',
            'servDgst',
            'jurMnofNm',
            'lifeArray',
            'intrsThemaArray',
            'trgterIndvdlArray',
            'servDtlLink',
            'inqNum',
            'svcfrstRegTs',
            'lastModYmd'
        ];
        const items = xmlParseItems(text, RAW_FIELDS).map((item)=>({
                servId: item.servId,
                servNm: item.servNm,
                servDgst: item.servDgst,
                jurOrgNm: item.jurMnofNm,
                lifeNmArray: item.lifeArray,
                intrsThemNmArray: item.intrsThemaArray,
                trgterIndvdlArray: item.trgterIndvdlArray,
                servDtlLink: item.servDtlLink,
                inqNum: Number(item.inqNum) || 0,
                svcfrstRegTs: item.svcfrstRegTs,
                lastModYmd: item.lastModYmd
            }));
        return items;
    } catch (err) {
        console.error('[welfare-api] List fetch error:', err);
        return [];
    }
}
async function fetchAllWelfareList() {
    const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
    if (!serviceKey) return [];
    const numOfRows = 500;
    const allItems = [];
    // ⚠️ 실제 XML 태그: jurMnofNm(부처명), lifeArray(생애주기), intrsThemaArray(관심주제)
    const RAW_FIELDS = [
        'servId',
        'servNm',
        'servDgst',
        'jurMnofNm',
        'lifeArray',
        'intrsThemaArray',
        'trgterIndvdlArray',
        'servDtlLink',
        'inqNum',
        'svcfrstRegTs',
        'lastModYmd'
    ];
    const remapItems = (raw)=>raw.map((item)=>({
                servId: item.servId,
                servNm: item.servNm,
                servDgst: item.servDgst,
                jurOrgNm: item.jurMnofNm,
                lifeNmArray: item.lifeArray,
                intrsThemNmArray: item.intrsThemaArray,
                trgterIndvdlArray: item.trgterIndvdlArray,
                servDtlLink: item.servDtlLink,
                inqNum: Number(item.inqNum) || 0,
                svcfrstRegTs: item.svcfrstRegTs,
                lastModYmd: item.lastModYmd
            }));
    try {
        // First page to get totalCount
        const firstUrl = `${BASE_URL}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&srchKeyCode=001&pageNo=1&numOfRows=${numOfRows}`;
        const firstRes = await fetch(firstUrl, {
            next: {
                revalidate: 3600
            }
        });
        if (!firstRes.ok) return [];
        const firstText = await firstRes.text();
        const resultCode = xmlGet(firstText, 'resultCode');
        if (resultCode !== '0' && resultCode !== '00') {
            console.error(`[welfare-api] API error on first page: ${resultCode}`);
            return [];
        }
        const totalCount = parseInt(xmlGet(firstText, 'totalCount') || '0', 10);
        allItems.push(...remapItems(xmlParseItems(firstText, RAW_FIELDS)));
        console.log(`[welfare-api] Total: ${totalCount}, fetched page 1 (${allItems.length})`);
        // Fetch remaining pages in parallel (up to 10 pages max = 5000 items)
        const totalPages = Math.min(Math.ceil(totalCount / numOfRows), 10);
        if (totalPages > 1) {
            const pageNums = Array.from({
                length: totalPages - 1
            }, (_, i)=>i + 2);
            const results = await Promise.all(pageNums.map(async (page)=>{
                const url = `${BASE_URL}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&srchKeyCode=001&pageNo=${page}&numOfRows=${numOfRows}`;
                const res = await fetch(url, {
                    next: {
                        revalidate: 3600
                    }
                });
                if (!res.ok) return [];
                const text = await res.text();
                return remapItems(xmlParseItems(text, RAW_FIELDS));
            }));
            results.forEach((items)=>allItems.push(...items));
        }
        console.log(`[welfare-api] Total fetched: ${allItems.length} items`);
        return allItems;
    } catch (err) {
        console.error('[welfare-api] fetchAllWelfareList error:', err);
        return [];
    }
}
async function fetchWelfareDetail(servId) {
    const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
    if (!serviceKey) return null;
    const url = `${BASE_URL}/NationalWelfaredetailedV001?serviceKey=${serviceKey}&callTp=D&servId=${servId}&_type=json`;
    try {
        const res = await fetch(url, {
            next: {
                revalidate: 3600
            }
        });
        if (!res.ok) return null;
        const data = await res.json();
        const item = data?.response?.body?.items?.item;
        if (!item) return null;
        return Array.isArray(item) ? item[0] : item;
    } catch (err) {
        console.error('[welfare-api] Detail fetch error:', err);
        return null;
    }
}
function transformListItemToBenefit(item, index) {
    const category = classifyCategory(item.servNm, item.servDgst);
    const labels = CATEGORY_LABELS[category];
    return {
        id: item.servId || `api-${index}`,
        title: item.servNm || '(제목 없음)',
        titleEn: item.servNm || '(No Title)',
        category,
        categoryLabel: labels.ko,
        categoryLabelEn: labels.en,
        amount: item.servDgst || '상세 페이지 확인',
        amountEn: item.servDgst || 'See details',
        description: item.servDgst || '',
        descriptionEn: item.servDgst || '',
        applicationStart: '',
        applicationEnd: '',
        dDay: 365,
        status: 'open',
        applyUrl: item.servDtlLink || 'https://www.bokjiro.go.kr',
        ministry: item.jurOrgNm || '미정',
        ministryEn: item.jurOrgNm || 'TBD',
        steps: [],
        documents: [],
        documentsEn: [],
        eligibilityChecks: [],
        popular: (item.inqNum || 0) > 1000,
        new: (()=>{
            // svcfrstRegTs: 최초등록일 — 90일 이내면 신규
            const ts = String(item.svcfrstRegTs || '');
            const dateStr = ts.replace(/[\s.\-/T:]/g, '').substring(0, 8);
            if (dateStr.length < 8) return false;
            try {
                const regDate = new Date(parseInt(dateStr.substring(0, 4)), parseInt(dateStr.substring(4, 6)) - 1, parseInt(dateStr.substring(6, 8)));
                const daysDiff = (Date.now() - regDate.getTime()) / (1000 * 60 * 60 * 24);
                return daysDiff <= 90;
            } catch  {
                return false;
            }
        })()
    };
}
function transformDetailToBenefit(item) {
    const category = classifyCategory(item.servNm, `${item.trgterIndvdl} ${item.alwServCn}`);
    const labels = CATEGORY_LABELS[category];
    const startDate = item.applyBgnDt || '';
    const endDate = item.applyEndDt || '';
    const dDay = calculateDDay(endDate);
    const status = getStatus(startDate, endDate);
    // Parse application method into steps
    const steps = item.aplyMtdCn ? item.aplyMtdCn.split(/[.\n]/).filter((s)=>s.trim()).slice(0, 4).map((s, i)=>({
            title: `Step ${i + 1}`,
            titleEn: `Step ${i + 1}`,
            desc: s.trim(),
            descEn: s.trim()
        })) : [];
    return {
        id: item.servId,
        title: item.servNm || '(제목 없음)',
        titleEn: item.servNm || '(No Title)',
        category,
        categoryLabel: labels.ko,
        categoryLabelEn: labels.en,
        amount: item.alwServCn?.substring(0, 60) || '상세 페이지 확인',
        amountEn: item.alwServCn?.substring(0, 60) || 'See details',
        description: item.alwServCn || item.servDgst || '',
        descriptionEn: item.alwServCn || item.servDgst || '',
        targetAge: item.trgterIndvdl || undefined,
        incomeLevel: item.slctCriteria || undefined,
        applicationStart: startDate,
        applicationEnd: endDate,
        dDay,
        status,
        applyUrl: item.servDtlLink || 'https://www.bokjiro.go.kr',
        ministry: item.jurOrgNm || '미정',
        ministryEn: item.jurOrgNm || 'TBD',
        steps,
        documents: [],
        documentsEn: [],
        eligibilityChecks: [],
        popular: (item.inqNum || 0) > 1000,
        new: false
    };
}
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
// 환경변수: FIREBASE_SERVICE_ACCOUNT_KEY (JSON 문자열) 또는 파일 경로
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/app [external] (firebase-admin/app, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/firestore [external] (firebase-admin/firestore, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/auth [external] (firebase-admin/auth, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$messaging__$5b$external$5d$__$28$firebase$2d$admin$2f$messaging$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/messaging [external] (firebase-admin/messaging, esm_import, [project]/node_modules/firebase-admin)");
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
let adminApp = null;
function getAdminApp() {
    if (adminApp) return adminApp;
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getApps"])().length > 0) {
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getApps"])()[0];
        return adminApp;
    }
    // 우선순위: JSON 문자열 → 파일 경로
    const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    if (keyJson) {
        const serviceAccount = JSON.parse(keyJson);
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
            credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["cert"])(serviceAccount)
        });
    } else if (keyPath) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
            credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["cert"])((()=>{
                const e = new Error("Cannot find module as expression is too dynamic");
                e.code = 'MODULE_NOT_FOUND';
                throw e;
            })())
        });
    } else {
        throw new Error('Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY 또는 FIREBASE_SERVICE_ACCOUNT_KEY_PATH 환경변수가 필요합니다.');
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
"[project]/src/app/api/ai-check/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/welfare-api.ts [app-route] (ecmascript)");
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
;
// =====================
// Rate Limiting (free: 3 req/day, premium: unlimited) — Firestore 기반
// =====================
const FREE_DAILY_LIMIT = 3;
async function checkRateLimit(req, isPremium) {
    if (isPremium) return {
        allowed: true,
        remaining: 999
    };
    const cookieHeader = req.headers.get('cookie') ?? '';
    const kakaoMatch = cookieHeader.match(/kakao_profile=([^;]+)/);
    let identifier = 'ip:' + (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown');
    if (kakaoMatch) {
        try {
            const profile = JSON.parse(decodeURIComponent(kakaoMatch[1]));
            if (profile.id) identifier = 'kakao:' + profile.id;
        } catch  {}
    }
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    ;
    const docId = `${identifier.replace(/[^a-zA-Z0-9_-]/g, '_')}:${today}`;
    try {
        const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAdminFirestore"])();
        const ref = db.collection('ai_rate_limits').doc(docId);
        const snap = await ref.get();
        const count = snap.exists ? snap.data()?.count ?? 0 : 0;
        if (count >= FREE_DAILY_LIMIT) return {
            allowed: false,
            remaining: 0
        };
        await ref.set({
            count: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["FieldValue"].increment(1),
            date: today,
            updated_at: __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$firestore__$5b$external$5d$__$28$firebase$2d$admin$2f$firestore$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["FieldValue"].serverTimestamp()
        }, {
            merge: true
        });
        return {
            allowed: true,
            remaining: FREE_DAILY_LIMIT - count - 1
        };
    } catch  {
        // Firestore 오류 시 허용 (availability > security)
        return {
            allowed: true,
            remaining: FREE_DAILY_LIMIT
        };
    }
}
function extractServId(benefitId) {
    return benefitId.startsWith('api-') ? benefitId.replace('api-', '') : benefitId;
}
async function POST(req) {
    try {
        const body = await req.json();
        const { benefitId, lang = 'ko', isPremium = false } = body;
        if (!benefitId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'benefitId required'
            }, {
                status: 400
            });
        }
        const { allowed, remaining } = await checkRateLimit(req, isPremium);
        if (!allowed) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: '오늘 AI 분석 횟수를 모두 사용했어요.',
                code: 'RATE_LIMIT_EXCEEDED',
                remaining: 0
            }, {
                status: 429
            });
        }
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAIClient"])();
        const servId = extractServId(benefitId);
        const detail = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchWelfareDetail"])(servId);
        if (!detail) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: '혜택 정보를 찾을 수 없습니다.'
            }, {
                status: 404
            });
        }
        const isKo = lang === 'ko';
        const prompt = isKo ? `
다음 정부 지원 혜택에 대해 분석해주세요:

제목: ${detail.servNm}
대상: ${detail.trgterIndvdl || '정보 없음'}
선발 기준: ${detail.slctCriteria || '정보 없음'}
지원 내용: ${detail.alwServCn || '정보 없음'}
개요: ${detail.servDgst || '정보 없음'}

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

Title: ${detail.servNm}
Target: ${detail.trgterIndvdl || 'N/A'}
Criteria: ${detail.slctCriteria || 'N/A'}
Support: ${detail.alwServCn || 'N/A'}

Respond in JSON:
{
  "summary": ["line1", "line2", "line3"],
  "quickVerdict": "likely" | "partial" | "unlikely",
  "questions": ["question1", "question2", "question3"]
}
    `;
        const text = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callAIWithFallback"])(client, [
            {
                role: 'system',
                content: '당신은 대한민국 정부 복지 혜택 분석 전문가입니다. 반드시 JSON 형식으로만 응답하세요.'
            },
            {
                role: 'user',
                content: prompt
            }
        ], {
            temperature: 0.3,
            maxTokens: 800,
            jsonMode: true
        });
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'AI 분석 결과를 파싱할 수 없습니다.'
            }, {
                status: 500
            });
        }
        const parsed = JSON.parse(jsonMatch[0]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            questions: parsed.questions ?? [],
            summary: parsed.summary ?? [],
            quickVerdict: parsed.quickVerdict ?? 'partial',
            remaining
        });
    } catch (err) {
        console.error('[ai-check] Error:', err);
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('429') || message.toLowerCase().includes('quota') || message.includes('rate_limit')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'AI 서비스가 일시적으로 과부하 상태입니다.',
                code: 'AI_OVERLOADED'
            }, {
                status: 503
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'AI 분석 중 오류가 발생했습니다.'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__21b0586a._.js.map