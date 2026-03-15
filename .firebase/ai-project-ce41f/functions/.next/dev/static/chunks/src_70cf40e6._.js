(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/data/benefits.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 혜택 데이터 타입 정의
__turbopack_context__.s([
    "CATEGORY_INFO",
    ()=>CATEGORY_INFO,
    "bText",
    ()=>bText,
    "getDDayColor",
    ()=>getDDayColor,
    "getDDayText",
    ()=>getDDayText,
    "getUrgentBenefits",
    ()=>getUrgentBenefits
]);
function getDDayColor(dDay) {
    if (dDay < 0) return 'var(--text-tertiary)';
    if (dDay === 0) return '#ef4444';
    if (dDay <= 3) return '#f97316';
    if (dDay <= 7) return '#eab308';
    return 'var(--text-secondary)';
}
function getDDayText(dDay, lang = 'ko') {
    if (dDay < 0) return lang === 'ko' ? '마감' : 'Closed';
    if (dDay === 0) return lang === 'ko' ? 'D-Day' : 'Today!';
    return `D-${dDay}`;
}
const CATEGORY_INFO = {
    'basic-living': {
        icon: '🏠',
        color: '#6366f1',
        label: '기초생활수급',
        labelEn: 'Basic Living'
    },
    'near-poverty': {
        icon: '💙',
        color: '#8b5cf6',
        label: '차상위계층',
        labelEn: 'Near Poverty'
    },
    'youth': {
        icon: '🌱',
        color: '#10b981',
        label: '청년 지원',
        labelEn: 'Youth Support'
    },
    'middle-aged': {
        icon: '👔',
        color: '#3b82f6',
        label: '장년 지원',
        labelEn: 'Middle-Aged'
    },
    'senior': {
        icon: '👴',
        color: '#f59e0b',
        label: '노인 복지',
        labelEn: 'Senior Welfare'
    },
    'housing': {
        icon: '🏡',
        color: '#06b6d4',
        label: '주거 지원',
        labelEn: 'Housing'
    },
    'medical': {
        icon: '🏥',
        color: '#ef4444',
        label: '의료 지원',
        labelEn: 'Medical'
    },
    'education': {
        icon: '📚',
        color: '#8b5cf6',
        label: '교육 지원',
        labelEn: 'Education'
    },
    'employment': {
        icon: '💼',
        color: '#14b8a6',
        label: '취업 지원',
        labelEn: 'Employment'
    },
    'small-biz': {
        icon: '🏪',
        color: '#f97316',
        label: '소상공인 지원',
        labelEn: 'Small Biz'
    },
    'startup': {
        icon: '🚀',
        color: '#a855f7',
        label: '창업 지원',
        labelEn: 'Startup'
    },
    'closure-restart': {
        icon: '🔄',
        color: '#78716c',
        label: '폐업·재창업',
        labelEn: 'Closure & Restart'
    },
    'debt-relief': {
        icon: '💳',
        color: '#64748b',
        label: '채무조정·회생',
        labelEn: 'Debt Relief'
    }
};
function getUrgentBenefits(benefits, daysThreshold) {
    return benefits.filter((b)=>b.dDay >= 0 && b.dDay <= daysThreshold && b.status !== 'closed');
}
/** Strip HTML tags + decode entities (defense-in-depth for API data) */ function stripHtml(text) {
    if (!text || !text.includes('<')) return text;
    return text.replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, ' ').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/[ ]{2,}/g, ' ').trim();
}
function bText(b, field, lang) {
    if (lang === 'ko') return stripHtml(b[field]);
    const enKey = `${field}En`;
    const en = b[enKey];
    return stripHtml(en || b[field]) // fallback to Korean if English is empty
    ;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/recommendation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeRuleScore",
    ()=>computeRuleScore,
    "getFilteredBenefits",
    ()=>getFilteredBenefits,
    "getPersonalizedBenefits",
    ()=>getPersonalizedBenefits
]);
function computeRuleScore(benefit, profile) {
    const age = new Date().getFullYear() - profile.birthYear;
    let score = 10 // base score (conservative — must earn points through matching)
    ;
    const text = (benefit.title + ' ' + (benefit.description || '')).toLowerCase();
    const matchReasons = [];
    // ── 1. 카테고리 매칭 (핵심 — 감점도 반영!) ─────────
    const categoryMatch = matchCategory(benefit.category, profile, age);
    score += categoryMatch.score; // 불일치 시 마이너스도 반영
    if (categoryMatch.score > 0 && categoryMatch.reason) {
        matchReasons.push(categoryMatch.reason);
    }
    // ── 2. targetAge 범위 매칭 ──────────────────────
    if (benefit.targetAge) {
        const ageResult = matchTargetAge(benefit.targetAge, age);
        score += ageResult.score;
        if (ageResult.reason) matchReasons.push(ageResult.reason);
    }
    // ── 3. incomeLevel 매칭 ─────────────────────────
    if (benefit.incomeLevel) {
        const incomeResult = matchIncomeLevel(benefit.incomeLevel, profile.incomePercent);
        score += incomeResult.score;
        if (incomeResult.reason) matchReasons.push(incomeResult.reason);
    }
    // ── 4. 지역 매칭 (보조 가점, 핵심이 아님) ──────────
    if (profile.region) {
        const regionParts = profile.region.split(' ');
        const regionBase = regionParts[0]?.replace('광역시', '').replace('특별시', '').replace('특별자치시', '').replace('특별자치도', '') || '';
        if (regionBase && text.includes(regionBase)) {
            score += 5; // 시/도 일치 (보조)
            matchReasons.push(`거주지(${regionParts[0]}) 일치`);
        }
        if (regionParts[1] && text.includes(regionParts[1])) {
            score += 5; // 시/군/구 일치 (보조)
        }
    }
    // ── 5. 고용상태 키워드 매칭 ──────────────────────
    const empMatch = matchEmployment(profile.employmentStatus, text, benefit.category);
    if (empMatch.score > 0) {
        score += empMatch.score;
        matchReasons.push(empMatch.reason);
    }
    // ── 6. 주거형태 매칭 ────────────────────────────
    if (profile.housingType === 'monthly' && (text.includes('월세') || text.includes('임차'))) {
        score += 10;
        matchReasons.push('월세 거주자 대상');
    }
    if (profile.housingType === 'deposit' && (text.includes('전세') || text.includes('임차'))) {
        score += 10;
        matchReasons.push('전세 거주자 대상');
    }
    // ── 7. 가족/자녀 상태 매칭 (핵심 필터!) ───────────
    const familyKeywords = [
        '자녀',
        '육아',
        '양육',
        '아동',
        '유아',
        '초등학생',
        '중학생',
        '고등학생',
        '돌봄',
        '어린이집',
        '출산'
    ];
    const hasFamilyContext = familyKeywords.some((k)=>text.includes(k));
    if (hasFamilyContext) {
        if (profile.hasChildren) {
            score += 15;
            matchReasons.push('자녀 양육 가구 대상');
        } else {
            // 무자녀 → 자녀 혜택에 감점 (과도하지 않게 -10)
            score -= 10;
        }
    }
    // 한부모 혜택 체크 (팀장 리뷰 반영: divorced+자녀=진짜 한부모)
    if (text.includes('한부모')) {
        const isSingleParent = profile.maritalStatus === 'divorced' && profile.hasChildren;
        if (isSingleParent || profile.specialStatus.includes('singleParent')) {
            score += 20;
            matchReasons.push('한부모 가구 대상');
        } else if (!profile.hasChildren) {
            score -= 10; // 자녀 없으면 한부모 혜택 해당 안 됨
        }
    }
    // ── 8. 특수상태 매칭 (고배점) ────────────────────
    for (const status of profile.specialStatus){
        const specialResult = matchSpecialStatus(status, text);
        if (specialResult.score > 0) {
            score += specialResult.score;
            matchReasons.push(specialResult.reason);
        }
    }
    // ── 9. eligibilityChecks 키워드 매칭 ────────────
    if (benefit.eligibilityChecks?.length > 0) {
        const checkMatch = matchEligibilityChecks(benefit.eligibilityChecks, profile, age);
        score += checkMatch.score;
    }
    // ── 점수 제한 + 판정 ────────────────────────────
    score = Math.min(score, 95); // 절대 100% 불가 (실제 확인 필요)
    score = Math.max(score, 5); // 최소 5%
    const verdict = score >= 65 ? 'likely' : score >= 35 ? 'partial' : 'unlikely';
    const summary = matchReasons.length > 0 ? matchReasons.slice(0, 2).join(', ') : verdict === 'likely' ? '프로필 조건이 대체로 부합합니다.' : verdict === 'partial' ? '일부 조건이 일치합니다. 세부 요건을 확인하세요.' : '현재 프로필 기준으로 해당 가능성이 낮습니다.';
    return {
        score,
        verdict,
        summary
    };
}
// ── Helper: 카테고리 매칭 ──────────────────────────
function matchCategory(category, profile, age) {
    switch(category){
        case 'youth':
            return age >= 19 && age <= 39 ? {
                score: 25,
                reason: '청년 대상 혜택'
            } : {
                score: -15,
                reason: ''
            };
        case 'senior':
            return age >= 60 ? {
                score: 25,
                reason: '어르신 대상 혜택'
            } : {
                score: -15,
                reason: ''
            };
        case 'middle-aged':
            return age >= 40 && age < 65 ? {
                score: 20,
                reason: '장년 대상 혜택'
            } : {
                score: -10,
                reason: ''
            };
        case 'employment':
            return profile.employmentStatus === 'jobSeeking' ? {
                score: 25,
                reason: '구직자 대상 취업 지원'
            } : {
                score: -5,
                reason: ''
            };
        case 'small-biz':
        case 'startup':
            return profile.employmentStatus === 'selfEmployed' ? {
                score: 25,
                reason: '소상공인/창업자 대상'
            } : {
                score: -15,
                reason: ''
            };
        case 'education':
            return profile.employmentStatus === 'student' ? {
                score: 25,
                reason: '학생 대상 교육 지원'
            } : {
                score: -10,
                reason: ''
            };
        case 'basic-living':
            return profile.incomePercent <= 50 ? {
                score: 25,
                reason: '저소득 대상 기초생활 지원'
            } : {
                score: -5,
                reason: ''
            };
        case 'near-poverty':
            return profile.incomePercent <= 75 ? {
                score: 20,
                reason: '차상위 소득 대상'
            } : {
                score: -5,
                reason: ''
            };
        case 'housing':
            return profile.housingType !== 'owned' ? {
                score: 15,
                reason: '임차 거주자 대상 주거 지원'
            } : {
                score: -5,
                reason: ''
            };
        case 'debt-relief':
        case 'closure-restart':
            return {
                score: 5,
                reason: ''
            };
        case 'medical':
            return {
                score: 5,
                reason: ''
            };
        default:
            return {
                score: 0,
                reason: ''
            };
    }
}
// ── Helper: targetAge 파싱 ─────────────────────────
function matchTargetAge(targetAge, age) {
    // Examples: "19세~39세", "만 65세 이상", "전체", "18~34", "60세 이상"
    const normalized = targetAge.replace(/만\s*/g, '').replace(/세/g, '');
    if (normalized.includes('전체') || normalized.includes('제한없')) {
        return {
            score: 5,
            reason: ''
        };
    }
    // Range: "19~39", "18~34"
    const rangeMatch = normalized.match(/(\d+)\s*[~\-]\s*(\d+)/);
    if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        if (age >= min && age <= max) {
            return {
                score: 15,
                reason: `연령 조건(${min}~${max}세) 부합`
            };
        }
        return {
            score: -15,
            reason: ''
        };
    }
    // "이상": "65 이상"
    const aboveMatch = normalized.match(/(\d+)\s*이상/);
    if (aboveMatch) {
        const min = parseInt(aboveMatch[1]);
        if (age >= min) return {
            score: 15,
            reason: `${min}세 이상 조건 부합`
        };
        return {
            score: -15,
            reason: ''
        };
    }
    // "이하": "34 이하"
    const belowMatch = normalized.match(/(\d+)\s*이하/);
    if (belowMatch) {
        const max = parseInt(belowMatch[1]);
        if (age <= max) return {
            score: 15,
            reason: `${max}세 이하 조건 부합`
        };
        return {
            score: -15,
            reason: ''
        };
    }
    return {
        score: 0,
        reason: ''
    };
}
// ── Helper: 소득 매칭 ──────────────────────────────
function matchIncomeLevel(incomeLevel, userIncomePercent) {
    // Examples: "중위소득 50% 이하", "기준중위소득 120%", "소득기준 없음"
    if (incomeLevel.includes('없음') || incomeLevel.includes('무관') || incomeLevel.includes('제한없')) {
        return {
            score: 5,
            reason: ''
        };
    }
    const percentMatch = incomeLevel.match(/(\d+)\s*%/);
    if (percentMatch) {
        const threshold = parseInt(percentMatch[1]);
        if (userIncomePercent <= threshold) {
            return {
                score: 15,
                reason: `소득 조건(중위소득 ${threshold}% 이하) 부합`
            };
        }
        return {
            score: -10,
            reason: ''
        };
    }
    return {
        score: 0,
        reason: ''
    };
}
// ── Helper: 고용상태 매칭 ──────────────────────────
function matchEmployment(status, text, category) {
    if (status === 'jobSeeking') {
        if (text.includes('구직') || text.includes('취업') || text.includes('실업') || category === 'employment') return {
            score: 15,
            reason: '구직자 대상'
        };
    }
    if (status === 'selfEmployed') {
        if (text.includes('소상공인') || text.includes('자영업') || text.includes('사업자') || text.includes('창업')) return {
            score: 15,
            reason: '소상공인/자영업자 대상'
        };
    }
    if (status === 'student') {
        if (text.includes('학생') || text.includes('장학') || text.includes('대학')) return {
            score: 15,
            reason: '학생 대상'
        };
    }
    if (status === 'employed') {
        if (text.includes('근로자') || text.includes('재직')) return {
            score: 10,
            reason: '근로자 대상'
        };
    }
    return {
        score: 0,
        reason: ''
    };
}
// ── Helper: 특수상태 매칭 ──────────────────────────
function matchSpecialStatus(status, text) {
    const map = {
        disability: {
            keywords: [
                '장애',
                '장애인'
            ],
            label: '장애인 대상'
        },
        singleParent: {
            keywords: [
                '한부모',
                '한 부모',
                '모자가정',
                '부자가정'
            ],
            label: '한부모 가정 대상'
        },
        multicultural: {
            keywords: [
                '다문화',
                '결혼이민'
            ],
            label: '다문화 가정 대상'
        },
        veteran: {
            keywords: [
                '국가유공자',
                '보훈'
            ],
            label: '국가유공자 대상'
        }
    };
    const entry = map[status];
    if (!entry) return {
        score: 0,
        reason: ''
    };
    for (const kw of entry.keywords){
        if (text.includes(kw)) return {
            score: 20,
            reason: entry.label
        };
    }
    return {
        score: 0,
        reason: ''
    };
}
// ── Helper: eligibilityChecks 매칭 ─────────────────
function matchEligibilityChecks(checks, profile, age) {
    let bonus = 0;
    for (const check of checks){
        const label = check.label.toLowerCase();
        // 나이 관련 체크
        if (label.includes('청년') && age >= 19 && age <= 39) bonus += 3;
        if (label.includes('어르신') && age >= 60) bonus += 3;
        // 소득 관련
        if (label.includes('저소득') && profile.incomePercent <= 50) bonus += 3;
        if (label.includes('차상위') && profile.incomePercent <= 75) bonus += 3;
        // 특수상태
        for (const s of profile.specialStatus){
            if (s === 'disability' && label.includes('장애')) bonus += 5;
            if (s === 'singleParent' && label.includes('한부모')) bonus += 5;
        }
    }
    return {
        score: Math.min(bonus, 15)
    } // 체크리스트 보너스 상한 15점
    ;
}
function getFilteredBenefits(benefits, profile) {
    const likely = [];
    const partial = [];
    const unlikely = [];
    for (const benefit of benefits){
        const { score, verdict, summary } = computeRuleScore(benefit, profile);
        const enriched = {
            ...benefit,
            ruleScore: score,
            verdict,
            ruleSummary: summary
        };
        if (verdict === 'likely') likely.push(enriched);
        else if (verdict === 'partial') partial.push(enriched);
        else unlikely.push(enriched);
    }
    // 점수 내림차순 정렬
    const sortFn = (a, b)=>b.ruleScore - a.ruleScore;
    likely.sort(sortFn);
    partial.sort(sortFn);
    unlikely.sort(sortFn);
    return {
        likely,
        partial,
        unlikely
    };
}
function getPersonalizedBenefits(benefits, profile) {
    if (!profile || !profile.birthYear || !profile.region) return benefits;
    return benefits.map((b)=>({
            benefit: b,
            score: computeRuleScore(b, profile).score
        })).filter((s)=>s.score > 20) // above base score
    .sort((a, b)=>b.score - a.score).map((s)=>s.benefit);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/TopBar.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "actionBtn": "TopBar-module__LYwH0W__actionBtn",
  "actions": "TopBar-module__LYwH0W__actions",
  "avatar": "TopBar-module__LYwH0W__avatar",
  "langText": "TopBar-module__LYwH0W__langText",
  "logo": "TopBar-module__LYwH0W__logo",
  "logoIcon": "TopBar-module__LYwH0W__logoIcon",
  "logoText": "TopBar-module__LYwH0W__logoText",
  "topBar": "TopBar-module__LYwH0W__topBar",
});
}),
"[project]/src/components/layout/TopBar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TopBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/components/layout/TopBar.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const BellIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 7,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M13.73 21a2 2 0 01-3.46 0"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 8,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/TopBar.tsx",
        lineNumber: 6,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c = BellIcon;
const SunIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "5"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 14,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "12",
                y1: "1",
                x2: "12",
                y2: "3"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 15,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "12",
                y1: "21",
                x2: "12",
                y2: "23"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 15,
                columnNumber: 42
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "4.22",
                y1: "4.22",
                x2: "5.64",
                y2: "5.64"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 16,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "18.36",
                y1: "18.36",
                x2: "19.78",
                y2: "19.78"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 16,
                columnNumber: 52
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "1",
                y1: "12",
                x2: "3",
                y2: "12"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 17,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "21",
                y1: "12",
                x2: "23",
                y2: "12"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 17,
                columnNumber: 42
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "4.22",
                y1: "19.78",
                x2: "5.64",
                y2: "18.36"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 18,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "18.36",
                y1: "5.64",
                x2: "19.78",
                y2: "4.22"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 18,
                columnNumber: 54
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/TopBar.tsx",
        lineNumber: 13,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c1 = SunIcon;
const MoonIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "18",
        height: "18",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            d: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        }, void 0, false, {
            fileName: "[project]/src/components/layout/TopBar.tsx",
            lineNumber: 24,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/layout/TopBar.tsx",
        lineNumber: 23,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c2 = MoonIcon;
function TopBar() {
    _s();
    const { t, theme, toggleTheme, lang, setLang, kakaoUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].topBar,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logo,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logoIcon,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BellIcon, {}, void 0, false, {
                            fileName: "[project]/src/components/layout/TopBar.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/TopBar.tsx",
                        lineNumber: 34,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logoText,
                        children: t.appName
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/TopBar.tsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actions,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionBtn,
                        onClick: ()=>setLang(lang === 'ko' ? 'en' : 'ko'),
                        "aria-label": "언어 전환",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].langText,
                            children: lang === 'ko' ? 'EN' : '한'
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/TopBar.tsx",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/TopBar.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actionBtn,
                        onClick: toggleTheme,
                        "aria-label": "테마 전환",
                        children: theme === 'light' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MoonIcon, {}, void 0, false, {
                            fileName: "[project]/src/components/layout/TopBar.tsx",
                            lineNumber: 54,
                            columnNumber: 32
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SunIcon, {}, void 0, false, {
                            fileName: "[project]/src/components/layout/TopBar.tsx",
                            lineNumber: 54,
                            columnNumber: 47
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/TopBar.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].avatar,
                        children: kakaoUser?.profile_image ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: kakaoUser.profile_image,
                            alt: "프로필",
                            style: {
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/TopBar.tsx",
                            lineNumber: 59,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: kakaoUser ? kakaoUser.nickname.charAt(0) : '👤'
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/TopBar.tsx",
                            lineNumber: 60,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/TopBar.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/TopBar.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/TopBar.tsx",
        lineNumber: 32,
        columnNumber: 5
    }, this);
}
_s(TopBar, "3GwR4u8z1etbNbxgX2lgaoLGHIs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"]
    ];
});
_c3 = TopBar;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "BellIcon");
__turbopack_context__.k.register(_c1, "SunIcon");
__turbopack_context__.k.register(_c2, "MoonIcon");
__turbopack_context__.k.register(_c3, "TopBar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/BottomNav.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "active": "BottomNav-module__ktzsLq__active",
  "label": "BottomNav-module__ktzsLq__label",
  "nav": "BottomNav-module__ktzsLq__nav",
  "tab": "BottomNav-module__ktzsLq__tab",
});
}),
"[project]/src/components/layout/BottomNav.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BottomNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/components/layout/BottomNav.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const HomeIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 10,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                points: "9 22 9 12 15 12 15 22"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 11,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 9,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c = HomeIcon;
const SearchIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "11",
                cy: "11",
                r: "8"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 17,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "21",
                y1: "21",
                x2: "16.65",
                y2: "16.65"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 17,
                columnNumber: 36
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 16,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c1 = SearchIcon;
const CalendarIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "3",
                y: "4",
                width: "18",
                height: "18",
                rx: "2",
                ry: "2"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 23,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "16",
                y1: "2",
                x2: "16",
                y2: "6"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 24,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "8",
                y1: "2",
                x2: "8",
                y2: "6"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 24,
                columnNumber: 42
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "3",
                y1: "10",
                x2: "21",
                y2: "10"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 25,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 22,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c2 = CalendarIcon;
const ProfileIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 31,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "7",
                r: "4"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 32,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 30,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c3 = ProfileIcon;
const AiIcon = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        width: "22",
        height: "22",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M9 18h6"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 38,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M10 22h4"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 39,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 2v1"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 40,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 7a4 4 0 014 4c0 1.5-.8 2.8-2 3.4V16H10v-1.6A4 4 0 018 11a4 4 0 014-4z"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 41,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M20 6l-1 1"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 42,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M4 6l1 1"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 43,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 37,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c4 = AiIcon;
/**
 * Unread notification badge.
 * SW push event stores a flag in localStorage: 'push_unread_count'
 * Cleared when user visits /profile or /ai page.
 */ function useUnreadBadge(pathname) {
    _s();
    const [unread, setUnread] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useUnreadBadge.useEffect": ()=>{
            function syncUnread() {
                try {
                    const count = parseInt(localStorage.getItem('push_unread_count') || '0', 10);
                    setUnread(isNaN(count) ? 0 : count);
                } catch  {}
            }
            syncUnread();
            window.addEventListener('push_unread_changed', syncUnread);
            return ({
                "useUnreadBadge.useEffect": ()=>window.removeEventListener('push_unread_changed', syncUnread)
            })["useUnreadBadge.useEffect"];
        }
    }["useUnreadBadge.useEffect"], []);
    // Clear badge when visiting home or profile
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useUnreadBadge.useEffect": ()=>{
            if (pathname === '/' || pathname === '/profile') {
                try {
                    localStorage.setItem('push_unread_count', '0');
                } catch  {}
                // Use callback to avoid synchronous setState in effect
                const clear = {
                    "useUnreadBadge.useEffect.clear": ()=>setUnread(0)
                }["useUnreadBadge.useEffect.clear"];
                const id = requestAnimationFrame(clear);
                return ({
                    "useUnreadBadge.useEffect": ()=>cancelAnimationFrame(id)
                })["useUnreadBadge.useEffect"];
            }
        }
    }["useUnreadBadge.useEffect"], [
        pathname
    ]);
    return unread;
}
_s(useUnreadBadge, "uQAohh5pE4AwQTfx+Atp2ZCbDrk=");
function BottomNav() {
    _s1();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const unread = useUnreadBadge(pathname);
    const tabs = [
        {
            href: '/',
            label: t.home,
            Icon: HomeIcon,
            badge: unread
        },
        {
            href: '/search',
            label: t.search,
            Icon: SearchIcon,
            badge: 0
        },
        {
            href: '/ai',
            label: t.aiRecommend,
            Icon: AiIcon,
            badge: 0
        },
        {
            href: '/calendar',
            label: t.calendar,
            Icon: CalendarIcon,
            badge: 0
        },
        {
            href: '/profile',
            label: t.myPage,
            Icon: ProfileIcon,
            badge: 0
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].nav,
        "aria-label": "메인 내비게이션",
        children: tabs.map(({ href, label, Icon, badge })=>{
            const active = pathname === href;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: href,
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tab} ${active ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].active : ''}`,
                "aria-current": active ? 'page' : undefined,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            position: 'relative',
                            display: 'inline-flex'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {}, void 0, false, {
                                fileName: "[project]/src/components/layout/BottomNav.tsx",
                                lineNumber: 103,
                                columnNumber: 15
                            }, this),
                            badge > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                "aria-label": `${badge}개 알림`,
                                style: {
                                    position: 'absolute',
                                    top: -4,
                                    right: -6,
                                    minWidth: 16,
                                    height: 16,
                                    borderRadius: 8,
                                    background: '#ef4444',
                                    color: '#fff',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0 3px',
                                    lineHeight: 1,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                },
                                children: badge > 9 ? '9+' : badge
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/BottomNav.tsx",
                                lineNumber: 105,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/layout/BottomNav.tsx",
                        lineNumber: 102,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/BottomNav.tsx",
                        lineNumber: 130,
                        columnNumber: 13
                    }, this)
                ]
            }, href, true, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 101,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, this);
}
_s1(BottomNav, "RGmZOQDGUvTRA49lh1fWRZcVaw0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        useUnreadBadge
    ];
});
_c5 = BottomNav;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "HomeIcon");
__turbopack_context__.k.register(_c1, "SearchIcon");
__turbopack_context__.k.register(_c2, "CalendarIcon");
__turbopack_context__.k.register(_c3, "ProfileIcon");
__turbopack_context__.k.register(_c4, "AiIcon");
__turbopack_context__.k.register(_c5, "BottomNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/ai/page.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "aiAvatar": "page-module__VqTRBa__aiAvatar",
  "aiIcon": "page-module__VqTRBa__aiIcon",
  "aiMessage": "page-module__VqTRBa__aiMessage",
  "aiMessageBubble": "page-module__VqTRBa__aiMessageBubble",
  "aiProgress": "page-module__VqTRBa__aiProgress",
  "aiProgressBar": "page-module__VqTRBa__aiProgressBar",
  "aiProgressFill": "page-module__VqTRBa__aiProgressFill",
  "aiProgressText": "page-module__VqTRBa__aiProgressText",
  "aiReason": "page-module__VqTRBa__aiReason",
  "benefitCard": "page-module__VqTRBa__benefitCard",
  "benefitList": "page-module__VqTRBa__benefitList",
  "cardAmount": "page-module__VqTRBa__cardAmount",
  "cardTitle": "page-module__VqTRBa__cardTitle",
  "cardTop": "page-module__VqTRBa__cardTop",
  "catBadge": "page-module__VqTRBa__catBadge",
  "charCount": "page-module__VqTRBa__charCount",
  "collapseToggle": "page-module__VqTRBa__collapseToggle",
  "ddayBadge": "page-module__VqTRBa__ddayBadge",
  "disclaimer": "page-module__VqTRBa__disclaimer",
  "errorBox": "page-module__VqTRBa__errorBox",
  "errorHint": "page-module__VqTRBa__errorHint",
  "exampleChip": "page-module__VqTRBa__exampleChip",
  "exampleList": "page-module__VqTRBa__exampleList",
  "examples": "page-module__VqTRBa__examples",
  "examplesTitle": "page-module__VqTRBa__examplesTitle",
  "fadeIn": "page-module__VqTRBa__fadeIn",
  "filterCard": "page-module__VqTRBa__filterCard",
  "filterCardAmount": "page-module__VqTRBa__filterCardAmount",
  "filterCardInfo": "page-module__VqTRBa__filterCardInfo",
  "filterCardMeta": "page-module__VqTRBa__filterCardMeta",
  "filterCardSummary": "page-module__VqTRBa__filterCardSummary",
  "filterCardTitle": "page-module__VqTRBa__filterCardTitle",
  "float": "page-module__VqTRBa__float",
  "groupCount": "page-module__VqTRBa__groupCount",
  "groupHeader": "page-module__VqTRBa__groupHeader",
  "groupIcon": "page-module__VqTRBa__groupIcon",
  "groupTitle": "page-module__VqTRBa__groupTitle",
  "header": "page-module__VqTRBa__header",
  "inputFooter": "page-module__VqTRBa__inputFooter",
  "inputSection": "page-module__VqTRBa__inputSection",
  "loadingState": "page-module__VqTRBa__loadingState",
  "main": "page-module__VqTRBa__main",
  "page": "page-module__VqTRBa__page",
  "profileCta": "page-module__VqTRBa__profileCta",
  "profileCtaBtn": "page-module__VqTRBa__profileCtaBtn",
  "profileCtaDesc": "page-module__VqTRBa__profileCtaDesc",
  "profileCtaIcon": "page-module__VqTRBa__profileCtaIcon",
  "profileCtaTitle": "page-module__VqTRBa__profileCtaTitle",
  "resetBtn": "page-module__VqTRBa__resetBtn",
  "resultCount": "page-module__VqTRBa__resultCount",
  "results": "page-module__VqTRBa__results",
  "scoreBadge": "page-module__VqTRBa__scoreBadge",
  "scoreCircle": "page-module__VqTRBa__scoreCircle",
  "scoreLabel": "page-module__VqTRBa__scoreLabel",
  "spin": "page-module__VqTRBa__spin",
  "spinner": "page-module__VqTRBa__spinner",
  "statCard": "page-module__VqTRBa__statCard",
  "statLabel": "page-module__VqTRBa__statLabel",
  "statNumber": "page-module__VqTRBa__statNumber",
  "statsRow": "page-module__VqTRBa__statsRow",
  "submitBtn": "page-module__VqTRBa__submitBtn",
  "subtitle": "page-module__VqTRBa__subtitle",
  "tabActive": "page-module__VqTRBa__tabActive",
  "tabBtn": "page-module__VqTRBa__tabBtn",
  "tabNav": "page-module__VqTRBa__tabNav",
  "textarea": "page-module__VqTRBa__textarea",
  "title": "page-module__VqTRBa__title",
});
}),
"[project]/src/app/ai/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AiPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/benefits.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$recommendation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/recommendation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/TopBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/BottomNav.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/app/ai/page.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
const EXAMPLE_PROMPTS_KO = [
    '40대 소상공인인데 임대료가 너무 부담돼요',
    '창업을 준비 중인 30대 예비창업자입니다',
    '가게 문을 닫아야 할 것 같아요. 폐업 지원이 있나요?',
    '빚이 너무 많아서 개인회생을 알아보고 있어요',
    '청년 창업 자금을 받을 수 있는지 알고 싶어요'
];
const EXAMPLE_PROMPTS_EN = [
    'I\'m in my 40s running a small business, rent is overwhelming',
    'I\'m a 30-year-old preparing to start a business',
    'I need to close my store. Is there closure support?',
    'I have too much debt and looking into personal rehabilitation',
    'I want to know if I can get youth startup funding'
];
// ─── Filter result card ───
function FilterCard({ benefit, lang }) {
    const isKo = lang === 'ko';
    const scoreColor = benefit.verdict === 'likely' ? '#15803d' : benefit.verdict === 'partial' ? '#92400e' : '#dc2626';
    const scoreBg = benefit.verdict === 'likely' ? '#dcfce7' : benefit.verdict === 'partial' ? '#fef3c7' : '#fee2e2';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        href: `/detail/${benefit.id}`,
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterCard,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterCardInfo,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterCardTitle,
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bText"])(benefit, 'title', lang)
                    }, void 0, false, {
                        fileName: "[project]/src/app/ai/page.tsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterCardAmount,
                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bText"])(benefit, 'amount', lang)
                    }, void 0, false, {
                        fileName: "[project]/src/app/ai/page.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterCardMeta,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "badge badge-coral-soft text-xs",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bText"])(benefit, 'categoryLabel', lang)
                            }, void 0, false, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            benefit.dDay >= 0 && benefit.dDay <= 14 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `badge ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDDayColor"])(benefit.dDay)} text-xs`,
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDDayText"])(benefit.dDay, isKo ? 'ko' : 'en')
                            }, void 0, false, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 51,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/ai/page.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    benefit.ruleSummary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].filterCardSummary,
                        children: [
                            "✨ ",
                            benefit.ruleSummary
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/ai/page.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/ai/page.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            benefit.ruleScore !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].scoreBadge,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].scoreCircle,
                        style: {
                            background: scoreBg,
                            color: scoreColor
                        },
                        children: [
                            benefit.ruleScore,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/ai/page.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].scoreLabel,
                        children: isKo ? '매칭' : 'Match'
                    }, void 0, false, {
                        fileName: "[project]/src/app/ai/page.tsx",
                        lineNumber: 65,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/ai/page.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/ai/page.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c = FilterCard;
function AiPage() {
    _s();
    const { t, lang, userProfile, benefits: allBenefits, kakaoUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('filter');
    const [showUnlikely, setShowUnlikely] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // ─── Tab 2: Chat state ───
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [chatLoading, setChatLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [chatResult, setChatResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [chatError, setChatError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [usageCount, setUsageCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [sharedId, setSharedId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const isKo = lang === 'ko';
    const hasProfile = !!(userProfile?.birthYear && userProfile?.region);
    // ─── Tab 1: 규칙 기반 즉시 계산 (API 호출 없음) ───
    const filtered = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AiPage.useMemo[filtered]": ()=>{
            if (!hasProfile || allBenefits.length === 0) return null;
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$recommendation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFilteredBenefits"])(allBenefits, userProfile);
        }
    }["AiPage.useMemo[filtered]"], [
        hasProfile,
        allBenefits,
        userProfile
    ]);
    // ─── Free usage tracking ───
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AiPage.useEffect": ()=>{
            if (!userProfile?.isPremium) {
                const today = new Date().toDateString();
                const usageStr = localStorage.getItem('ai_usage_limit');
                let usage = usageStr ? JSON.parse(usageStr) : {
                    date: today,
                    count: 0
                };
                if (usage.date !== today) usage = {
                    date: today,
                    count: 0
                };
                setUsageCount(usage.count);
            }
        }
    }["AiPage.useEffect"], [
        userProfile?.isPremium
    ]);
    // ─── Chat submit ───
    async function handleChatSubmit() {
        if (!input.trim() || chatLoading) return;
        if (!userProfile?.isPremium) {
            const today = new Date().toDateString();
            const usageStr = localStorage.getItem('ai_usage_limit');
            let usage = usageStr ? JSON.parse(usageStr) : {
                date: today,
                count: 0
            };
            if (usage.date !== today) usage = {
                date: today,
                count: 0
            };
            if (usage.count >= 10) {
                if (confirm(isKo ? '무료 제공량(일 10회)을 모두 소진했습니다.\n무제한 분석을 위해 프리미엄으로 업그레이드하시겠습니까?' : 'You have exhausted your free daily limit (10 times).\nWould you like to upgrade to Premium for unlimited analysis?')) {
                    window.location.href = '/premium';
                }
                return;
            }
            localStorage.setItem('ai_usage_limit', JSON.stringify({
                date: today,
                count: usage.count + 1
            }));
            setUsageCount(usage.count + 1);
        }
        setChatLoading(true);
        setChatResult(null);
        setChatError(null);
        try {
            const res = await fetch('/api/ai-recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userMessage: input.trim(),
                    lang
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'AI 서비스 오류');
            }
            setChatResult(await res.json());
        } catch (e) {
            setChatError(e instanceof Error ? e.message : 'Unknown error');
        } finally{
            setChatLoading(false);
        }
    }
    // ─── Web Share ───
    const handleShare = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AiPage.useCallback[handleShare]": async (benefitId, title)=>{
            const url = `${window.location.origin}/detail/${benefitId}`;
            const text = isKo ? `💡 ${title} — 혜택알리미에서 확인하세요!` : `💡 ${title} — Check on BenefitBell!`;
            if (navigator.share) {
                try {
                    await navigator.share({
                        title,
                        text,
                        url
                    });
                    setSharedId(benefitId);
                    setTimeout({
                        "AiPage.useCallback[handleShare]": ()=>setSharedId(null)
                    }["AiPage.useCallback[handleShare]"], 2500);
                } catch (err) {
                    if (err?.name !== 'AbortError') {
                        await navigator.clipboard?.writeText(url);
                        setSharedId(benefitId);
                        setTimeout({
                            "AiPage.useCallback[handleShare]": ()=>setSharedId(null)
                        }["AiPage.useCallback[handleShare]"], 2500);
                    }
                }
            } else {
                await navigator.clipboard?.writeText(url);
                setSharedId(benefitId);
                setTimeout({
                    "AiPage.useCallback[handleShare]": ()=>setSharedId(null)
                }["AiPage.useCallback[handleShare]"], 2500);
            }
        }
    }["AiPage.useCallback[handleShare]"], [
        isKo
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].page,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/ai/page.tsx",
                lineNumber: 171,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].main,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].header,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].aiIcon,
                                children: "🤖"
                            }, void 0, false, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 175,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].title,
                                children: isKo ? 'AI 맞춤 혜택' : 'AI Benefits'
                            }, void 0, false, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].subtitle,
                                children: isKo ? '내 프로필로 받을 수 있는 혜택을 자동으로 찾아드립니다' : 'Automatically find benefits that match your profile'
                            }, void 0, false, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/ai/page.tsx",
                        lineNumber: 174,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabNav,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabBtn} ${activeTab === 'filter' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabActive : ''}`,
                                onClick: ()=>setActiveTab('filter'),
                                children: [
                                    "🎯 ",
                                    isKo ? '내 맞춤 혜택' : 'My Benefits'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 188,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabBtn} ${activeTab === 'chat' ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tabActive : ''}`,
                                onClick: ()=>setActiveTab('chat'),
                                children: [
                                    "💬 ",
                                    isKo ? 'AI 상담' : 'AI Chat'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 194,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/ai/page.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this),
                    activeTab === 'filter' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: !hasProfile ? /* Profile CTA */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileCta,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileCtaIcon,
                                    children: "🎯"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/ai/page.tsx",
                                    lineNumber: 208,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileCtaTitle,
                                    children: isKo ? '30초 프로필 입력으로\nAI 맞춤 혜택을 발견하세요' : 'Enter your profile in 30 seconds\nto discover matching benefits'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/ai/page.tsx",
                                    lineNumber: 209,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileCtaDesc,
                                    children: isKo ? '나이, 지역, 소득 등을 입력하면 수백 개 혜택 중\n내가 받을 수 있는 것만 자동으로 골라드립니다' : 'Enter your age, region, income, and we\'ll\nautomatically filter matching benefits for you'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/ai/page.tsx",
                                    lineNumber: 212,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/profile",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileCtaBtn,
                                    children: isKo ? '📝 프로필 입력하기' : '📝 Enter Profile'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/ai/page.tsx",
                                    lineNumber: 217,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/ai/page.tsx",
                            lineNumber: 207,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                filtered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statsRow,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statCard,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statNumber,
                                                    style: {
                                                        color: '#15803d'
                                                    },
                                                    children: filtered.likely.length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 227,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statLabel,
                                                    children: isKo ? '✅ 수령 가능' : '✅ Eligible'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 228,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 226,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statCard,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statNumber,
                                                    style: {
                                                        color: '#92400e'
                                                    },
                                                    children: filtered.partial.length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 231,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statLabel,
                                                    children: isKo ? '⚠️ 확인 필요' : '⚠️ Check'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 232,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 230,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statCard,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statNumber,
                                                    style: {
                                                        color: '#9ca3af'
                                                    },
                                                    children: filtered.unlikely.length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 235,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].statLabel,
                                                    children: isKo ? '❌ 해당 안됨' : '❌ Unlikely'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 234,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/ai/page.tsx",
                                    lineNumber: 225,
                                    columnNumber: 19
                                }, this),
                                filtered && filtered.likely.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].groupHeader,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].groupIcon,
                                                    children: "✅"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 245,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].groupTitle,
                                                    children: isKo ? '수령 가능성 높음' : 'Likely Eligible'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 246,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].groupCount,
                                                    children: filtered.likely.length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 247,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 244,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].benefitList,
                                            children: filtered.likely.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterCard, {
                                                    benefit: b,
                                                    lang: lang
                                                }, b.id, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 49
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 249,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true),
                                filtered && filtered.partial.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].groupHeader,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].groupIcon,
                                                    children: "⚠️"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].groupTitle,
                                                    children: isKo ? '확인 필요' : 'Needs Review'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].groupCount,
                                                    children: filtered.partial.length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 261,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 258,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].benefitList,
                                            children: filtered.partial.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterCard, {
                                                    benefit: b,
                                                    lang: lang
                                                }, b.id, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 264,
                                                    columnNumber: 50
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 263,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true),
                                filtered && filtered.unlikely.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].collapseToggle,
                                            onClick: ()=>setShowUnlikely(!showUnlikely),
                                            children: showUnlikely ? isKo ? `▲ 해당 안됨 ${filtered.unlikely.length}건 접기` : `▲ Hide ${filtered.unlikely.length} unlikely` : isKo ? `▼ 해당 안됨 ${filtered.unlikely.length}건 보기` : `▼ Show ${filtered.unlikely.length} unlikely`
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 272,
                                            columnNumber: 21
                                        }, this),
                                        showUnlikely && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].benefitList,
                                            style: {
                                                marginTop: 12,
                                                opacity: 0.65
                                            },
                                            children: filtered.unlikely.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterCard, {
                                                    benefit: b,
                                                    lang: lang
                                                }, b.id, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 279,
                                                    columnNumber: 53
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 278,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true),
                                filtered && filtered.likely.length === 0 && filtered.partial.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        textAlign: 'center',
                                        padding: '40px 20px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                fontSize: 48,
                                                marginBottom: 12
                                            },
                                            children: "🔍"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 288,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 15,
                                                fontWeight: 700,
                                                color: 'var(--text-primary)',
                                                marginBottom: 8
                                            },
                                            children: isKo ? '현재 프로필로 매칭되는 혜택이 없습니다' : 'No matching benefits for your profile'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 289,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: 13,
                                                color: 'var(--text-secondary)',
                                                marginBottom: 20,
                                                lineHeight: 1.5
                                            },
                                            children: isKo ? '프로필 정보를 추가하면 더 정확한 결과를 받을 수 있어요' : 'Add more profile info for better results'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 292,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/profile",
                                            className: "btn btn-outline",
                                            style: {
                                                textDecoration: 'none'
                                            },
                                            children: isKo ? '프로필 수정하기' : 'Edit Profile'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/ai/page.tsx",
                                            lineNumber: 295,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/ai/page.tsx",
                                    lineNumber: 287,
                                    columnNumber: 19
                                }, this),
                                filtered && (filtered.likely.length > 0 || filtered.partial.length > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].disclaimer,
                                    style: {
                                        marginTop: 20
                                    },
                                    children: isKo ? '⚠️ 자동 매칭 결과는 참고용이며 법적 효력이 없습니다. 정확한 자격 판단은 해당 기관에 문의하세요.' : '⚠️ Matching results are for reference only. Contact the relevant agency for accurate eligibility.'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/ai/page.tsx",
                                    lineNumber: 303,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false),
                    activeTab === 'chat' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputSection,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].textarea,
                                        value: input,
                                        onChange: (e)=>setInput(e.target.value),
                                        placeholder: isKo ? '예: 40대 자영업자, 코로나 이후 매출이 절반으로 줄었어요. 운전자금이 필요한데 어떤 지원이 있나요?' : 'e.g. I\'m a self-employed person in my 40s. Revenue dropped by half since COVID. What support is available?',
                                        rows: 4,
                                        maxLength: 500,
                                        onKeyDown: (e)=>{
                                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleChatSubmit();
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 318,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputFooter,
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: '12px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].charCount,
                                                children: [
                                                    input.length,
                                                    "/500"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/ai/page.tsx",
                                                lineNumber: 332,
                                                columnNumber: 17
                                            }, this),
                                            !userProfile?.isPremium && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "badge badge-coral-soft",
                                                children: isKo ? `무료 ${10 - usageCount}회 남음` : `${10 - usageCount} free left`
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/ai/page.tsx",
                                                lineNumber: 334,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].submitBtn,
                                                onClick: handleChatSubmit,
                                                disabled: !input.trim() || chatLoading,
                                                id: "ai-submit-btn",
                                                children: chatLoading ? isKo ? 'AI 분석 중...' : 'AI analyzing...' : isKo ? '🔍 혜택 찾기' : '🔍 Find Benefits'
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/ai/page.tsx",
                                                lineNumber: 338,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 331,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 317,
                                columnNumber: 13
                            }, this),
                            !chatResult && !chatLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].examples,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].examplesTitle,
                                        children: [
                                            "💡 ",
                                            isKo ? '이렇게 물어보세요' : 'Try asking'
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 354,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].exampleList,
                                        children: (isKo ? EXAMPLE_PROMPTS_KO : EXAMPLE_PROMPTS_EN).map((ex, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].exampleChip,
                                                onClick: ()=>setInput(ex),
                                                id: `ai-example-${i}`,
                                                children: ex
                                            }, i, false, {
                                                fileName: "[project]/src/app/ai/page.tsx",
                                                lineNumber: 357,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 355,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 353,
                                columnNumber: 15
                            }, this),
                            chatLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].loadingState,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].spinner
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 368,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: isKo ? 'AI가 혜택 데이터베이스를 분석하고 있어요...' : 'AI is analyzing the benefits database...'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 369,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 367,
                                columnNumber: 15
                            }, this),
                            chatError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorBox,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: [
                                        "⚠️ ",
                                        isKo ? 'AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.' : 'AI analysis failed. Please try again later.'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/ai/page.tsx",
                                    lineNumber: 376,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 375,
                                columnNumber: 15
                            }, this),
                            chatResult && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].results,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].aiMessage,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].aiAvatar,
                                                children: "🤖"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/ai/page.tsx",
                                                lineNumber: 384,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].aiMessageBubble,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: chatResult.message
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/ai/page.tsx",
                                                    lineNumber: 386,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/ai/page.tsx",
                                                lineNumber: 385,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 383,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resultCount,
                                        children: isKo ? `${chatResult.benefitIds.length}개의 맞춤 혜택을 찾았어요` : `Found ${chatResult.benefitIds.length} matching benefits`
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 390,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].benefitList,
                                        children: chatResult.benefitIds.map((id)=>{
                                            const benefit = allBenefits.find((b)=>b.id === id);
                                            const reason = chatResult.reasons[id];
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].benefitCard,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].cardTop,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "badge badge-coral-soft",
                                                                style: {
                                                                    fontSize: 11
                                                                },
                                                                children: benefit ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bText"])(benefit, 'categoryLabel', lang) : '🔎'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/ai/page.tsx",
                                                                lineNumber: 403,
                                                                columnNumber: 27
                                                            }, this),
                                                            benefit?.dDay !== undefined && benefit.dDay >= 0 && benefit.dDay <= 30 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "badge",
                                                                style: {
                                                                    fontSize: 11,
                                                                    color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDDayColor"])(benefit.dDay)
                                                                },
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDDayText"])(benefit.dDay, isKo ? 'ko' : 'en')
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/ai/page.tsx",
                                                                lineNumber: 407,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                style: {
                                                                    marginLeft: 'auto',
                                                                    background: sharedId === id ? 'rgba(16,185,129,0.12)' : 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: 16,
                                                                    padding: '2px 6px',
                                                                    borderRadius: 8,
                                                                    color: sharedId === id ? '#10b981' : 'var(--text-secondary)',
                                                                    transition: 'all 0.2s'
                                                                },
                                                                onClick: ()=>benefit && handleShare(id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bText"])(benefit, 'title', lang)),
                                                                "aria-label": isKo ? '공유하기' : 'Share',
                                                                children: sharedId === id ? '✅' : '📤'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/ai/page.tsx",
                                                                lineNumber: 411,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/ai/page.tsx",
                                                        lineNumber: 402,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: `/detail/${id}`,
                                                        style: {
                                                            textDecoration: 'none',
                                                            display: 'block'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].cardTitle,
                                                                children: benefit ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bText"])(benefit, 'title', lang) : id
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/ai/page.tsx",
                                                                lineNumber: 420,
                                                                columnNumber: 27
                                                            }, this),
                                                            benefit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].cardAmount,
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bText"])(benefit, 'amount', lang)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/ai/page.tsx",
                                                                lineNumber: 421,
                                                                columnNumber: 39
                                                            }, this),
                                                            reason && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].aiReason,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "✨"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/ai/page.tsx",
                                                                        lineNumber: 424,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        children: reason
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/ai/page.tsx",
                                                                        lineNumber: 425,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/ai/page.tsx",
                                                                lineNumber: 423,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                style: {
                                                                    fontSize: 12,
                                                                    color: 'var(--accent)',
                                                                    marginTop: 8,
                                                                    fontWeight: 600
                                                                },
                                                                children: isKo ? '자세히 보기 →' : 'View details →'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/ai/page.tsx",
                                                                lineNumber: 428,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/ai/page.tsx",
                                                        lineNumber: 419,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, id, true, {
                                                fileName: "[project]/src/app/ai/page.tsx",
                                                lineNumber: 401,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 396,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].disclaimer,
                                        children: isKo ? '⚠️ AI 분석 결과는 참고용이며 법적 효력이 없습니다. 정확한 자격 판단은 해당 기관에 문의하세요.' : '⚠️ AI recommendations are for reference only. Contact the relevant agency for accurate eligibility.'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 437,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ai$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resetBtn,
                                        onClick: ()=>{
                                            setChatResult(null);
                                            setInput('');
                                        },
                                        children: isKo ? '다시 검색하기' : 'Search Again'
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/ai/page.tsx",
                                        lineNumber: 443,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/ai/page.tsx",
                                lineNumber: 382,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/ai/page.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/ai/page.tsx",
                lineNumber: 451,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/ai/page.tsx",
        lineNumber: 170,
        columnNumber: 5
    }, this);
}
_s(AiPage, "cYgsLTfImQLPtRuI6VMwVNiLtSU=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"]
    ];
});
_c1 = AiPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "FilterCard");
__turbopack_context__.k.register(_c1, "AiPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_70cf40e6._.js.map