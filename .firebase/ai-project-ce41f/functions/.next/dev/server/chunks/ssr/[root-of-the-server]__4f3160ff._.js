module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/src/lib/firebase.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getFirebaseAuth",
    ()=>getFirebaseAuth,
    "getFirebaseDb",
    ()=>getFirebaseDb,
    "isFirebaseReady",
    ()=>isFirebaseReady
]);
// Firebase Client SDK (브라우저 전용)
// FishLog fish-log/src/lib/firebase.ts 패턴 기반
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
;
;
;
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyAtIjBHT25aZEc8VVnGiUo4wU_OwcWXkIs"),
    authDomain: ("TURBOPACK compile-time value", "benefitbell-565b2.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "benefitbell-565b2"),
    storageBucket: ("TURBOPACK compile-time value", "benefitbell-565b2.firebasestorage.app"),
    messagingSenderId: ("TURBOPACK compile-time value", "441975360101"),
    appId: ("TURBOPACK compile-time value", "1:441975360101:web:e6bcb0728d9bb003a4948c")
};
function isConfigured() {
    return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
}
let app = null;
let authInstance = null;
let dbInstance = null;
function getApp() {
    if ("TURBOPACK compile-time truthy", 1) return null // SSR safety
    ;
    //TURBOPACK unreachable
    ;
}
function getFirebaseAuth() {
    if (authInstance) return authInstance;
    const a = getApp();
    if (!a) return null;
    authInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuth"])(a);
    return authInstance;
}
function getFirebaseDb() {
    if (dbInstance) return dbInstance;
    const a = getApp();
    if (!a) return null;
    dbInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirestore"])(a);
    return dbInstance;
}
function isFirebaseReady() {
    return ("TURBOPACK compile-time value", "undefined") !== 'undefined' && isConfigured();
}
}),
"[project]/src/lib/context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "translations",
    ()=>translations,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
