module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

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
        const LIST_FIELDS = [
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
        const items = xmlParseItems(text, LIST_FIELDS);
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
    const LIST_FIELDS = [
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
        const firstItems = xmlParseItems(firstText, LIST_FIELDS);
        allItems.push(...firstItems);
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
                return xmlParseItems(text, LIST_FIELDS);
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
"[project]/src/app/api/benefits/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "revalidate",
    ()=>revalidate
]);
/**
 * GET /api/benefits — Fetch welfare benefits from data.go.kr
 * Real government data only. No mock/fake data.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/welfare-api.ts [app-route] (ecmascript)");
;
;
const revalidate = 3600 // ISR: revalidate every 1 hour
;
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');
    const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY;
    if (!serviceKey || serviceKey === 'placeholder') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            data: [],
            source: 'no_key',
            message: 'DATA_GO_KR_SERVICE_KEY is not configured'
        });
    }
    try {
        const apiItems = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchAllWelfareList"])();
        if (apiItems.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                data: [],
                source: 'api_empty',
                message: '공공데이터 API에서 데이터를 가져오지 못했습니다.'
            });
        }
        let benefits = apiItems.map((item, i)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transformListItemToBenefit"])(item, i));
        // Apply filters
        if (category && category !== 'all') {
            benefits = benefits.filter((b)=>b.category === category);
        }
        if (keyword) {
            benefits = benefits.filter((b)=>b.title.includes(keyword) || b.ministry.includes(keyword) || b.description.includes(keyword));
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: benefits,
            source: 'api',
            totalCount: benefits.length
        });
    } catch (error) {
        console.error('[/api/benefits] Fetch Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            data: [],
            source: 'error',
            message: 'API 호출 중 오류가 발생했습니다.'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__924fcb70._.js.map