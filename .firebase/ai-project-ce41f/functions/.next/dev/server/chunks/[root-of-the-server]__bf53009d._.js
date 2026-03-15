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
"[project]/src/app/api/benefits/[id]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const API_BASE = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
function getXmlValue(xml, tag) {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
    const m = regex.exec(xml);
    return m ? m[1].trim() : '';
}
function getXmlValues(xml, parentTag, childTag) {
    const parentRegex = new RegExp(`<${parentTag}>([\\s\\S]*?)</${parentTag}>`, 'g');
    const results = [];
    let parentMatch;
    while((parentMatch = parentRegex.exec(xml)) !== null){
        const val = getXmlValue(parentMatch[1], childTag);
        if (val) results.push(val);
    }
    return results;
}
// Clean up text from API (remove excessive whitespace, keep line breaks meaningful)
function cleanText(text) {
    return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
}
async function GET(request, { params }) {
    const { id } = await params;
    const DATA_GO_KR_SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY;
    // Extract the actual servId (servId 형식: WLF00000024 or api-WLF00000024)
    const servId = id.startsWith('api-') ? id.replace('api-', '') : id;
    if (!servId || servId === 'api-') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Invalid benefit ID'
        }, {
            status: 400
        });
    }
    if (!DATA_GO_KR_SERVICE_KEY || DATA_GO_KR_SERVICE_KEY === 'placeholder') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'API key not configured'
        }, {
            status: 500
        });
    }
    try {
        const apiUrl = `${API_BASE}/NationalWelfaredetailedV001?serviceKey=${DATA_GO_KR_SERVICE_KEY}&callTp=D&servId=${servId}`;
        const response = await fetch(apiUrl, {
            next: {
                revalidate: 86400
            }
        });
        if (!response.ok) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'API error'
            }, {
                status: 502
            });
        }
        const xml = await response.text();
        // Check for API error
        const resultCode = getXmlValue(xml, 'resultCode');
        if (resultCode !== '0' && resultCode !== '00') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: getXmlValue(xml, 'resultMessage') || 'API returned error'
            }, {
                status: 502
            });
        }
        // Parse detailed benefit info
        const detail = {
            id,
            servId,
            title: getXmlValue(xml, 'servNm'),
            ministry: getXmlValue(xml, 'jurMnofNm'),
            phone: getXmlValue(xml, 'rprsCtadr'),
            year: getXmlValue(xml, 'crtrYr'),
            supportCycle: getXmlValue(xml, 'sprtCycNm'),
            supportType: getXmlValue(xml, 'srvPvsnNm'),
            // Detailed content fields
            overview: cleanText(getXmlValue(xml, 'wlfareInfoOutlCn')),
            targetDetail: cleanText(getXmlValue(xml, 'tgtrDtlCn')),
            selectionCriteria: cleanText(getXmlValue(xml, 'slctCritCn')),
            supportContent: cleanText(getXmlValue(xml, 'alwServCn')),
            // Array fields
            lifeStages: getXmlValue(xml, 'lifeArray'),
            targetGroups: getXmlValue(xml, 'trgterIndvdlArray'),
            themes: getXmlValue(xml, 'intrsThemaArray'),
            // Application methods
            applicationMethods: getXmlValues(xml, 'applmetList', 'servSeDetailNm'),
            applicationLinks: getXmlValues(xml, 'applmetList', 'servSeDetailLink'),
            // Inquiry contacts
            contacts: getXmlValues(xml, 'inqplCtadrList', 'servSeDetailNm').map((name, i)=>({
                    name,
                    address: getXmlValues(xml, 'inqplCtadrList', 'servSeDetailLink')[i] || ''
                })),
            // Required documents
            requiredDocs: getXmlValues(xml, 'basfrmList', 'servSeDetailNm'),
            // Related laws
            relatedLaws: getXmlValues(xml, 'baslawList', 'servSeDetailNm'),
            // Inquiry homepage
            homepages: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailNm').map((name, i)=>({
                    name,
                    url: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailLink')[i] || ''
                }))
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: detail,
            source: 'api'
        });
    } catch (error) {
        console.error('Detail API Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to fetch detail'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bf53009d._.js.map