const translations = {
    ko: {
        // App
        appName: '혜택알리미',
        appTagline: '나에게 맞는 혜택, 한눈에',
        // Nav
        home: '홈',
        search: '검색',
        calendar: '캘린더',
        myPage: '마이페이지',
        aiRecommend: 'AI추천',
        // Home
        greeting: (name)=>`안녕하세요, ${name}님 👋`,
        guestGreeting: '혜택을 찾아드릴게요! 👋',
        urgentSubtitle: (count)=>`맞춤 혜택 ${count}건이 곧 마감됩니다!`,
        urgentBenefits: '마감 임박 혜택',
        viewAll: '전체보기',
        categories: '카테고리',
        popularBenefits: '🔥 인기 혜택 TOP 5',
        now: '실시간',
        // Categories
        basicLiving: '기초생활수급',
        nearPoverty: '차상위계층',
        youth: '청년 지원',
        middleAged: '장년 지원',
        senior: '노인 복지',
        housing: '주거 지원',
        medical: '의료 지원',
        education: '교육 지원',
        employment: '취업 지원',
        allCategories: '전체',
        // Search
        searchPlaceholder: '혜택 이름으로 검색하세요',
        searchByCategory: '카테고리별 찾기',
        detailFilter: '상세 필터',
        sortByPopular: '인기순',
        sortByDeadline: '마감임박순',
        sortByNew: '신규',
        recentSearches: '최근 검색어',
        clearAll: '전체삭제',
        recommendedTags: '추천 검색어',
        whoForBenefit: '누구를 위한 혜택인가요?',
        frequentlySearched: '자주 찾는 혜택',
        resetFilter: '필터 초기화',
        // Personas
        youngAdult: '청년',
        middleAge: '중장년',
        olderAdult: '어르신',
        // Calendar
        benefitCalendar: '혜택 캘린더',
        benefitsOnDate: (date)=>`${date} 마감 혜택`,
        noBenefits: '해당 날짜에 마감되는 혜택이 없습니다.',
        urgentBannerTitle: (count)=>`${count}개 혜택 마감 임박!`,
        urgentBannerSub: (name, extra)=>`${name} 외 ${extra}건 — 놓치지 마세요`,
        calMonthTitle: (year, month)=>`${year}년 ${month}월`,
        calHint: '마감일 기준으로 표시됩니다',
        calDayNames: [
            '일',
            '월',
            '화',
            '수',
            '목',
            '금',
            '토'
        ],
        monthlyDeadlineTitle: (month, count)=>`📋 ${month}월 마감 혜택 (${count}건)`,
        noMonthlyDeadline: '이번 달 마감 혜택이 없습니다',
        alwaysOpenTitle: (count)=>`🟢 상시 신청 가능 (${count}건)`,
        alwaysOpenBadge: '상시',
        showMoreBenefits: (count)=>`+${count}건 더 보기 →`,
        deadlineLabel: '마감',
        calLoading: '캘린더 데이터를 불러오는 중...',
        // Detail
        benefitDetail: '혜택 상세',
        mainInfo: '주요 정보',
        appPeriod: '신청기간',
        targetPerson: '대상',
        incomeLevel: '소득기준',
        paymentMethod: '지급방식',
        monthlyTransfer: '매월 계좌이체',
        myEligibility: '나의 자격 확인',
        eligibilityCheck: (fulfilled, total)=>`자격 조건 ${fulfilled}/${total} 충족`,
        howToApply: '신청 방법',
        requiredDocuments: '필요 서류',
        kakaoAlert: '카카오톡 알림 설정',
        applyNow: '신청하러 가기',
        pass: '충족',
        fail: '확인 필요',
        // Profile
        myProfile: '내 프로필',
        editProfile: '프로필 수정',
        myInfo: '나의 정보 설정',
        birthDate: '생년월일',
        gender: '성별',
        male: '남성',
        female: '여성',
        region: '거주지역',
        householdSize: '가구원 수',
        incomeRatio: '소득분위',
        housingType: '주거형태',
        monthly: '월세',
        deposit: '전세',
        owned: '자가',
        employmentStatus: '고용상태',
        jobSeeking: '구직중',
        employed: '재직중',
        selfEmployed: '자영업',
        student: '학생',
        specialStatus: '특이사항',
        disability: '장애',
        singleParent: '한부모',
        multicultural: '다문화',
        veteran: '국가유공자',
        notificationSettings: '알림 설정',
        kakaoNotification: '카카오톡 알림',
        notifyBefore: '알림 시점',
        personalizedRec: '맞춤 혜택 추천',
        saveSettings: '설정 저장하기 🔔',
        saved: '저장되었습니다!',
        // Premium
        premium: '프리미엄',
        premiumFeatures: '광고 제거 + 14일 전 알림 + 맞춤 상담',
        perMonth: '월',
        subscribe: '구독하기',
        currentPlan: '현재 무료 플랜',
        comingSoon: '준비 중 🔜',
        // Support
        coffeeSupport: '커피 한 잔 사주기 ☕',
        supportDesc: '이 앱이 도움이 되셨나요? 개발자에게 커피 한 잔을 선물해주세요!',
        // Common
        close: '닫기',
        confirm: '확인',
        cancel: '취소',
        loading: '불러오는 중...',
        newBadge: '신규',
        deadline: '신청기간',
        amount: '지원금액',
        bookmark: '저장',
        bookmarked: '저장됨',
        darkMode: '다크모드',
        lightMode: '라이트모드',
        language: '언어',
        dayUnit: '인 가구',
        medianIncome: '중위소득',
        underPercent: (pct)=>`${pct}% 이하`
    },
    en: {
        appName: 'BenefitBell',
        appTagline: 'Your personalized benefit alerts',
        home: 'Home',
        search: 'Search',
        calendar: 'Calendar',
        myPage: 'My Page',
        aiRecommend: 'AI',
        greeting: (name)=>`Hello, ${name}! 👋`,
        guestGreeting: 'Find your benefits! 👋',
        urgentSubtitle: (count)=>`${count} of your benefits are closing soon!`,
        urgentBenefits: 'Closing Soon',
        viewAll: 'See All',
        categories: 'Categories',
        popularBenefits: '🔥 Top 5 Popular',
        now: 'Live',
        basicLiving: 'Basic Living',
        nearPoverty: 'Near Poverty',
        youth: 'Youth',
        middleAged: 'Middle-Aged',
        senior: 'Senior',
        housing: 'Housing',
        medical: 'Medical',
        education: 'Education',
        employment: 'Employment',
        allCategories: 'All',
        searchPlaceholder: 'Search for benefits',
        searchByCategory: 'Browse by Category',
        detailFilter: 'Filters',
        sortByPopular: 'Popular',
        sortByDeadline: 'Closing Soon',
        sortByNew: 'New',
        recentSearches: 'Recent Searches',
        clearAll: 'Clear All',
        recommendedTags: 'Recommended',
        whoForBenefit: 'Who needs the benefit?',
        frequentlySearched: 'Frequently Searched',
        resetFilter: 'Reset Filters',
        youngAdult: 'Youth',
        middleAge: 'Middle-Aged',
        olderAdult: 'Senior',
        benefitCalendar: 'Benefit Calendar',
        benefitsOnDate: (date)=>`Deadlines on ${date}`,
        noBenefits: 'No benefits closing on this date.',
        urgentBannerTitle: (count)=>`${count} benefit(s) closing soon!`,
        urgentBannerSub: (name, extra)=>`${name} and ${extra} more — don't miss out`,
        calMonthTitle: (year, month)=>{
            const months = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ];
            return `${months[month - 1]} ${year}`;
        },
        calHint: 'Sorted by deadline',
        calDayNames: [
            'Sun',
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat'
        ],
        monthlyDeadlineTitle: (month, count)=>{
            const months = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ];
            return `📋 ${months[month - 1]} Deadlines (${count})`;
        },
        noMonthlyDeadline: 'No deadlines this month',
        alwaysOpenTitle: (count)=>`🟢 Always Open (${count})`,
        alwaysOpenBadge: 'Open',
        showMoreBenefits: (count)=>`+${count} more →`,
        deadlineLabel: 'Deadline',
        calLoading: 'Loading calendar...',
        benefitDetail: 'Benefit Detail',
        mainInfo: 'Key Information',
        appPeriod: 'Application Period',
        targetPerson: 'Target',
        incomeLevel: 'Income Level',
        paymentMethod: 'Payment Method',
        monthlyTransfer: 'Monthly Bank Transfer',
        myEligibility: 'My Eligibility Check',
        eligibilityCheck: (fulfilled, total)=>`${fulfilled}/${total} Conditions Met`,
        howToApply: 'How to Apply',
        requiredDocuments: 'Required Documents',
        kakaoAlert: 'Set KakaoTalk Alert',
        applyNow: 'Apply Now',
        pass: 'Pass',
        fail: 'Check Needed',
        myProfile: 'My Profile',
        editProfile: 'Edit Profile',
        myInfo: 'My Information',
        birthDate: 'Birth Date',
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        region: 'Region',
        householdSize: 'Household Size',
        incomeRatio: 'Income Level',
        housingType: 'Housing Type',
        monthly: 'Monthly Rent',
        deposit: 'Jeonse',
        owned: 'Owned',
        employmentStatus: 'Employment',
        jobSeeking: 'Job Seeking',
        employed: 'Employed',
        selfEmployed: 'Self-Employed',
        student: 'Student',
        specialStatus: 'Special Status',
        disability: 'Disability',
        singleParent: 'Single Parent',
        multicultural: 'Multicultural',
        veteran: 'Veteran',
        notificationSettings: 'Notifications',
        kakaoNotification: 'KakaoTalk Alerts',
        notifyBefore: 'Alert Timing',
        personalizedRec: 'Personalized Picks',
        saveSettings: 'Save Settings 🔔',
        saved: 'Saved!',
        premium: 'Premium',
        premiumFeatures: 'No Ads + 14-day Early Alerts + Personalized Advice',
        perMonth: '/mo',
        subscribe: 'Subscribe',
        currentPlan: 'Free Plan',
        comingSoon: 'Coming Soon 🔜',
        coffeeSupport: 'Buy Me a Coffee ☕',
        supportDesc: 'Found this app helpful? Support the developer with a coffee!',
        close: 'Close',
        confirm: 'Confirm',
        cancel: 'Cancel',
        loading: 'Loading...',
        newBadge: 'NEW',
        deadline: 'Deadline',
        amount: 'Amount',
        bookmark: 'Save',
        bookmarked: 'Saved',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        language: 'Language',
        dayUnit: '-person household',
        medianIncome: 'median income',
        underPercent: (pct)=>`Under ${pct}%`
    }
};
const defaultProfile = {
    name: '',
    birthYear: 1995,
    gender: 'male',
    region: '서울특별시 강남구',
    householdSize: 1,
    incomePercent: 50,
    housingType: 'monthly',
    employmentStatus: 'jobSeeking',
    specialStatus: [],
    kakaoAlerts: true,
    alertDays: [
        7,
        3
    ],
    isPremium: false
};
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function AppProvider({ children }) {
    const [lang, setLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('ko');
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('light');
    const [bookmarks, setBookmarks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [userProfile, setUserProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultProfile);
    const [kakaoUser, setKakaoUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const savedTheme = localStorage.getItem('theme');
        const savedLang = localStorage.getItem('lang');
        const savedBookmarks = localStorage.getItem('bookmarks');
        const savedProfile = localStorage.getItem('userProfile');
        if (savedTheme) setTheme(savedTheme);
        if (savedLang) setLang(savedLang);
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
        if (savedProfile) setUserProfile(JSON.parse(savedProfile));
        // Load kakao user from cookie (set by /api/auth/kakao/callback)
        const getCookie = (name)=>{
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
            return null;
        };
        const kakaoProfileCookie = getCookie('kakao_profile');
        if (kakaoProfileCookie) {
            try {
                const data = JSON.parse(kakaoProfileCookie);
                if (data.name) {
                    setKakaoUser({
                        id: data.id,
                        nickname: data.name,
                        profile_image: data.profile_image
                    });
                }
            } catch (e) {
                console.error('Failed to parse kakao_profile cookie', e);
            }
        }
    }, []);
    // Firebase Custom Token 감지 → signInWithCustomToken (카카오 로그인 직후)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const token = document.cookie.split('; ').find((r)=>r.startsWith('firebase_custom_token='))?.split('=')[1];
        if (!token) return;
        // 즉시 쿠키 삭제 (1회성 소비)
        document.cookie = 'firebase_custom_token=; path=/; max-age=0';
        const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])();
        if (!auth) return;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signInWithCustomToken"])(auth, token).catch((err)=>console.warn('[firebase] signInWithCustomToken failed:', err));
    }, []);
    // Firebase Auth 상태 감지 → Firestore에서 premium 조회
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseAuth"])();
        if (!auth) {
            // Firebase 미설정 — kakaoUser.id로 Supabase 방식 fallback 없음, 그냥 skip
            return;
        }
        const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(auth, async (firebaseUser)=>{
            if (!firebaseUser) return;
            try {
                const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getFirebaseDb"])();
                if (!db) return;
                const kakaoId = firebaseUser.uid.replace('kakao_', '');
                const userDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(db, 'users', kakaoId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserProfile((prev)=>({
                            ...prev,
                            isPremium: !!data.is_premium
                        }));
                }
            } catch (e) {
                console.warn('[firebase] Firestore premium check failed:', e);
            }
        });
        return ()=>unsubscribe();
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [
        theme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('lang', lang);
    }, [
        lang
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }, [
        bookmarks
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }, [
        userProfile
    ]);
    const toggleTheme = ()=>setTheme((t)=>t === 'light' ? 'dark' : 'light');
    const toggleBookmark = (id)=>{
        setBookmarks((prev)=>prev.includes(id) ? prev.filter((b)=>b !== id) : [
                ...prev,
                id
            ]);
    };
    const isBookmarked = (id)=>bookmarks.includes(id);
    const t = translations[lang];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
        value: {
            lang,
            setLang,
            t,
            theme,
            toggleTheme,
            bookmarks,
            toggleBookmark,
            isBookmarked,
            userProfile,
            setUserProfile,
            kakaoUser,
            setKakaoUser
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/context.tsx",
        lineNumber: 457,
        columnNumber: 5
    }, this);
}
function useApp() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
}),
"[project]/src/components/analytics/GoogleAnalytics.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GoogleAnalytics,
    "trackEvent",
    ()=>trackEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/script.js [app-ssr] (ecmascript)");
