(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/firebase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getFirebaseApp",
    ()=>getFirebaseApp,
    "getFirebaseAuth",
    ()=>getFirebaseAuth,
    "getFirebaseDb",
    ()=>getFirebaseDb,
    "getFirebaseMessaging",
    ()=>getFirebaseMessaging,
    "isFirebaseReady",
    ()=>isFirebaseReady
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
// Firebase Client SDK (브라우저 전용)
// FishLog fish-log/src/lib/firebase.ts 패턴 기반
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$messaging$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/messaging/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$messaging$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/messaging/dist/esm/index.esm.js [app-client] (ecmascript)");
;
;
;
;
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyD661gFi59xD6kDYcbqpr4XOghQtGX9_JI"),
    authDomain: ("TURBOPACK compile-time value", "ai-project-ce41f.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "ai-project-ce41f"),
    storageBucket: ("TURBOPACK compile-time value", "ai-project-ce41f.firebasestorage.app"),
    messagingSenderId: ("TURBOPACK compile-time value", "287186253524"),
    appId: ("TURBOPACK compile-time value", "1:287186253524:web:98d9a50c0d48dabafa2d41")
};
function isConfigured() {
    return !!firebaseConfig.apiKey && !!firebaseConfig.projectId;
}
let app = null;
let authInstance = null;
let dbInstance = null;
function getApp() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
     // SSR safety
    if (!isConfigured()) return null;
    if (!app) {
        app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApps"])().length === 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApps"])()[0];
    }
    return app;
}
function getFirebaseAuth() {
    if (authInstance) return authInstance;
    const a = getApp();
    if (!a) return null;
    authInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuth"])(a);
    return authInstance;
}
function getFirebaseDb() {
    if (dbInstance) return dbInstance;
    const a = getApp();
    if (!a) return null;
    dbInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirestore"])(a);
    return dbInstance;
}
let messagingInstance = null;
function getFirebaseApp() {
    return getApp();
}
function getFirebaseMessaging() {
    if (messagingInstance) return messagingInstance;
    const a = getApp();
    if (!a) return null;
    messagingInstance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$messaging$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMessaging"])(a);
    return messagingInstance;
}
function isFirebaseReady() {
    return ("TURBOPACK compile-time value", "object") !== 'undefined' && isConfigured();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppProvider",
    ()=>AppProvider,
    "translations",
    ()=>translations,
    "useApp",
    ()=>useApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
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
        aiRecommend: 'AI 상담',
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
        maritalStatus: '결혼 여부',
        single: '미혼',
        married: '기혼',
        divorced: '이혼/사별',
        hasChildren: '자녀 여부',
        noChildren: '자녀 없음',
        yesChildren: '자녀 있음',
        childrenCount: '자녀 수',
        childrenAgeGroup: '자녀 연령대',
        infant: '영유아 (0~6세)',
        elementary: '초등학생 (7~12세)',
        teen: '중고등학생 (13~18세)',
        isPregnant: '임신 여부',
        pregnant: '임신 중',
        notPregnant: '해당없음',
        isBasicLivingRecipient: '기초수급 여부',
        basicRecipient: '기초수급자',
        notBasicRecipient: '해당없음',
        healthInsuranceType: '건강보험 유형',
        employedInsurance: '직장가입자',
        regionalInsurance: '지역가입자',
        medicalAid: '의료급여',
        unknownInsurance: '잘 모르겠음',
        disabilityGrade: '장애 등급',
        noDisability: '해당없음',
        mildDisability: '경증 (구 4~6급)',
        severeDisability: '중증 (구 1~3급)',
        specialStatus: '특이사항',
        disability: '장애',
        singleParent: '한부모',
        multicultural: '다문화',
        veteran: '국가유공자',
        businessInfo: '사업자 정보',
        isBusinessOwner: '사업자 여부',
        yesBusinessOwner: '사업자입니다',
        noBusinessOwner: '아닙니다',
        businessType: '사업 형태',
        individualBiz: '개인사업자',
        corporationBiz: '법인사업자',
        businessAge: '업력',
        bizUnder1: '1년 미만',
        biz1to3: '1~3년',
        biz3to7: '3~7년',
        bizOver7: '7년 이상',
        annualRevenue: '연매출',
        revUnder1: '1억 미만',
        rev1to3: '1~3억',
        rev3to10: '3~10억',
        revOver10: '10억 이상',
        employeeCount: '종업원 수',
        solo: '1인 (나만)',
        under5: '5인 미만',
        under10: '5~10인',
        over10: '10인 이상',
        industryType: '업종',
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
        aiRecommend: 'AI Chat',
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
        maritalStatus: 'Marital Status',
        single: 'Single',
        married: 'Married',
        divorced: 'Divorced/Widowed',
        hasChildren: 'Children',
        noChildren: 'No Children',
        yesChildren: 'Has Children',
        childrenCount: 'Number of Children',
        childrenAgeGroup: 'Children Age Group',
        infant: 'Infant (0-6)',
        elementary: 'Elementary (7-12)',
        teen: 'Teen (13-18)',
        isPregnant: 'Pregnancy',
        pregnant: 'Pregnant',
        notPregnant: 'Not Applicable',
        isBasicLivingRecipient: 'Basic Living Recipient',
        basicRecipient: 'Recipient',
        notBasicRecipient: 'Not Applicable',
        healthInsuranceType: 'Health Insurance',
        employedInsurance: 'Employed',
        regionalInsurance: 'Regional',
        medicalAid: 'Medical Aid',
        unknownInsurance: 'Not Sure',
        disabilityGrade: 'Disability Grade',
        noDisability: 'None',
        mildDisability: 'Mild',
        severeDisability: 'Severe',
        specialStatus: 'Special Status',
        disability: 'Disability',
        singleParent: 'Single Parent',
        multicultural: 'Multicultural',
        veteran: 'Veteran',
        businessInfo: 'Business Info',
        isBusinessOwner: 'Business Owner',
        yesBusinessOwner: 'Yes, I am',
        noBusinessOwner: 'No',
        businessType: 'Business Type',
        individualBiz: 'Sole Proprietor',
        corporationBiz: 'Corporation',
        businessAge: 'Business Age',
        bizUnder1: 'Under 1 year',
        biz1to3: '1-3 years',
        biz3to7: '3-7 years',
        bizOver7: 'Over 7 years',
        annualRevenue: 'Annual Revenue',
        revUnder1: 'Under ₩100M',
        rev1to3: '₩100M-300M',
        rev3to10: '₩300M-1B',
        revOver10: 'Over ₩1B',
        employeeCount: 'Employees',
        solo: 'Solo',
        under5: 'Under 5',
        under10: '5-10',
        over10: 'Over 10',
        industryType: 'Industry',
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
    // Step 1
    name: '',
    birthYear: 0,
    gender: 'male',
    region: '',
    householdSize: 1,
    incomePercent: 50,
    housingType: 'monthly',
    employmentStatus: 'jobSeeking',
    // Step 2
    maritalStatus: 'single',
    hasChildren: false,
    childrenCount: 0,
    childrenAgeGroup: [],
    isPregnant: false,
    // Step 3
    isBasicLivingRecipient: false,
    healthInsuranceType: 'unknown',
    disabilityGrade: 'none',
    specialStatus: [],
    // Step 4
    isBusinessOwner: false,
    businessType: 'none',
    businessAge: 'none',
    annualRevenue: 'none',
    employeeCount: 'none',
    industryType: '',
    // 시스템
    kakaoAlerts: true,
    alertDays: [
        7,
        3
    ],
    isPremium: false
};
const AppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function AppProvider({ children }) {
    _s();
    const [lang, setLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AppProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem('lang') ?? 'ko';
        }
    }["AppProvider.useState"]);
    const [theme, setTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AppProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return localStorage.getItem('theme') ?? 'light';
        }
    }["AppProvider.useState"]);
    const [bookmarks, setBookmarks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AppProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                const saved = localStorage.getItem('bookmarks');
                return saved ? JSON.parse(saved) : [];
            } catch  {
                return [];
            }
        }
    }["AppProvider.useState"]);
    const [userProfile, setUserProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AppProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                const saved = localStorage.getItem('userProfile');
                return saved ? JSON.parse(saved) : defaultProfile;
            } catch  {
                return defaultProfile;
            }
        }
    }["AppProvider.useState"]);
    const [kakaoUser, setKakaoUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "AppProvider.useState": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            try {
                const value = `; ${document.cookie}`;
                const parts = value.split('; kakao_profile=');
                if (parts.length === 2) {
                    const raw = decodeURIComponent(parts.pop()?.split(';').shift() || '');
                    if (raw) {
                        const data = JSON.parse(raw);
                        if (data.name) return {
                            id: data.id,
                            nickname: data.name,
                            profile_image: data.profile_image
                        };
                    }
                }
            } catch  {}
            return null;
        }
    }["AppProvider.useState"]);
    const [benefits, setBenefits] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [benefitsLoading, setBenefitsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // ─── 공통: Firestore 프로필 복원 함수 ───
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const restoreProfileFromApi = async (kakaoId)=>{
        try {
            const res = await fetch(`/api/user/profile?kakaoId=${kakaoId}`);
            if (!res.ok) return false;
            const json = await res.json();
            if (!json.data) return false;
            const d = json.data;
            // 프로필 복원 (Firestore에 저장된 값이 있는 필드만)
            setUserProfile((prev)=>({
                    ...prev,
                    // Step 1: 기본
                    ...d.name ? {
                        name: d.name
                    } : {},
                    ...d.birthYear != null ? {
                        birthYear: d.birthYear
                    } : {},
                    ...d.gender ? {
                        gender: d.gender
                    } : {},
                    ...d.region ? {
                        region: d.region
                    } : {},
                    ...d.householdSize != null ? {
                        householdSize: d.householdSize
                    } : {},
                    ...d.incomePercent != null ? {
                        incomePercent: d.incomePercent
                    } : {},
                    ...d.housingType ? {
                        housingType: d.housingType
                    } : {},
                    ...d.employmentStatus ? {
                        employmentStatus: d.employmentStatus
                    } : {},
                    // Step 2: 가족
                    ...d.maritalStatus ? {
                        maritalStatus: d.maritalStatus
                    } : {},
                    ...d.hasChildren != null ? {
                        hasChildren: d.hasChildren
                    } : {},
                    ...d.childrenCount != null ? {
                        childrenCount: d.childrenCount
                    } : {},
                    ...d.childrenAgeGroup?.length ? {
                        childrenAgeGroup: d.childrenAgeGroup
                    } : {},
                    ...d.isPregnant != null ? {
                        isPregnant: d.isPregnant
                    } : {},
                    // Step 3: 상세
                    ...d.isBasicLivingRecipient != null ? {
                        isBasicLivingRecipient: d.isBasicLivingRecipient
                    } : {},
                    ...d.healthInsuranceType ? {
                        healthInsuranceType: d.healthInsuranceType
                    } : {},
                    ...d.disabilityGrade ? {
                        disabilityGrade: d.disabilityGrade
                    } : {},
                    ...d.specialStatus?.length ? {
                        specialStatus: d.specialStatus
                    } : {},
                    // Step 4: 사업자
                    ...d.isBusinessOwner != null ? {
                        isBusinessOwner: d.isBusinessOwner
                    } : {},
                    ...d.businessType && d.businessType !== 'none' ? {
                        businessType: d.businessType
                    } : {},
                    ...d.businessAge && d.businessAge !== 'none' ? {
                        businessAge: d.businessAge
                    } : {},
                    ...d.annualRevenue && d.annualRevenue !== 'none' ? {
                        annualRevenue: d.annualRevenue
                    } : {},
                    ...d.employeeCount && d.employeeCount !== 'none' ? {
                        employeeCount: d.employeeCount
                    } : {},
                    ...d.industryType ? {
                        industryType: d.industryType
                    } : {},
                    // 시스템
                    ...d.kakaoAlerts != null ? {
                        kakaoAlerts: d.kakaoAlerts
                    } : {},
                    ...d.alertDays?.length ? {
                        alertDays: d.alertDays
                    } : {},
                    isPremium: !!d.isPremium
                }));
            // 북마크 복원
            if (d.bookmarks?.length) {
                setBookmarks((prev)=>{
                    const merged = [
                        ...new Set([
                            ...prev,
                            ...d.bookmarks
                        ])
                    ];
                    return merged;
                });
            }
            // 푸시 카테고리 복원
            if (d.categories?.length) {
                try {
                    const local = JSON.parse(localStorage.getItem('push_categories') || '[]');
                    if (!local.length) {
                        localStorage.setItem('push_categories', JSON.stringify(d.categories));
                    }
                } catch  {}
            }
            return true;
        } catch (e) {
            console.warn('[context] restoreProfileFromApi failed:', e);
            return false;
        }
    };
    // Global benefits fetch (single load, shared across all pages)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            fetch('/api/benefits').then({
                "AppProvider.useEffect": (r)=>r.json()
            }["AppProvider.useEffect"]).then({
                "AppProvider.useEffect": (json)=>{
                    if (json.data) setBenefits(json.data.filter({
                        "AppProvider.useEffect": (b)=>b.status !== 'closed'
                    }["AppProvider.useEffect"]));
                }
            }["AppProvider.useEffect"]).catch({
                "AppProvider.useEffect": (err)=>console.error('Global benefits fetch failed:', err)
            }["AppProvider.useEffect"]).finally({
                "AppProvider.useEffect": ()=>setBenefitsLoading(false)
            }["AppProvider.useEffect"]);
        }
    }["AppProvider.useEffect"], []);
    // Firebase Custom Token 감지 → signInWithCustomToken (카카오 로그인 직후)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            const token = document.cookie.split('; ').find({
                "AppProvider.useEffect": (r)=>r.startsWith('firebase_custom_token=')
            }["AppProvider.useEffect"])?.split('=')[1];
            if (!token) return;
            // 즉시 쿠키 삭제 (1회성 소비)
            document.cookie = 'firebase_custom_token=; path=/; max-age=0';
            const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirebaseAuth"])();
            if (!auth) return;
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signInWithCustomToken"])(auth, token).catch({
                "AppProvider.useEffect": (err)=>console.warn('[firebase] signInWithCustomToken failed:', err)
            }["AppProvider.useEffect"]);
        }
    }["AppProvider.useEffect"], []);
    // Firebase Auth 상태 감지 → Firestore에서 프로필 복원 (경로 1)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirebaseAuth"])();
            if (!auth) return;
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(auth, {
                "AppProvider.useEffect.unsubscribe": async (firebaseUser)=>{
                    if (!firebaseUser) return;
                    const kakaoId = firebaseUser.uid.replace('kakao_', '');
                    await restoreProfileFromApi(kakaoId);
                }
            }["AppProvider.useEffect.unsubscribe"]);
            return ({
                "AppProvider.useEffect": ()=>unsubscribe()
            })["AppProvider.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["AppProvider.useEffect"], []);
    // ★ Kakao 쿠키 기반 프로필 직접 로드 (경로 2 — Firebase Auth 실패 fallback)
    // kakaoUser.id가 있으면 Firebase Auth 무관하게 즉시 Firestore에서 프로필 로드
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            if (!kakaoUser?.id) return;
            // 즉시 로드 — Firebase Auth보다 빠름 (signInWithCustomToken 대기 불필요)
            restoreProfileFromApi(String(kakaoUser.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["AppProvider.useEffect"], [
        kakaoUser?.id
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
    }["AppProvider.useEffect"], [
        theme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            localStorage.setItem('lang', lang);
        }
    }["AppProvider.useEffect"], [
        lang
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            // Firestore에도 북마크 동기화 (로그인 상태일 때만, 디바운스)
            if (kakaoUser?.id) {
                const timer = setTimeout({
                    "AppProvider.useEffect.timer": ()=>{
                        fetch('/api/user/profile', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                kakaoId: String(kakaoUser.id),
                                bookmarks
                            })
                        }).catch({
                            "AppProvider.useEffect.timer": ()=>{}
                        }["AppProvider.useEffect.timer"]);
                    }
                }["AppProvider.useEffect.timer"], 1000) // 1초 디바운스
                ;
                return ({
                    "AppProvider.useEffect": ()=>clearTimeout(timer)
                })["AppProvider.useEffect"];
            }
        }
    }["AppProvider.useEffect"], [
        bookmarks,
        kakaoUser
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AppProvider.useEffect": ()=>{
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        }
    }["AppProvider.useEffect"], [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AppContext.Provider, {
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
            setKakaoUser,
            benefits,
            benefitsLoading
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/context.tsx",
        lineNumber: 690,
        columnNumber: 5
    }, this);
}
_s(AppProvider, "a2aJguLc+GCViYFGC6YF6zpV6Jk=");
_c = AppProvider;
function useApp() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
_s1(useApp, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "AppProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/analytics/GoogleAnalytics.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>GoogleAnalytics,
    "trackEvent",
    ()=>trackEvent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/script.js [app-client] (ecmascript)");
'use client';
;
;
const GA_ID = ("TURBOPACK compile-time value", "G-P74F814W2D");
function GoogleAnalytics() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
                strategy: "afterInteractive"
            }, void 0, false, {
                fileName: "[project]/src/components/analytics/GoogleAnalytics.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
_c = GoogleAnalytics;
function trackEvent(eventName, params) {
    if (("TURBOPACK compile-time value", "object") !== 'undefined' && 'gtag' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.gtag('event', eventName, params);
    }
}
var _c;
__turbopack_context__.k.register(_c, "GoogleAnalytics");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/pwa/PushMessageReceiver.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PushMessageReceiver
]);
/**
 * PushMessageReceiver
 *
 * Listens for Service Worker postMessage events (type: 'PUSH_RECEIVED')
 * and increments the push_unread_count in localStorage,
 * then dispatches a custom event so BottomNav updates without page reload.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
function PushMessageReceiver() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PushMessageReceiver.useEffect": ()=>{
            function handleMessage(event) {
                if (event.data?.type === 'PUSH_RECEIVED') {
                    try {
                        const current = parseInt(localStorage.getItem('push_unread_count') || '0', 10);
                        localStorage.setItem('push_unread_count', String(current + 1));
                        window.dispatchEvent(new Event('push_unread_changed'));
                    } catch  {}
                }
            }
            navigator.serviceWorker?.addEventListener('message', handleMessage);
            return ({
                "PushMessageReceiver.useEffect": ()=>navigator.serviceWorker?.removeEventListener('message', handleMessage)
            })["PushMessageReceiver.useEffect"];
        }
    }["PushMessageReceiver.useEffect"], []);
    return null // no UI
    ;
}
_s(PushMessageReceiver, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = PushMessageReceiver;
var _c;
__turbopack_context__.k.register(_c, "PushMessageReceiver");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_8d23a28b._.js.map