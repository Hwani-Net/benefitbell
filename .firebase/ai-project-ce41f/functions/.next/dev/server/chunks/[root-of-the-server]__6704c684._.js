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
            // Wait before trying next model on rate limits
            if (msg.includes('429') || msg.includes('rate_limit') || msg.includes('quota')) {
                await new Promise((r)=>setTimeout(r, 1000));
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
"[project]/src/app/api/ai-recommend/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/welfare-api.ts [app-route] (ecmascript)");
;
;
;
// In-memory cache for benefits context (expensive to rebuild every request)
let cachedContext = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
;
// Build a compact summary of all benefits for RAG context (from real API)
async function buildBenefitsContext() {
    const now = Date.now();
    if (cachedContext && now - cacheTimestamp < CACHE_TTL) {
        return cachedContext;
    }
    const items = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchAllWelfareList"])();
    if (items.length === 0) return '(혜택 데이터를 불러오지 못했습니다)';
    // Use first 100 items for context window (too many items = too many tokens)
    const context = items.slice(0, 100).map((item, i)=>{
        const b = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformListItemToBenefit"])(item, i);
        return JSON.stringify({
            id: b.id,
            title: b.title,
            category: b.category,
            amount: b.amount,
            description: b.description.substring(0, 100),
            ministry: b.ministry
        });
    }).join('\n');
    cachedContext = context;
    cacheTimestamp = now;
    return context;
}
async function POST(req) {
    try {
        const { userMessage, lang = 'ko' } = await req.json();
        if (!userMessage || typeof userMessage !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'userMessage required'
            }, {
                status: 400
            });
        }
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createAIClient"])();
        const benefitsContext = await buildBenefitsContext();
        const isKo = lang === 'ko';
        const systemPrompt = isKo ? `당신은 대한민국 정부 복지·지원 혜택 안내 전문가입니다.
아래는 공공데이터포털 실 데이터 기반 혜택 목록입니다 (JSON 형식):

${benefitsContext}

사용자의 상황을 분석하여:
1. 가장 적합한 혜택 ID를 3~5개 선택하세요 (benefitIds 배열)
2. 왜 이 혜택들을 추천하는지 2~3문장으로 설명하세요 (message)
3. 각 혜택에 대한 짧은 추천 이유 (1줄씩)를 reasons 객체로 제공하세요 (key: benefitId, value: 이유)

반드시 아래 JSON 형식으로만 응답하세요:
{"benefitIds": ["id1", "id2"], "message": "설명", "reasons": {"id1": "이유1", "id2": "이유2"}}` : `You are a Korean government benefits expert.
Below is the benefits list from real government open data (JSON format):

${benefitsContext}

Analyze the user's situation and:
1. Select 3-5 most relevant benefit IDs (benefitIds array)
2. Explain why these benefits are recommended in 2-3 sentences (message)
3. Provide a short reason for each benefit (reasons object: key=benefitId, value=reason)

Respond ONLY in this JSON format:
{"benefitIds": ["id1", "id2"], "message": "explanation", "reasons": {"id1": "reason1", "id2": "reason2"}}`;
        const text = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["callAIWithFallback"])(client, [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: isKo ? `사용자 상황: ${userMessage}` : `User situation: ${userMessage}`
            }
        ], {
            temperature: 0.3,
            maxTokens: 1500,
            jsonMode: true
        });
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Invalid AI response format'
            }, {
                status: 500
            });
        }
        const parsed = JSON.parse(jsonMatch[0]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            benefitIds: parsed.benefitIds ?? [],
            message: parsed.message ?? '',
            reasons: parsed.reasons ?? {}
        });
    } catch (err) {
        console.error('[ai-recommend] Error:', err);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('invalid_api_key') || msg.includes('not configured')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'AI_KEY_INVALID'
            }, {
                status: 503
            });
        }
        if (msg.includes('429') || msg.includes('quota') || msg.includes('rate_limit')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'AI_QUOTA'
            }, {
                status: 429
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'AI service error'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__6704c684._.js.map