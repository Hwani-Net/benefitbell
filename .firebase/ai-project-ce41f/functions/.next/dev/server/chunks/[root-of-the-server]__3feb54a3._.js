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
"[project]/src/lib/push-store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Shared push subscription store
 * Primary: Vercel KV (Redis) for persistence across cold starts
 * Fallback: globalThis memory (if KV not configured)
 */ __turbopack_context__.s([
    "addSubscription",
    ()=>addSubscription,
    "getSubscriptionCount",
    ()=>getSubscriptionCount,
    "getSubscriptions",
    ()=>getSubscriptions,
    "removeSubscription",
    ()=>removeSubscription
]);
// ─── Vercel KV helpers (dynamic import to avoid build errors when KV not installed) ───
async function kvAvailable() {
    try {
        // KV env vars presence check
        return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
    } catch  {
        return false;
    }
}
const KV_KEY = 'benefitbell:push_subs';
async function kvGet() {
    try {
        const { kv } = await __turbopack_context__.A("[project]/node_modules/@vercel/kv/dist/index.js [app-route] (ecmascript, async loader)");
        const subs = await kv.smembers(KV_KEY);
        return subs.map((s)=>JSON.parse(s));
    } catch  {
        return [];
    }
}
async function kvAdd(sub) {
    try {
        const { kv } = await __turbopack_context__.A("[project]/node_modules/@vercel/kv/dist/index.js [app-route] (ecmascript, async loader)");
        await kv.sadd(KV_KEY, JSON.stringify(sub));
    } catch  {
    // silent — fallback will handle
    }
}
async function kvRemove(endpoint) {
    try {
        const { kv } = await __turbopack_context__.A("[project]/node_modules/@vercel/kv/dist/index.js [app-route] (ecmascript, async loader)");
        const all = await kvGet();
        const target = all.find((s)=>s.endpoint === endpoint);
        if (target) await kv.srem(KV_KEY, JSON.stringify(target));
    } catch  {
    // silent
    }
}
// ─── In-memory fallback ───
const STORE_KEY = '__benefitbell_push_subs';
function memStore() {
    if (!globalThis[STORE_KEY]) {
        ;
        globalThis[STORE_KEY] = [];
    }
    return globalThis[STORE_KEY];
}
async function addSubscription(sub) {
    if (await kvAvailable()) {
        const existing = await kvGet();
        if (!existing.some((s)=>s.endpoint === sub.endpoint)) {
            await kvAdd(sub);
        }
        return;
    }
    // fallback
    const store = memStore();
    if (!store.some((s)=>s.endpoint === sub.endpoint)) store.push(sub);
}
async function removeSubscription(endpoint) {
    if (await kvAvailable()) {
        await kvRemove(endpoint);
        return;
    }
    const store = memStore();
    const idx = store.findIndex((s)=>s.endpoint === endpoint);
    if (idx !== -1) store.splice(idx, 1);
}
async function getSubscriptions() {
    if (await kvAvailable()) return kvGet();
    return memStore();
}
async function getSubscriptionCount() {
    return (await getSubscriptions()).length;
}
}),
"[project]/src/app/api/push/subscribe/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$push$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/push-store.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const subscription = await req.json();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$push$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addSubscription"])(subscription);
        const total = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$push$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSubscriptionCount"])();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            total
        });
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to save subscription'
        }, {
            status: 500
        });
    }
}
async function GET() {
    const count = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$push$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSubscriptionCount"])();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        count
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3feb54a3._.js.map