'use client';
;
;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
function GoogleAnalytics() {
    if (!GA_ID) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
                strategy: "afterInteractive"
            }, void 0, false, {
                fileName: "[project]/src/components/analytics/GoogleAnalytics.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "google-analytics",
                strategy: "afterInteractive",
                children: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `
            }, void 0, false, {
                fileName: "[project]/src/components/analytics/GoogleAnalytics.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
function trackEvent(eventName, params) {
    if (("TURBOPACK compile-time value", "undefined") !== 'undefined' && 'gtag' in window) //TURBOPACK unreachable
    ;
}
}),
"[project]/src/components/pwa/InstallBanner.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "actions": "InstallBanner-module__YT1LzW__actions",
  "banner": "InstallBanner-module__YT1LzW__banner",
  "content": "InstallBanner-module__YT1LzW__content",
  "desc": "InstallBanner-module__YT1LzW__desc",
  "dismissBtn": "InstallBanner-module__YT1LzW__dismissBtn",
  "icon": "InstallBanner-module__YT1LzW__icon",
  "installBtn": "InstallBanner-module__YT1LzW__installBtn",
  "title": "InstallBanner-module__YT1LzW__title",
  "visible": "InstallBanner-module__YT1LzW__visible",
});
}),
"[project]/src/components/pwa/InstallBanner.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InstallBanner
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/components/pwa/InstallBanner.module.css [app-ssr] (css module)");
'use client';
;
;
;
function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [show, setShow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [platform, setPlatform] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dismissed, setDismissed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Already in standalone mode (already installed)
        if (window.matchMedia('(display-mode: standalone)').matches) return;
        // Already dismissed
        if (localStorage.getItem('pwa-banner-dismissed') === 'true') return;
        // iOS detection
        const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (isIOS && isSafari) {
            setPlatform('ios');
            setTimeout(()=>setShow(true), 3000);
            return;
        }
        // Android / Chrome: listen for beforeinstallprompt
        const handler = (e)=>{
            e.preventDefault();
            setDeferredPrompt(e);
            setPlatform('android');
            // Show banner after 3 seconds
            setTimeout(()=>setShow(true), 3000);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return ()=>window.removeEventListener('beforeinstallprompt', handler);
    }, []);
    const handleInstall = async ()=>{
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShow(false);
        }
        setDeferredPrompt(null);
    };
    const handleDismiss = ()=>{
        setShow(false);
        setDismissed(true);
        localStorage.setItem('pwa-banner-dismissed', 'true');
    };
    if (!show || dismissed) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].banner} ${show ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].visible : ''}`,
        role: "dialog",
        "aria-label": "앱 설치 안내",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].icon,
                children: "📲"
            }, void 0, false, {
                fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].content,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].title,
                        children: "홈 화면에 추가하기"
                    }, void 0, false, {
                        fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    platform === 'ios' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].desc,
                        children: [
                            "Safari 하단 ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "공유 버튼 →"
                            }, void 0, false, {
                                fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                                lineNumber: 69,
                                columnNumber: 23
                            }, this),
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: "홈 화면에 추가"
                            }, void 0, false, {
                                fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                                lineNumber: 69,
                                columnNumber: 48
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                        lineNumber: 68,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].desc,
                        children: "앱처럼 빠르게 · 알림 받기 · 오프라인 지원"
                    }, void 0, false, {
                        fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].actions,
                children: [
                    platform === 'android' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        id: "pwa-install-btn",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].installBtn,
                        onClick: handleInstall,
                        children: "설치"
                    }, void 0, false, {
                        fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                        lineNumber: 77,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        id: "pwa-dismiss-btn",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$pwa$2f$InstallBanner$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].dismissBtn,
                        onClick: handleDismiss,
                        "aria-label": "닫기",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                        lineNumber: 81,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/pwa/InstallBanner.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/pwa/InstallBanner.tsx",
        lineNumber: 63,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4f3160ff._.js.map