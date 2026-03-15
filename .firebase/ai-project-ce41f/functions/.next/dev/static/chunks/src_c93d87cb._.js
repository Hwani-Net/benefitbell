(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/welfare-api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateDDay",
    ()=>calculateDDay,
    "fetchWelfareDetail",
    ()=>fetchWelfareDetail,
    "fetchWelfareList",
    ()=>fetchWelfareList,
    "transformDetailToBenefit",
    ()=>transformDetailToBenefit,
    "transformListItemToBenefit",
    ()=>transformListItemToBenefit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * Welfare API client — fetches real data from data.go.kr
 * 한국사회보장정보원 중앙부처 복지서비스 API
 */ const BASE_URL = 'http://apis.data.go.kr/B554287/NationalWelfareInformationsV001';
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
async function fetchWelfareList(pageNo = 1, numOfRows = 100) {
    const serviceKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.DATA_GO_KR_SERVICE_KEY;
    if (!serviceKey) {
        console.warn('[welfare-api] DATA_GO_KR_SERVICE_KEY not set');
        return [];
    }
    const url = `${BASE_URL}/NationalWelfarelistV001?serviceKey=${encodeURIComponent(serviceKey)}&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;
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
        const data = await res.json();
        const items = data?.response?.body?.items?.item;
        if (!items) return [];
        return Array.isArray(items) ? items : [
            items
        ];
    } catch (err) {
        console.error('[welfare-api] List fetch error:', err);
        return [];
    }
}
async function fetchWelfareDetail(servId) {
    const serviceKey = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.DATA_GO_KR_SERVICE_KEY;
    if (!serviceKey) return null;
    const url = `${BASE_URL}/NationalWelfaredetailedV001?serviceKey=${encodeURIComponent(serviceKey)}&servId=${servId}&_type=json`;
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
        new: false
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/data/benefits.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// 혜택 데이터 타입 정의 및 모의 데이터
__turbopack_context__.s([
    "BENEFITS",
    ()=>BENEFITS,
    "CATEGORY_INFO",
    ()=>CATEGORY_INFO,
    "getAllBenefitsLive",
    ()=>getAllBenefitsLive,
    "getBenefitById",
    ()=>getBenefitById,
    "getBenefitsByCategory",
    ()=>getBenefitsByCategory,
    "getDDayColor",
    ()=>getDDayColor,
    "getDDayText",
    ()=>getDDayText,
    "getPopularBenefits",
    ()=>getPopularBenefits,
    "getUrgentBenefits",
    ()=>getUrgentBenefits
]);
// Helper functions
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/welfare-api.ts [app-client] (ecmascript)");
const BENEFITS = [
    {
        id: 'youth-rent',
        title: '2026 청년 월세 지원금',
        titleEn: '2026 Youth Monthly Rent Support',
        category: 'youth',
        categoryLabel: '청년 지원',
        categoryLabelEn: 'Youth Support',
        amount: '월 최대 20만원 (최대 12개월)',
        amountEn: 'Up to ₩200,000/month (max 12 months)',
        description: '무주택 청년의 주거비 부담 완화를 위한 월세 지원 혜택입니다.',
        descriptionEn: 'Monthly rent support to ease housing costs for homeless youth.',
        targetAge: '만 19~34세',
        incomeLevel: '중위소득 60% 이하',
        applicationStart: '2026.02.01',
        applicationEnd: '2026.02.28',
        dDay: 3,
        status: 'open',
        applyUrl: 'https://www.bokjiro.go.kr',
        ministry: '국토교통부',
        ministryEn: 'Ministry of Land',
        steps: [
            {
                title: '복지로 접속',
                titleEn: 'Visit Bokjiro',
                desc: '복지로 웹사이트 또는 앱에 접속합니다.',
                descEn: 'Go to bokjiro.go.kr or the Bokjiro app.'
            },
            {
                title: '본인인증',
                titleEn: 'Identity Verification',
                desc: '공동인증서 또는 간편인증으로 본인인증합니다.',
                descEn: 'Verify identity via certificate or easy-auth.'
            },
            {
                title: '신청서 작성',
                titleEn: 'Fill Application',
                desc: '주소, 소득정보, 임대차계약 정보를 입력합니다.',
                descEn: 'Enter address, income, and lease info.'
            },
            {
                title: '서류 첨부',
                titleEn: 'Attach Documents',
                desc: '필요서류를 스캔하여 업로드합니다.',
                descEn: 'Scan and upload required documents.'
            }
        ],
        documents: [
            '주민등록등본',
            '소득확인증명서',
            '임대차계약서',
            '통장 사본'
        ],
        documentsEn: [
            'Resident Registration',
            'Income Certificate',
            'Lease Contract',
            'Bank Account Copy'
        ],
        eligibilityChecks: [
            {
                label: '나이 조건 (만 19~34세)',
                labelEn: 'Age (19-34)',
                pass: true
            },
            {
                label: '소득 조건 (중위소득 60% 이하)',
                labelEn: 'Income (≤60% median)',
                pass: true
            },
            {
                label: '무주택 확인 필요',
                labelEn: 'No Home Ownership Required',
                pass: false
            }
        ],
        popular: true
    },
    {
        id: 'basic-livelihood',
        title: '기초생활수급자 생계급여',
        titleEn: 'Basic Livelihood Benefit',
        category: 'basic-living',
        categoryLabel: '기초생활수급',
        categoryLabelEn: 'Basic Living',
        amount: '4인 가구 기준 최대 183만원/월',
        amountEn: 'Up to ₩1,830,000/month for 4-person household',
        description: '생활이 어려운 저소득층의 기본적인 생활을 보장하는 급여입니다.',
        descriptionEn: 'Basic living allowance for low-income households.',
        incomeLevel: '중위소득 30% 이하',
        applicationStart: '2026.01.01',
        applicationEnd: '2026.03.31',
        dDay: 37,
        status: 'open',
        applyUrl: 'https://www.bokjiro.go.kr',
        ministry: '보건복지부',
        ministryEn: 'Ministry of Health',
        steps: [
            {
                title: '주민센터 방문',
                titleEn: 'Visit Community Center',
                desc: '거주지 관할 주민센터를 방문합니다.',
                descEn: 'Visit your local community center.'
            },
            {
                title: '신청서 제출',
                titleEn: 'Submit Application',
                desc: '사회보장급여신청서를 작성하여 제출합니다.',
                descEn: 'Fill and submit the social security application.'
            },
            {
                title: '자산·소득 조사',
                titleEn: 'Asset/Income Survey',
                desc: '담당자가 가구 자산 및 소득을 조사합니다.',
                descEn: 'Staff investigates household assets and income.'
            },
            {
                title: '결정 통보',
                titleEn: 'Decision Notice',
                desc: '약 30일 내 수급자 결정 통보를 받습니다.',
                descEn: 'Receive decision notice within ~30 days.'
            }
        ],
        documents: [
            '주민등록등본',
            '가족관계증명서',
            '금융정보 동의서',
            '소득재산신고서'
        ],
        documentsEn: [
            'Resident Registration',
            'Family Certificate',
            'Financial Info Consent',
            'Income Declaration'
        ],
        eligibilityChecks: [
            {
                label: '소득인정액 기준 충족',
                labelEn: 'Income Threshold Met',
                pass: true
            },
            {
                label: '부양의무자 기준 확인 필요',
                labelEn: 'Support Obligation Check Needed',
                pass: false
            }
        ],
        popular: true
    },
    {
        id: 'near-poverty-medical',
        title: '차상위 의료비 지원',
        titleEn: 'Near-Poverty Medical Cost Support',
        category: 'near-poverty',
        categoryLabel: '차상위계층',
        categoryLabelEn: 'Near Poverty',
        amount: '연 최대 100만원',
        amountEn: 'Up to ₩1,000,000/year',
        description: '차상위계층의 과도한 의료비 부담을 줄이기 위한 지원 사업입니다.',
        descriptionEn: 'Medical cost support for near-poverty households.',
        incomeLevel: '중위소득 50% 이하',
        applicationStart: '2026.01.15',
        applicationEnd: '2026.03.15',
        dDay: 14,
        status: 'open',
        applyUrl: 'https://www.bokjiro.go.kr',
        ministry: '보건복지부',
        ministryEn: 'Ministry of Health',
        steps: [
            {
                title: '주민센터 신청',
                titleEn: 'Apply at Community Center',
                desc: '거주지 주민센터에 방문하여 신청합니다.',
                descEn: 'Visit your community center to apply.'
            },
            {
                title: '서류 제출',
                titleEn: 'Submit Documents',
                desc: '필요서류를 준비하여 제출합니다.',
                descEn: 'Prepare and submit required documents.'
            },
            {
                title: '심사',
                titleEn: 'Review',
                desc: '자격 요건 심사가 진행됩니다.',
                descEn: 'Eligibility review process.'
            },
            {
                title: '지원 결정',
                titleEn: 'Support Decision',
                desc: '지원 여부 및 금액이 결정됩니다.',
                descEn: 'Support amount and eligibility determined.'
            }
        ],
        documents: [
            '주민등록등본',
            '의료비 영수증',
            '소득확인서'
        ],
        documentsEn: [
            'Resident Registration',
            'Medical Receipts',
            'Income Certificate'
        ],
        eligibilityChecks: [
            {
                label: '차상위계층 해당',
                labelEn: 'Near-Poverty Status',
                pass: true
            },
            {
                label: '의료비 신청 요건',
                labelEn: 'Medical Eligibility',
                pass: true
            },
            {
                label: '최근 6개월 의료비 내역',
                labelEn: '6-Month Medical History Needed',
                pass: false
            }
        ]
    },
    {
        id: 'parent-allowance',
        title: '부모 급여 (만 0~1세)',
        titleEn: 'Parental Allowance (Ages 0-1)',
        category: 'basic-living',
        categoryLabel: '기초생활수급',
        categoryLabelEn: 'Basic Living',
        amount: '월 최대 100만원',
        amountEn: 'Up to ₩1,000,000/month',
        description: '출산 및 양육을 지원하기 위한 부모 급여입니다.',
        descriptionEn: 'Monthly allowance for parents with infants 0-1 years old.',
        applicationStart: '2026.01.01',
        applicationEnd: '2026.12.31',
        dDay: 300,
        status: 'open',
        applyUrl: 'https://www.bokjiro.go.kr',
        ministry: '보건복지부',
        ministryEn: 'Ministry of Health',
        steps: [
            {
                title: '복지로 or 앱 접속',
                titleEn: 'Visit Bokjiro or App',
                desc: '복지로, 정부24, 주민센터 중 선택합니다.',
                descEn: 'Choose Bokjiro, Gov24, or Community Center.'
            },
            {
                title: '자녀 정보 입력',
                titleEn: 'Enter Child Info',
                desc: '자녀의 생년월일 등을 입력합니다.',
                descEn: 'Enter child\'s birth date and info.'
            },
            {
                title: '계좌 등록',
                titleEn: 'Register Bank Account',
                desc: '급여를 받을 계좌를 등록합니다.',
                descEn: 'Register bank account for deposit.'
            },
            {
                title: '신청 완료',
                titleEn: 'Application Complete',
                desc: '매월 25일 지급됩니다.',
                descEn: 'Paid on the 25th of every month.'
            }
        ],
        documents: [
            '출생증명서 or 주민등록등본',
            '부모 신분증'
        ],
        documentsEn: [
            'Birth Certificate or Resident Registration',
            'Parent ID'
        ],
        eligibilityChecks: [
            {
                label: '만 0~1세 자녀 보유',
                labelEn: 'Child age 0-1',
                pass: true
            },
            {
                label: '국내 거주 중인 대한민국 국민',
                labelEn: 'Korean Resident',
                pass: true
            }
        ],
        popular: true,
        new: true
    },
    {
        id: 'senior-basic-pension',
        title: '노인 기초연금',
        titleEn: 'Senior Basic Pension',
        category: 'senior',
        categoryLabel: '노인 복지',
        categoryLabelEn: 'Senior Welfare',
        amount: '월 최대 33만 4천원',
        amountEn: 'Up to ₩334,000/month',
        description: '65세 이상 어르신의 안정적인 노후를 지원하는 기초연금입니다.',
        descriptionEn: 'Monthly pension for elderly aged 65 and over.',
        targetAge: '만 65세 이상',
        incomeLevel: '소득 하위 70%',
        applicationStart: '2026.01.01',
        applicationEnd: '2026.12.31',
        dDay: 300,
        status: 'open',
        applyUrl: 'https://www.bokjiro.go.kr',
        ministry: '보건복지부',
        ministryEn: 'Ministry of Health',
        steps: [
            {
                title: '주민센터 방문 or 온라인',
                titleEn: 'Visit Center or Online',
                desc: '주민센터 방문 또는 복지로에서 신청합니다.',
                descEn: 'Apply at community center or Bokjiro.'
            },
            {
                title: '소득·재산 확인',
                titleEn: 'Income/Asset Check',
                desc: '소득 및 재산 조회가 진행됩니다.',
                descEn: 'Income and asset review.'
            },
            {
                title: '결정 통보',
                titleEn: 'Decision',
                desc: '약 30일 내 지급 여부 결정됩니다.',
                descEn: 'Decision made within ~30 days.'
            }
        ],
        documents: [
            '신분증',
            '통장 사본'
        ],
        documentsEn: [
            'ID Card',
            'Bank Account Copy'
        ],
        eligibilityChecks: [
            {
                label: '만 65세 이상',
                labelEn: 'Age 65+',
                pass: true
            },
            {
                label: '소득 하위 70% 해당',
                labelEn: 'Bottom 70% Income',
                pass: true
            }
        ],
        popular: true
    },
    {
        id: 'youth-employment',
        title: '청년 도약계좌',
        titleEn: 'Youth Leap Account',
        category: 'youth',
        categoryLabel: '청년 지원',
        categoryLabelEn: 'Youth Support',
        amount: '월 최대 70만원 납입 → 5년 후 최대 5천만원',
        amountEn: 'Up to ₩700,000/month → Max ₩50M after 5 years',
        description: '청년의 자산 형성을 돕기 위한 정부 지원 적금 상품입니다.',
        descriptionEn: 'Government-supported savings account for youth asset building.',
        targetAge: '만 19~34세',
        incomeLevel: '총급여 7,500만원 이하',
        applicationStart: '2026.02.15',
        applicationEnd: '2026.03.14',
        dDay: 7,
        status: 'open',
        applyUrl: 'https://www.youthaccount.go.kr',
        ministry: '금융위원회',
        ministryEn: 'Financial Services Commission',
        steps: [
            {
                title: '은행 앱에서 신청',
                titleEn: 'Apply via Bank App',
                desc: '참여 은행 앱에서 청년도약계좌를 신청합니다.',
                descEn: 'Apply through participating bank apps.'
            },
            {
                title: '소득 확인',
                titleEn: 'Income Verification',
                desc: '국세청 소득 자료 조회 동의 후 확인합니다.',
                descEn: 'Consent to NTS income data inquiry.'
            },
            {
                title: '계좌 개설',
                titleEn: 'Account Opening',
                desc: '심사 통과 후 계좌가 개설됩니다.',
                descEn: 'Account opened after approval.'
            },
            {
                title: '납입 시작',
                titleEn: 'Start Deposits',
                desc: '매월 납입하면 정부기여금이 지급됩니다.',
                descEn: 'Monthly deposit with government contribution.'
            }
        ],
        documents: [
            '신분증',
            '소득 확인 서류'
        ],
        documentsEn: [
            'ID Card',
            'Income Documents'
        ],
        eligibilityChecks: [
            {
                label: '나이 (만 19~34세)',
                labelEn: 'Age 19-34',
                pass: true
            },
            {
                label: '총급여 7,500만원 이하',
                labelEn: 'Income ≤ ₩75M',
                pass: true
            },
            {
                label: '직전년도 금융소득 2,000만원 이하',
                labelEn: 'Financial Income ≤ ₩20M',
                pass: true
            }
        ],
        new: true
    },
    {
        id: 'k-pass',
        title: 'K-패스 교통비 환급',
        titleEn: 'K-Pass Transit Refund',
        category: 'youth',
        categoryLabel: '청년 지원',
        categoryLabelEn: 'Youth Support',
        amount: '대중교통비 월 최대 53% 환급',
        amountEn: 'Up to 53% monthly transit refund',
        description: '대중교통을 월 15회 이상 이용 시 교통비를 환급해주는 혜택입니다.',
        descriptionEn: 'Refund transit costs when using public transport 15+ times/month.',
        applicationStart: '2026.01.01',
        applicationEnd: '2026.12.31',
        dDay: 300,
        status: 'open',
        applyUrl: 'https://k-pass.kr',
        ministry: '국토교통부',
        ministryEn: 'Ministry of Land',
        steps: [
            {
                title: 'K-패스 앱 다운로드',
                titleEn: 'Download K-Pass App',
                desc: 'K-패스 앱을 설치합니다.',
                descEn: 'Install the K-Pass app.'
            },
            {
                title: '회원가입',
                titleEn: 'Sign Up',
                desc: '본인인증 후 회원가입합니다.',
                descEn: 'Sign up with identity verification.'
            },
            {
                title: 'K-패스 카드 발급',
                titleEn: 'Get K-Pass Card',
                desc: '연계 카드사에서 K-패스 카드를 발급받습니다.',
                descEn: 'Get K-Pass card from partner card company.'
            },
            {
                title: '환급 수령',
                titleEn: 'Receive Refund',
                desc: '월 15회 이상 이용 시 다음달 환급됩니다.',
                descEn: 'Refund received next month after 15+ uses.'
            }
        ],
        documents: [
            '본인 명의 카드'
        ],
        documentsEn: [
            'Personal Credit/Debit Card'
        ],
        eligibilityChecks: [
            {
                label: '대한민국 국민',
                labelEn: 'Korean Citizen',
                pass: true
            },
            {
                label: '월 15회 이상 이용',
                labelEn: '15+ Monthly Uses',
                pass: true
            }
        ],
        popular: true
    },
    {
        id: 'disability-allowance',
        title: '장애인 연금',
        titleEn: 'Disability Pension',
        category: 'basic-living',
        categoryLabel: '기초생활수급',
        categoryLabelEn: 'Basic Living',
        amount: '월 최대 42만 4천원',
        amountEn: 'Up to ₩424,000/month',
        description: '18세 이상 중증장애인의 소득을 보전하기 위한 연금입니다.',
        descriptionEn: 'Monthly pension for severely disabled persons aged 18+.',
        targetAge: '만 18세 이상',
        incomeLevel: '소득 하위 70%',
        applicationStart: '2026.01.01',
        applicationEnd: '2026.12.31',
        dDay: 300,
        status: 'open',
        applyUrl: 'https://www.bokjiro.go.kr',
        ministry: '보건복지부',
        ministryEn: 'Ministry of Health',
        steps: [
            {
                title: '주민센터 방문',
                titleEn: 'Visit Community Center',
                desc: '거주지 주민센터를 방문합니다.',
                descEn: 'Visit your local community center.'
            },
            {
                title: '장애정도 확인',
                titleEn: 'Disability Level Check',
                desc: '중증장애인 여부가 확인됩니다.',
                descEn: 'Severity of disability is verified.'
            },
            {
                title: '소득·재산 조사',
                titleEn: 'Income/Asset Survey',
                desc: '소득 및 재산 조회가 진행됩니다.',
                descEn: 'Income and asset review.'
            },
            {
                title: '지급 결정',
                titleEn: 'Payment Decision',
                desc: '매월 20일 지급됩니다.',
                descEn: 'Paid on the 20th of every month.'
            }
        ],
        documents: [
            '장애인 등록증',
            '신분증',
            '통장 사본'
        ],
        documentsEn: [
            'Disability Certificate',
            'ID Card',
            'Bank Account Copy'
        ],
        eligibilityChecks: [
            {
                label: '중증장애인 등록',
                labelEn: 'Registered Severe Disability',
                pass: true
            },
            {
                label: '만 18세 이상',
                labelEn: 'Age 18+',
                pass: true
            },
            {
                label: '소득 하위 70%',
                labelEn: 'Bottom 70% Income',
                pass: false
            }
        ]
    },
    // ═══════════════════════════════════
    // 소상공인 지원 (small-biz)
    // ═══════════════════════════════════
    {
        id: 'smb-general-fund',
        title: '소상공인 일반경영안정자금',
        titleEn: 'SME General Business Stabilization Fund',
        category: 'small-biz',
        categoryLabel: '소상공인 지원',
        categoryLabelEn: 'Small Biz Support',
        amount: '연간 최대 7,000만원 (금리 약 3.58%)',
        amountEn: 'Up to ₩70M/year (rate ~3.58%)',
        description: '임대료, 인건비, 재료비 등 운전자금이 필요한 소상공인을 위한 저금리 정책자금 대출입니다.',
        descriptionEn: 'Low-interest policy fund for SMEs needing operating capital for rent, payroll, and materials.',
        applicationStart: '2026.01.02',
        applicationEnd: '2026.12.31',
        dDay: 312,
        status: 'open',
        applyUrl: 'https://ols.semas.or.kr',
        ministry: '중소벤처기업부',
        ministryEn: 'Ministry of SMEs',
        steps: [
            {
                title: '온라인 신청',
                titleEn: 'Online Application',
                desc: '소상공인 정책자금 사이트(ols.semas.or.kr)에서 신청합니다.',
                descEn: 'Apply at ols.semas.or.kr.'
            },
            {
                title: '서류 제출',
                titleEn: 'Submit Documents',
                desc: '사업자등록증, 매출 증빙 등 서류를 제출합니다.',
                descEn: 'Submit business registration, revenue proof, etc.'
            },
            {
                title: '심사·면담',
                titleEn: 'Review & Interview',
                desc: '소진공 지역센터에서 현장 확인 및 면담이 진행됩니다.',
                descEn: 'Site visit and interview at SEMAS regional center.'
            },
            {
                title: '대출 실행',
                titleEn: 'Loan Disbursement',
                desc: '심사 통과 후 협약 은행에서 대출이 실행됩니다.',
                descEn: 'Loan is disbursed through partner bank after approval.'
            }
        ],
        documents: [
            '사업자등록증',
            '부가가치세 과세표준증명',
            '소득금액증명원',
            '국세·지방세 납세증명서'
        ],
        documentsEn: [
            'Business Registration',
            'VAT Tax Base Certificate',
            'Income Certificate',
            'Tax Payment Certificate'
        ],
        eligibilityChecks: [
            {
                label: '소상공인 해당 (상시근로자 5인 미만)',
                labelEn: 'SME status (<5 employees)',
                pass: true
            },
            {
                label: '세금 체납 없음',
                labelEn: 'No tax delinquency',
                pass: true
            },
            {
                label: '신용 불량 여부 확인 필요',
                labelEn: 'Credit check required',
                pass: false
            }
        ],
        popular: true,
        new: true
    },
    {
        id: 'smb-loan-conversion',
        title: '소상공인 대환대출',
        titleEn: 'SME Loan Conversion Program',
        category: 'small-biz',
        categoryLabel: '소상공인 지원',
        categoryLabelEn: 'Small Biz Support',
        amount: '최대 5,000만원 (고정금리 4.5%)',
        amountEn: 'Up to ₩50M (fixed rate 4.5%)',
        description: '금융권 7% 이상 고금리 대출을 4.5% 저금리로 전환하여 이자 부담을 줄여주는 정책입니다.',
        descriptionEn: 'Convert high-interest loans (7%+) to 4.5% fixed rate to reduce interest burden.',
        applicationStart: '2026.01.02',
        applicationEnd: '2026.12.31',
        dDay: 312,
        status: 'open',
        applyUrl: 'https://ols.semas.or.kr',
        ministry: '중소벤처기업부',
        ministryEn: 'Ministry of SMEs',
        steps: [
            {
                title: '자격 확인',
                titleEn: 'Check Eligibility',
                desc: '기존 대출 금리 7% 이상, NCB 신용점수 919점 이하 확인합니다.',
                descEn: 'Verify existing loan rate 7%+ and NCB score ≤919.'
            },
            {
                title: '온라인 신청',
                titleEn: 'Online Application',
                desc: '소진공 정책자금 사이트에서 신청합니다.',
                descEn: 'Apply at SEMAS online portal.'
            },
            {
                title: '심사',
                titleEn: 'Review',
                desc: '기존 대출 내역 및 상환 능력을 심사합니다.',
                descEn: 'Review existing loans and repayment capacity.'
            },
            {
                title: '대환 실행',
                titleEn: 'Loan Conversion',
                desc: '기존 고금리 대출을 상환하고 저금리로 전환됩니다.',
                descEn: 'Existing high-rate loan is repaid and converted to low rate.'
            }
        ],
        documents: [
            '사업자등록증',
            '기존 대출 확인서',
            '신용정보 조회 동의서',
            '소득 증빙 서류'
        ],
        documentsEn: [
            'Business Registration',
            'Existing Loan Confirmation',
            'Credit Check Consent',
            'Income Proof'
        ],
        eligibilityChecks: [
            {
                label: '기존 대출 금리 7% 이상',
                labelEn: 'Existing loan rate 7%+',
                pass: true
            },
            {
                label: 'NCB 신용점수 919점 이하',
                labelEn: 'NCB credit score ≤919',
                pass: false
            },
            {
                label: '소상공인 자격 확인',
                labelEn: 'SME status confirmed',
                pass: true
            }
        ]
    },
    {
        id: 'smb-restart-fund',
        title: '소상공인 재도전특별자금',
        titleEn: 'SME Restart Special Fund',
        category: 'small-biz',
        categoryLabel: '소상공인 지원',
        categoryLabelEn: 'Small Biz Support',
        amount: '최대 7,000만원',
        amountEn: 'Up to ₩70M',
        description: '재창업 또는 채무조정 성실상환 중인 소상공인의 재기를 지원하는 특별자금입니다.',
        descriptionEn: 'Special fund to support re-establishing SMEs or those faithfully repaying adjusted debts.',
        applicationStart: '2026.03.01',
        applicationEnd: '2026.11.30',
        dDay: 280,
        status: 'open',
        applyUrl: 'https://ols.semas.or.kr',
        ministry: '중소벤처기업부',
        ministryEn: 'Ministry of SMEs',
        steps: [
            {
                title: '자격 확인',
                titleEn: 'Check Eligibility',
                desc: '재창업자 또는 채무조정 성실상환자 여부를 확인합니다.',
                descEn: 'Verify re-startup status or faithful debt repayment.'
            },
            {
                title: '신청서 작성',
                titleEn: 'Fill Application',
                desc: '사업계획서와 함께 신청서를 작성합니다.',
                descEn: 'Complete application with business plan.'
            },
            {
                title: '현장 실사',
                titleEn: 'On-site Review',
                desc: '소진공 담당자가 사업장을 방문하여 확인합니다.',
                descEn: 'SEMAS officer visits business site for verification.'
            },
            {
                title: '대출 실행',
                titleEn: 'Loan Disbursement',
                desc: '승인 후 협약 은행을 통해 대출이 실행됩니다.',
                descEn: 'Loan disbursed through partner bank after approval.'
            }
        ],
        documents: [
            '사업자등록증',
            '폐업사실증명원',
            '채무조정 이행확인서',
            '사업계획서'
        ],
        documentsEn: [
            'Business Registration',
            'Business Closure Certificate',
            'Debt Adjustment Compliance',
            'Business Plan'
        ],
        eligibilityChecks: [
            {
                label: '재창업 또는 채무조정 이행 중',
                labelEn: 'Re-startup or debt adjustment in progress',
                pass: true
            },
            {
                label: '폐업 이력 확인',
                labelEn: 'Business closure history confirmed',
                pass: true
            },
            {
                label: '세금 체납 확인 필요',
                labelEn: 'Tax delinquency check required',
                pass: false
            }
        ],
        new: true
    },
    // ═══════════════════════════════════
    // 창업 지원 (startup)
    // ═══════════════════════════════════
    {
        id: 'startup-pre-package',
        title: '2026 예비창업패키지',
        titleEn: '2026 Pre-Startup Package',
        category: 'startup',
        categoryLabel: '창업 지원',
        categoryLabelEn: 'Startup Support',
        amount: '평균 5,000만원 (최대 1억원)',
        amountEn: 'Avg ₩50M (max ₩100M)',
        description: '혁신적 기술·아이디어를 보유한 예비창업자에게 사업화 자금, 교육, 멘토링을 지원합니다.',
        descriptionEn: 'Provides funding, education, and mentoring for pre-entrepreneurs with innovative ideas.',
        applicationStart: '2026.02.01',
        applicationEnd: '2026.02.28',
        dDay: -1,
        status: 'closed',
        applyUrl: 'https://www.k-startup.go.kr',
        ministry: '중소벤처기업부',
        ministryEn: 'Ministry of SMEs',
        steps: [
            {
                title: 'K-Startup 접속',
                titleEn: 'Visit K-Startup',
                desc: 'K-스타트업 사이트에서 사업 공고를 확인합니다.',
                descEn: 'Check announcements at k-startup.go.kr.'
            },
            {
                title: '사업계획서 작성',
                titleEn: 'Write Business Plan',
                desc: '혁신 아이템 중심의 사업계획서를 작성합니다.',
                descEn: 'Write a business plan focused on innovative items.'
            },
            {
                title: '서류·발표 평가',
                titleEn: 'Document & Pitch Eval',
                desc: '서류 심사 후 발표(피칭) 평가를 진행합니다.',
                descEn: 'Document review followed by pitch evaluation.'
            },
            {
                title: '선정·협약',
                titleEn: 'Selection & Agreement',
                desc: '선정 후 사업자등록 및 협약을 체결합니다.',
                descEn: 'Register business and sign agreement after selection.'
            }
        ],
        documents: [
            '사업계획서',
            '신분증',
            '졸업증명서 (해당 시)',
            '특허·지식재산권 증빙 (해당 시)'
        ],
        documentsEn: [
            'Business Plan',
            'ID Card',
            'Diploma (if applicable)',
            'Patent/IP Proof (if applicable)'
        ],
        eligibilityChecks: [
            {
                label: '사업자등록 미완료 (예비창업자)',
                labelEn: 'No business registration (pre-entrepreneur)',
                pass: true
            },
            {
                label: '혁신 아이디어 보유',
                labelEn: 'Has innovative idea',
                pass: true
            },
            {
                label: '연령 제한 없음',
                labelEn: 'No age limit',
                pass: true
            }
        ],
        popular: true
    },
    {
        id: 'startup-initial-package',
        title: '2026 초기창업패키지',
        titleEn: '2026 Initial Startup Package',
        category: 'startup',
        categoryLabel: '창업 지원',
        categoryLabelEn: 'Startup Support',
        amount: '평균 5,000만원 (최대 1억원, 딥테크 1.5억)',
        amountEn: 'Avg ₩50M (max ₩100M, DeepTech ₩150M)',
        description: '창업 3년 이내 초기 기업에게 시제품 제작, 마케팅, 지식재산권 비용을 지원합니다.',
        descriptionEn: 'Supports prototyping, marketing, and IP costs for startups within 3 years of founding.',
        applicationStart: '2026.01.23',
        applicationEnd: '2026.02.27',
        dDay: -1,
        status: 'closed',
        applyUrl: 'https://www.k-startup.go.kr',
        ministry: '중소벤처기업부',
        ministryEn: 'Ministry of SMEs',
        steps: [
            {
                title: '공고 확인',
                titleEn: 'Check Announcement',
                desc: 'K-스타트업에서 모집 공고를 확인합니다.',
                descEn: 'Check recruitment notice at K-Startup.'
            },
            {
                title: '온라인 접수',
                titleEn: 'Online Registration',
                desc: '사업계획서와 함께 온라인으로 접수합니다.',
                descEn: 'Register online with business plan.'
            },
            {
                title: '심층 인터뷰',
                titleEn: 'In-depth Interview',
                desc: '서류 통과 후 심층 인터뷰(발표 평가)를 진행합니다.',
                descEn: 'In-depth interview after document screening.'
            },
            {
                title: '협약 체결',
                titleEn: 'Sign Agreement',
                desc: '최종 선정 후 협약을 체결하고 자금이 지원됩니다.',
                descEn: 'Sign agreement and receive funding after final selection.'
            }
        ],
        documents: [
            '사업자등록증',
            '사업계획서',
            '법인등기부등본 (법인)',
            '재무제표'
        ],
        documentsEn: [
            'Business Registration',
            'Business Plan',
            'Corporate Registry (Corp)',
            'Financial Statements'
        ],
        eligibilityChecks: [
            {
                label: '창업 3년 이내',
                labelEn: 'Within 3 years of founding',
                pass: true
            },
            {
                label: '자부담 30% 가능',
                labelEn: 'Can cover 30% self-funding',
                pass: false
            },
            {
                label: '유흥업·부동산업 제외',
                labelEn: 'Excludes entertainment/real estate',
                pass: true
            }
        ]
    },
    {
        id: 'startup-youth-academy',
        title: '2026 청년창업사관학교',
        titleEn: '2026 Youth Startup Academy',
        category: 'startup',
        categoryLabel: '창업 지원',
        categoryLabelEn: 'Startup Support',
        amount: '최대 1억원 (평균 7,000만원) + 사무공간·교육',
        amountEn: 'Up to ₩100M (avg ₩70M) + office & training',
        description: '만 39세 이하 기술 기반 청년 창업자를 위한 사업화 자금, 사무공간, 교육, 멘토링 원스톱 지원.',
        descriptionEn: 'One-stop support for tech-based youth entrepreneurs under 39: funding, office, education, mentoring.',
        targetAge: '만 39세 이하',
        applicationStart: '2026.01.30',
        applicationEnd: '2026.02.13',
        dDay: -1,
        status: 'closed',
        applyUrl: 'https://start.semas.or.kr',
        ministry: '중소벤처기업부',
        ministryEn: 'Ministry of SMEs',
        steps: [
            {
                title: '온라인 접수',
                titleEn: 'Online Application',
                desc: '청년창업사관학교 사이트에서 입교 신청합니다.',
                descEn: 'Apply at Youth Startup Academy website.'
            },
            {
                title: '서류 평가',
                titleEn: 'Document Review',
                desc: '사업계획서 및 기술력을 서류 평가합니다.',
                descEn: 'Business plan and technology assessment.'
            },
            {
                title: '발표 평가',
                titleEn: 'Pitch Evaluation',
                desc: '대면 발표를 통해 사업 아이템을 평가합니다.',
                descEn: 'In-person pitch evaluation of business idea.'
            },
            {
                title: '입교·사업 개시',
                titleEn: 'Enrollment & Start',
                desc: '입교 후 사무공간 배정 및 사업을 시작합니다.',
                descEn: 'Office assigned and business begins after enrollment.'
            }
        ],
        documents: [
            '사업계획서',
            '신분증',
            '졸업증명서',
            '병적증명서 (해당 시)'
        ],
        documentsEn: [
            'Business Plan',
            'ID Card',
            'Diploma',
            'Military Service Certificate (if applicable)'
        ],
        eligibilityChecks: [
            {
                label: '만 39세 이하',
                labelEn: 'Age ≤39',
                pass: true
            },
            {
                label: '기술 기반 창업 아이템',
                labelEn: 'Tech-based startup item',
                pass: true
            },
            {
                label: '금융 불량거래 없음',
                labelEn: 'No financial default',
                pass: true
            }
        ],
        popular: true
    },
    // ═══════════════════════════════════
    // 폐업·재창업 (closure-restart)
    // ═══════════════════════════════════
    {
        id: 'closure-hope-return',
        title: '희망리턴패키지 — 원스톱 폐업지원',
        titleEn: 'Hope Return Package — One-Stop Closure Support',
        category: 'closure-restart',
        categoryLabel: '폐업·재창업',
        categoryLabelEn: 'Closure & Restart',
        amount: '점포 철거비 최대 400만원 + 법률·채무 컨설팅',
        amountEn: 'Store demolition up to ₩4M + legal/debt consulting',
        description: '폐업 예정이거나 이미 폐업한 소상공인의 행정처리, 점포 철거, 법률 컨설팅을 한 번에 지원합니다.',
        descriptionEn: 'One-stop support for closing businesses: admin processing, store demolition, and legal consulting.',
        applicationStart: '2026.01.19',
        applicationEnd: '2026.12.31',
        dDay: 312,
        status: 'open',
        applyUrl: 'https://hope.sbiz.or.kr',
        ministry: '소상공인시장진흥공단',
        ministryEn: 'SEMAS',
        steps: [
            {
                title: '온라인 신청',
                titleEn: 'Online Application',
                desc: '희망리턴패키지 사이트(hope.sbiz.or.kr)에서 접수합니다.',
                descEn: 'Apply at hope.sbiz.or.kr.'
            },
            {
                title: '상담·진단',
                titleEn: 'Consultation',
                desc: '전담 상담사가 폐업 상황을 진단합니다.',
                descEn: 'Dedicated counselor diagnoses closure situation.'
            },
            {
                title: '철거 지원',
                titleEn: 'Demolition Support',
                desc: '점포 철거 업체 연결 및 비용을 지원합니다.',
                descEn: 'Connect with demolition company and cover costs.'
            },
            {
                title: '후속 연계',
                titleEn: 'Follow-up Linkage',
                desc: '재취업·재창업 프로그램으로 연계됩니다.',
                descEn: 'Linked to re-employment or re-startup programs.'
            }
        ],
        documents: [
            '사업자등록증 또는 폐업사실증명원',
            '신분증',
            '임대차계약서',
            '점포 사진'
        ],
        documentsEn: [
            'Business Registration or Closure Certificate',
            'ID Card',
            'Lease Contract',
            'Store Photos'
        ],
        eligibilityChecks: [
            {
                label: '사업 운영 60일 이상',
                labelEn: 'Business operated 60+ days',
                pass: true
            },
            {
                label: '소상공인 자격',
                labelEn: 'SME qualification',
                pass: true
            },
            {
                label: '폐업 예정 또는 이미 폐업',
                labelEn: 'Closing or already closed',
                pass: true
            }
        ],
        new: true
    },
    {
        id: 'closure-restart-biz',
        title: '희망리턴패키지 — 재기사업화(재창업)',
        titleEn: 'Hope Return Package — Re-startup Support',
        category: 'closure-restart',
        categoryLabel: '폐업·재창업',
        categoryLabelEn: 'Closure & Restart',
        amount: '사업화 자금 최대 2,000만원',
        amountEn: 'Re-startup fund up to ₩20M',
        description: '폐업 소상공인 또는 재창업 1년 이내 소상공인에게 진단, 교육, 맞춤 솔루션, 사업화 자금을 지원합니다.',
        descriptionEn: 'Provides diagnosis, training, solutions, and funding for closed or recently re-started SMEs.',
        applicationStart: '2026.01.30',
        applicationEnd: '2026.02.27',
        dDay: -1,
        status: 'closed',
        applyUrl: 'https://hope.sbiz.or.kr',
        ministry: '소상공인시장진흥공단',
        ministryEn: 'SEMAS',
        steps: [
            {
                title: '온라인 신청',
                titleEn: 'Online Application',
                desc: '희망리턴패키지 사이트에서 재기사업화 모집에 신청합니다.',
                descEn: 'Apply to the re-startup program at hope.sbiz.or.kr.'
            },
            {
                title: '현장 진단',
                titleEn: 'On-site Diagnosis',
                desc: '전문가가 사업장을 방문하여 매출 감소 원인을 분석합니다.',
                descEn: 'Expert visits business to analyze revenue decline.'
            },
            {
                title: '맞춤 교육',
                titleEn: 'Custom Training',
                desc: '업종 전환, 마케팅 등 맞춤형 교육을 받습니다.',
                descEn: 'Receive training on industry change, marketing, etc.'
            },
            {
                title: '사업화 자금 지원',
                titleEn: 'Funding',
                desc: '사업계획 수립 후 최대 2,000만원 자금을 지원받습니다.',
                descEn: 'Receive up to ₩20M after business plan completion.'
            }
        ],
        documents: [
            '폐업사실증명원',
            '사업계획서',
            '신분증',
            '사업자등록증 (재창업 시)'
        ],
        documentsEn: [
            'Business Closure Certificate',
            'Business Plan',
            'ID Card',
            'Business Registration (for re-startup)'
        ],
        eligibilityChecks: [
            {
                label: '폐업 소상공인 또는 재창업 1년 이내',
                labelEn: 'Closed SME or re-started within 1 year',
                pass: true
            },
            {
                label: '새출발기금 채무조정 약정자 포함',
                labelEn: 'Includes New Start Fund debt adjustment',
                pass: true
            },
            {
                label: '업종 전환 재창업 가능',
                labelEn: 'Industry change re-startup OK',
                pass: true
            }
        ]
    },
    // ═══════════════════════════════════
    // 채무조정·회생 (debt-relief)
    // ═══════════════════════════════════
    {
        id: 'debt-new-start-fund',
        title: '새출발기금',
        titleEn: 'New Start Fund',
        category: 'debt-relief',
        categoryLabel: '채무조정·회생',
        categoryLabelEn: 'Debt Relief',
        amount: '원금 감면 최대 90% + 최장 20년 분할상환',
        amountEn: 'Up to 90% principal reduction + 20yr installment',
        description: '코로나 등으로 어려움을 겪는 소상공인·자영업자의 금융 채무를 최대 90%까지 감면하는 채무조정 프로그램.',
        descriptionEn: 'Debt adjustment program reducing financial debts up to 90% for struggling SMEs and self-employed.',
        applicationStart: '2026.01.01',
        applicationEnd: '2026.12.31',
        dDay: 312,
        status: 'open',
        applyUrl: 'https://www.newstartfund.or.kr',
        ministry: '금융위원회',
        ministryEn: 'Financial Services Commission',
        steps: [
            {
                title: '자격 확인',
                titleEn: 'Check Eligibility',
                desc: '새출발기금 홈페이지에서 자격 여부를 조회합니다.',
                descEn: 'Check eligibility at newstartfund.or.kr.'
            },
            {
                title: '온라인 신청',
                titleEn: 'Online Application',
                desc: '본인인증 후 채무 내역을 조회하고 신청합니다.',
                descEn: 'Verify identity, check debts, and apply.'
            },
            {
                title: '채무조정안 수립',
                titleEn: 'Adjustment Plan',
                desc: '캠코(KAMCO)에서 맞춤형 조정안을 수립합니다.',
                descEn: 'KAMCO creates customized adjustment plan.'
            },
            {
                title: '조정 확정·이행',
                titleEn: 'Confirmation & Execution',
                desc: '조정안 확정 후 감면/분할 상환을 시작합니다.',
                descEn: 'After confirmation, begin reduced/installment payments.'
            }
        ],
        documents: [
            '신분증',
            '사업자등록증 또는 폐업증명서',
            '채무 내역서',
            '소득 증빙 서류'
        ],
        documentsEn: [
            'ID Card',
            'Business Registration or Closure Certificate',
            'Debt Statement',
            'Income Proof'
        ],
        eligibilityChecks: [
            {
                label: '2020.4~2025.6 사업 영위자',
                labelEn: 'Business operated Apr 2020~Jun 2025',
                pass: true
            },
            {
                label: '90일 이상 연체 (부실차주)',
                labelEn: '90+ days overdue (delinquent)',
                pass: false
            },
            {
                label: '총 채무 15억원 이하',
                labelEn: 'Total debt ≤₩1.5B',
                pass: true
            }
        ],
        popular: true,
        new: true
    },
    {
        id: 'debt-personal-recovery',
        title: '개인회생',
        titleEn: 'Personal Rehabilitation',
        category: 'debt-relief',
        categoryLabel: '채무조정·회생',
        categoryLabelEn: 'Debt Relief',
        amount: '채무 최대 90% 감면 (3~5년 변제)',
        amountEn: 'Up to 90% debt reduction (3~5yr repayment)',
        description: '지속적인 소득이 있지만 과도한 채무로 어려운 개인이 법원을 통해 채무를 조정받는 제도입니다.',
        descriptionEn: 'Court-supervised debt adjustment for individuals with steady income but excessive debts.',
        applicationStart: '2026.01.01',
        applicationEnd: '2026.12.31',
        dDay: 312,
        status: 'open',
        applyUrl: 'https://www.scourt.go.kr',
        ministry: '법원행정처',
        ministryEn: 'Court Administration',
        steps: [
            {
                title: '자격 확인',
                titleEn: 'Check Eligibility',
                desc: '무담보 10억, 담보 15억 이하 채무와 지속적 소득 여부를 확인합니다.',
                descEn: 'Verify debts (unsecured ≤₩1B, secured ≤₩1.5B) and steady income.'
            },
            {
                title: '서류 준비',
                titleEn: 'Prepare Documents',
                desc: '채무자목록, 재산목록, 소득·지출 명세서를 준비합니다.',
                descEn: 'Prepare debtor list, asset list, income/expense statements.'
            },
            {
                title: '법원 제출',
                titleEn: 'Court Filing',
                desc: '관할 법원에 개인회생 신청서를 제출합니다.',
                descEn: 'Submit personal rehabilitation application to court.'
            },
            {
                title: '변제계획 인가',
                titleEn: 'Repayment Plan Approval',
                desc: '법원이 변제계획을 인가하면 3~5년간 변제합니다.',
                descEn: 'Court approves plan, repay over 3~5 years.'
            }
        ],
        documents: [
            '신청서',
            '진술서',
            '채무자목록',
            '재산목록',
            '소득·지출 명세서',
            '주민등록등본',
            '가족관계증명서'
        ],
        documentsEn: [
            'Application',
            'Statement',
            'Debtor List',
            'Asset List',
            'Income/Expense Statement',
            'Resident Registration',
            'Family Relation Certificate'
        ],
        eligibilityChecks: [
            {
                label: '지속적 소득 있음',
                labelEn: 'Has steady income',
                pass: true
            },
            {
                label: '무담보 10억/담보 15억 이하',
                labelEn: 'Unsecured ≤₩1B / Secured ≤₩1.5B',
                pass: true
            },
            {
                label: '변제 곤란 상태',
                labelEn: 'Unable to repay debts',
                pass: false
            }
        ]
    },
    {
        id: 'debt-credit-recovery',
        title: '신용회복위원회 개인워크아웃',
        titleEn: 'Credit Recovery Committee Workout',
        category: 'debt-relief',
        categoryLabel: '채무조정·회생',
        categoryLabelEn: 'Debt Relief',
        amount: '이자 전액 감면 + 원금 30~50% 감면',
        amountEn: 'Full interest waiver + 30~50% principal reduction',
        description: '3개월 이상 연체된 채무자가 이자 면제, 원금 감면, 최장 10년 분할상환 혜택을 받을 수 있습니다.',
        descriptionEn: 'For debtors 3+ months overdue: interest waiver, principal reduction, up to 10yr installment.',
        applicationStart: '2026.01.01',
        applicationEnd: '2026.12.31',
        dDay: 312,
        status: 'open',
        applyUrl: 'https://www.ccrs.or.kr',
        ministry: '신용회복위원회',
        ministryEn: 'Credit Recovery Committee',
        steps: [
            {
                title: '상담 예약',
                titleEn: 'Book Consultation',
                desc: '신용회복위원회 홈페이지 또는 지부에서 상담을 예약합니다.',
                descEn: 'Book consultation at ccrs.or.kr or local branch.'
            },
            {
                title: '서류 제출',
                titleEn: 'Submit Documents',
                desc: '신분증, 소득 증빙, 연체 내역 등을 제출합니다.',
                descEn: 'Submit ID, income proof, delinquency records, etc.'
            },
            {
                title: '채무조정안 수립',
                titleEn: 'Adjustment Plan',
                desc: '채무 현황을 확인하고 조정안을 수립합니다.',
                descEn: 'Review debt status and create adjustment plan.'
            },
            {
                title: '금융기관 동의·개시',
                titleEn: 'Bank Approval & Start',
                desc: '금융기관 동의 후 채무조정이 개시되고 추심이 중단됩니다.',
                descEn: 'After bank consent, adjustment starts and collection stops.'
            }
        ],
        documents: [
            '신분증',
            '소득증빙서류',
            '연체내역서',
            '채무확인서'
        ],
        documentsEn: [
            'ID Card',
            'Income Proof',
            'Delinquency Records',
            'Debt Confirmation'
        ],
        eligibilityChecks: [
            {
                label: '90일(3개월) 이상 연체',
                labelEn: '90+ days (3+ months) overdue',
                pass: true
            },
            {
                label: '총 채무 15억원 이하',
                labelEn: 'Total debt ≤₩1.5B',
                pass: true
            },
            {
                label: '최저생계비 이상 소득',
                labelEn: 'Income above minimum living cost',
                pass: false
            }
        ]
    }
];
;
/** Get benefit with live D-Day calculation */ function withLiveDDay(b) {
    const dDay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$welfare$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculateDDay"])(b.applicationEnd);
    return {
        ...b,
        dDay,
        status: dDay < 0 ? 'closed' : 'open'
    };
}
function getBenefitById(id) {
    const b = BENEFITS.find((b)=>b.id === id);
    return b ? withLiveDDay(b) : undefined;
}
function getBenefitsByCategory(category) {
    return BENEFITS.filter((b)=>b.category === category).map(withLiveDDay);
}
function getUrgentBenefits(maxDays = 14) {
    return BENEFITS.map(withLiveDDay).filter((b)=>b.dDay >= 0 && b.dDay <= maxDays && b.status === 'open').sort((a, b)=>a.dDay - b.dDay);
}
function getPopularBenefits() {
    return BENEFITS.filter((b)=>b.popular).map(withLiveDDay);
}
function getAllBenefitsLive() {
    return BENEFITS.map(withLiveDDay);
}
function getDDayColor(dDay) {
    if (dDay <= 3) return 'badge-red';
    if (dDay <= 7) return 'badge-orange';
    if (dDay <= 14) return 'badge-blue';
    return 'badge-green';
}
function getDDayText(dDay, lang = 'ko') {
    if (dDay < 0) return lang === 'ko' ? '마감' : 'Closed';
    if (dDay === 0) return lang === 'ko' ? 'D-day' : 'Today!';
    return `D-${dDay}`;
}
const CATEGORY_INFO = {
    'basic-living': {
        label: '기초생활수급',
        labelEn: 'Basic Living',
        icon: '🏠',
        color: '#FF6B4A'
    },
    'near-poverty': {
        label: '차상위계층',
        labelEn: 'Near Poverty',
        icon: '👥',
        color: '#3B82F6'
    },
    'youth': {
        label: '청년 지원',
        labelEn: 'Youth',
        icon: '⭐',
        color: '#A855F7'
    },
    'middle-aged': {
        label: '장년 지원',
        labelEn: 'Middle-Aged',
        icon: '💼',
        color: '#22C55E'
    },
    'senior': {
        label: '노인 복지',
        labelEn: 'Senior',
        icon: '❤️',
        color: '#F97316'
    },
    'housing': {
        label: '주거 지원',
        labelEn: 'Housing',
        icon: '🏡',
        color: '#6366F1'
    },
    'medical': {
        label: '의료 지원',
        labelEn: 'Medical',
        icon: '🏥',
        color: '#EC4899'
    },
    'education': {
        label: '교육 지원',
        labelEn: 'Education',
        icon: '📚',
        color: '#14B8A6'
    },
    'employment': {
        label: '취업 지원',
        labelEn: 'Employment',
        icon: '💪',
        color: '#EAB308'
    },
    'small-biz': {
        label: '소상공인 지원',
        labelEn: 'Small Biz',
        icon: '🏪',
        color: '#D97706'
    },
    'startup': {
        label: '창업 지원',
        labelEn: 'Startup',
        icon: '🚀',
        color: '#7C3AED'
    },
    'closure-restart': {
        label: '폐업·재창업',
        labelEn: 'Closure & Restart',
        icon: '🔄',
        color: '#059669'
    },
    'debt-relief': {
        label: '채무조정·회생',
        labelEn: 'Debt Relief',
        icon: '⚖️',
        color: '#0891B2'
    }
};
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/components/layout/BottomNav.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
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
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 9,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                points: "9 22 9 12 15 12 15 22"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 10,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 8,
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
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "11",
                cy: "11",
                r: "8"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 16,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "21",
                y1: "21",
                x2: "16.65",
                y2: "16.65"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 16,
                columnNumber: 36
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 15,
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
                lineNumber: 22,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "16",
                y1: "2",
                x2: "16",
                y2: "6"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 23,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "8",
                y1: "2",
                x2: "8",
                y2: "6"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 23,
                columnNumber: 42
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "3",
                y1: "10",
                x2: "21",
                y2: "10"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 24,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 21,
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
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 30,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "7",
                r: "4"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 31,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 29,
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
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 2a2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2V4a2 2 0 012-2z"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 37,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 7v10M8 9l4-2 4 2M8 15l4 2 4-2"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 38,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "5",
                cy: "12",
                r: "2"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 39,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "19",
                cy: "12",
                r: "2"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 40,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "7",
                y1: "12",
                x2: "10",
                y2: "12"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 41,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "14",
                y1: "12",
                x2: "17",
                y2: "12"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 42,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 36,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c4 = AiIcon;
function BottomNav() {
    _s();
    const { t } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const tabs = [
        {
            href: '/',
            label: t.home,
            Icon: HomeIcon
        },
        {
            href: '/search',
            label: t.search,
            Icon: SearchIcon
        },
        {
            href: '/ai',
            label: t.aiRecommend,
            Icon: AiIcon
        },
        {
            href: '/calendar',
            label: t.calendar,
            Icon: CalendarIcon
        },
        {
            href: '/profile',
            label: t.myPage,
            Icon: ProfileIcon
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].nav,
        children: tabs.map(({ href, label, Icon })=>{
            const active = pathname === href;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: href,
                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tab} ${active ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].active : ''}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {}, void 0, false, {
                        fileName: "[project]/src/components/layout/BottomNav.tsx",
                        lineNumber: 64,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/BottomNav.tsx",
                        lineNumber: 65,
                        columnNumber: 13
                    }, this)
                ]
            }, href, true, {
                fileName: "[project]/src/components/layout/BottomNav.tsx",
                lineNumber: 63,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/layout/BottomNav.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
_s(BottomNav, "1HVjjgp4CIPxhSnGkT5hE3NaizA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
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
"[project]/src/components/ai/AiEligibilityCheck.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "analyzeBtn": "AiEligibilityCheck-module__D5M_PG__analyzeBtn",
  "centerState": "AiEligibilityCheck-module__D5M_PG__centerState",
  "closeBtn": "AiEligibilityCheck-module__D5M_PG__closeBtn",
  "disclaimer": "AiEligibilityCheck-module__D5M_PG__disclaimer",
  "errorBox": "AiEligibilityCheck-module__D5M_PG__errorBox",
  "modal": "AiEligibilityCheck-module__D5M_PG__modal",
  "modalHeader": "AiEligibilityCheck-module__D5M_PG__modalHeader",
  "modalSub": "AiEligibilityCheck-module__D5M_PG__modalSub",
  "modalTitle": "AiEligibilityCheck-module__D5M_PG__modalTitle",
  "no": "AiEligibilityCheck-module__D5M_PG__no",
  "overlay": "AiEligibilityCheck-module__D5M_PG__overlay",
  "overlayIn": "AiEligibilityCheck-module__D5M_PG__overlayIn",
  "qIntro": "AiEligibilityCheck-module__D5M_PG__qIntro",
  "qNum": "AiEligibilityCheck-module__D5M_PG__qNum",
  "questionItem": "AiEligibilityCheck-module__D5M_PG__questionItem",
  "questionText": "AiEligibilityCheck-module__D5M_PG__questionText",
  "questions": "AiEligibilityCheck-module__D5M_PG__questions",
  "reasonText": "AiEligibilityCheck-module__D5M_PG__reasonText",
  "resetBtn": "AiEligibilityCheck-module__D5M_PG__resetBtn",
  "result": "AiEligibilityCheck-module__D5M_PG__result",
  "slideUp": "AiEligibilityCheck-module__D5M_PG__slideUp",
  "spin": "AiEligibilityCheck-module__D5M_PG__spin",
  "spinner": "AiEligibilityCheck-module__D5M_PG__spinner",
  "tipsBox": "AiEligibilityCheck-module__D5M_PG__tipsBox",
  "tipsLabel": "AiEligibilityCheck-module__D5M_PG__tipsLabel",
  "trigger": "AiEligibilityCheck-module__D5M_PG__trigger",
  "verdictBadge": "AiEligibilityCheck-module__D5M_PG__verdictBadge",
  "verdictIcon": "AiEligibilityCheck-module__D5M_PG__verdictIcon",
  "verdictLabel": "AiEligibilityCheck-module__D5M_PG__verdictLabel",
  "yes": "AiEligibilityCheck-module__D5M_PG__yes",
  "yesNo": "AiEligibilityCheck-module__D5M_PG__yesNo",
  "yesNoBtn": "AiEligibilityCheck-module__D5M_PG__yesNoBtn",
});
}),
"[project]/src/components/ai/AiEligibilityCheck.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AiEligibilityCheck
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/components/ai/AiEligibilityCheck.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function AiEligibilityCheck({ benefitId, benefitTitle }) {
    _s();
    const { lang } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const isKo = lang === 'ko';
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('idle');
    const [questions, setQuestions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [answers, setAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    async function loadQuestions() {
        setPhase('loading-q');
        setError(null);
        try {
            const res = await fetch('/api/ai-check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    benefitId,
                    lang
                })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Error');
            const data = await res.json();
            setQuestions(data.questions);
            setAnswers(new Array(data.questions.length).fill(null));
            setPhase('questions');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error');
            setPhase('idle');
        }
    }
    async function submitAnswers() {
        setPhase('loading-v');
        setError(null);
        try {
            const res = await fetch('/api/ai-check', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    benefitId,
                    questions,
                    answers,
                    lang
                })
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Error');
            const data = await res.json();
            setResult(data);
            setPhase('result');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error');
            setPhase('questions');
        }
    }
    function reset() {
        setPhase('idle');
        setQuestions([]);
        setAnswers([]);
        setResult(null);
        setError(null);
    }
    const verdictInfo = {
        likely: {
            icon: '✅',
            label: isKo ? '가능성 높음' : 'Likely Eligible',
            color: '#22c55e'
        },
        partial: {
            icon: '⚠️',
            label: isKo ? '일부 조건 확인 필요' : 'Partial Match',
            color: '#f59e0b'
        },
        unlikely: {
            icon: '❌',
            label: isKo ? '해당 가능성 낮음' : 'Unlikely Eligible',
            color: '#ef4444'
        }
    };
    const allAnswered = answers.length > 0 && answers.every((a)=>a !== null);
    if (!open) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].trigger,
            onClick: ()=>{
                setOpen(true);
                loadQuestions();
            },
            id: `ai-check-btn-${benefitId}`,
            children: [
                "🤖 ",
                isKo ? '내가 해당되나요? AI 자격 체크' : 'Am I Eligible? AI Check'
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
            lineNumber: 87,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].overlay,
        onClick: (e)=>{
            if (e.target === e.currentTarget) setOpen(false);
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modal,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalHeader,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalSub,
                                    children: "🤖 AI 자격 체크"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalTitle,
                                    children: benefitTitle
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                    lineNumber: 103,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 101,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].closeBtn,
                            onClick: ()=>{
                                setOpen(false);
                                reset();
                            },
                            children: "✕"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 105,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                    lineNumber: 100,
                    columnNumber: 9
                }, this),
                phase === 'loading-q' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].centerState,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].spinner
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 111,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: isKo ? 'AI가 자격 조건을 분석 중...' : 'AI analyzing eligibility conditions...'
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 112,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                    lineNumber: 110,
                    columnNumber: 11
                }, this),
                phase === 'questions' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].questions,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].qIntro,
                            children: isKo ? '아래 질문에 답하시면 자격 여부를 AI가 분석합니다.' : 'Answer the questions below and AI will analyze your eligibility.'
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 119,
                            columnNumber: 13
                        }, this),
                        questions.map((q, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].questionItem,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].questionText,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].qNum,
                                                children: i + 1
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                                lineNumber: 127,
                                                columnNumber: 19
                                            }, this),
                                            " ",
                                            q
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                        lineNumber: 126,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].yesNo,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].yesNoBtn} ${answers[i] === true ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].yes : ''}`,
                                                onClick: ()=>{
                                                    const next = [
                                                        ...answers
                                                    ];
                                                    next[i] = true;
                                                    setAnswers(next);
                                                },
                                                children: isKo ? '예 ✓' : 'Yes ✓'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                                lineNumber: 130,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].yesNoBtn} ${answers[i] === false ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].no : ''}`,
                                                onClick: ()=>{
                                                    const next = [
                                                        ...answers
                                                    ];
                                                    next[i] = false;
                                                    setAnswers(next);
                                                },
                                                children: isKo ? '아니오 ✗' : 'No ✗'
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                                lineNumber: 140,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                        lineNumber: 129,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                lineNumber: 125,
                                columnNumber: 15
                            }, this)),
                        allAnswered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].analyzeBtn,
                            onClick: submitAnswers,
                            children: isKo ? '🔍 AI 분석 시작' : '🔍 Analyze'
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 155,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                    lineNumber: 118,
                    columnNumber: 11
                }, this),
                phase === 'loading-v' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].centerState,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].spinner
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 165,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: isKo ? 'AI가 결과를 분석 중...' : 'AI analyzing result...'
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 166,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                    lineNumber: 164,
                    columnNumber: 11
                }, this),
                phase === 'result' && result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].result,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].verdictBadge,
                            style: {
                                borderColor: verdictInfo[result.verdict].color,
                                color: verdictInfo[result.verdict].color
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].verdictIcon,
                                    children: verdictInfo[result.verdict].icon
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                    lineNumber: 177,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].verdictLabel,
                                    children: verdictInfo[result.verdict].label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                    lineNumber: 178,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 173,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].reasonText,
                            children: result.reason
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 180,
                            columnNumber: 13
                        }, this),
                        result.tips && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tipsBox,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tipsLabel,
                                    children: isKo ? '💡 다음 단계' : '💡 Next Steps'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                    lineNumber: 183,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: result.tips
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                                    lineNumber: 184,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 182,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].disclaimer,
                            children: isKo ? '⚠️ AI 분석 결과는 참고용이며 법적 효력이 없습니다.' : '⚠️ AI results are for reference only and have no legal effect.'
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 187,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].resetBtn,
                            onClick: reset,
                            children: isKo ? '다시 체크하기' : 'Check Again'
                        }, void 0, false, {
                            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                            lineNumber: 192,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                    lineNumber: 172,
                    columnNumber: 11
                }, this),
                error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorBox,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: [
                            "⚠️ ",
                            error
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                        lineNumber: 201,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
                    lineNumber: 200,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
            lineNumber: 99,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ai/AiEligibilityCheck.tsx",
        lineNumber: 98,
        columnNumber: 5
    }, this);
}
_s(AiEligibilityCheck, "n+eLIEQhK6yMn2c/l3mVViykgfc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"]
    ];
});
_c = AiEligibilityCheck;
var _c;
__turbopack_context__.k.register(_c, "AiEligibilityCheck");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/detail/[id]/page.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "applyBtn": "page-module__jS5qvG__applyBtn",
  "backBtn": "page-module__jS5qvG__backBtn",
  "bookmarkBtn": "page-module__jS5qvG__bookmarkBtn",
  "checkBadge": "page-module__jS5qvG__checkBadge",
  "checkFail": "page-module__jS5qvG__checkFail",
  "checkItem": "page-module__jS5qvG__checkItem",
  "checkLabel": "page-module__jS5qvG__checkLabel",
  "checkList": "page-module__jS5qvG__checkList",
  "checkPass": "page-module__jS5qvG__checkPass",
  "ctaArea": "page-module__jS5qvG__ctaArea",
  "detailHeader": "page-module__jS5qvG__detailHeader",
  "docIcon": "page-module__jS5qvG__docIcon",
  "docItem": "page-module__jS5qvG__docItem",
  "docList": "page-module__jS5qvG__docList",
  "docName": "page-module__jS5qvG__docName",
  "eligCard": "page-module__jS5qvG__eligCard",
  "eligCount": "page-module__jS5qvG__eligCount",
  "eligHeader": "page-module__jS5qvG__eligHeader",
  "failBadge": "page-module__jS5qvG__failBadge",
  "headerTitle": "page-module__jS5qvG__headerTitle",
  "heroAmount": "page-module__jS5qvG__heroAmount",
  "heroCard": "page-module__jS5qvG__heroCard",
  "heroMinistry": "page-module__jS5qvG__heroMinistry",
  "heroTitle": "page-module__jS5qvG__heroTitle",
  "heroTop": "page-module__jS5qvG__heroTop",
  "infoGrid": "page-module__jS5qvG__infoGrid",
  "infoIcon": "page-module__jS5qvG__infoIcon",
  "infoItem": "page-module__jS5qvG__infoItem",
  "infoLabel": "page-module__jS5qvG__infoLabel",
  "infoValue": "page-module__jS5qvG__infoValue",
  "kakaoBtn": "page-module__jS5qvG__kakaoBtn",
  "notFound": "page-module__jS5qvG__notFound",
  "passBadge": "page-module__jS5qvG__passBadge",
  "stepContent": "page-module__jS5qvG__stepContent",
  "stepDesc": "page-module__jS5qvG__stepDesc",
  "stepItem": "page-module__jS5qvG__stepItem",
  "stepList": "page-module__jS5qvG__stepList",
  "stepNum": "page-module__jS5qvG__stepNum",
  "stepTitle": "page-module__jS5qvG__stepTitle",
  "textBlock": "page-module__jS5qvG__textBlock",
});
}),
"[project]/src/app/detail/[id]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DetailPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/context.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/benefits.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/TopBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/BottomNav.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ai/AiEligibilityCheck.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/src/app/detail/[id]/page.module.css [app-client] (css module)");
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
function DetailPage({ params }) {
    _s();
    const { id } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["use"])(params);
    const { t, lang, toggleBookmark, isBookmarked } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"])();
    const [benefit, setBenefit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [apiDetail, setApiDetail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [shared, setShared] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleShare = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "DetailPage.useCallback[handleShare]": async ()=>{
            const url = window.location.href;
            // Use native Web Share API (Samsung Browser, Chrome, etc.)
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: document.title,
                        text: `💡 ${benefit?.title ?? ''} — 혜택알리미에서 확인하세요!`,
                        url
                    });
                    setShared(true);
                    setTimeout({
                        "DetailPage.useCallback[handleShare]": ()=>setShared(false)
                    }["DetailPage.useCallback[handleShare]"], 3000);
                } catch (err) {
                    // AbortError = user cancelled — no-op
                    if (err?.name !== 'AbortError') {
                        // Fallback: copy to clipboard
                        navigator.clipboard?.writeText(url).then({
                            "DetailPage.useCallback[handleShare]": ()=>{
                                setShared(true);
                                setTimeout({
                                    "DetailPage.useCallback[handleShare]": ()=>setShared(false)
                                }["DetailPage.useCallback[handleShare]"], 3000);
                            }
                        }["DetailPage.useCallback[handleShare]"]);
                    }
                }
            } else {
                // Desktop fallback: copy link
                await navigator.clipboard?.writeText(url);
                setShared(true);
                setTimeout({
                    "DetailPage.useCallback[handleShare]": ()=>setShared(false)
                }["DetailPage.useCallback[handleShare]"], 3000);
            }
        }
    }["DetailPage.useCallback[handleShare]"], [
        benefit
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DetailPage.useEffect": ()=>{
            async function loadData() {
                try {
                    // 1. Load basic benefit from list API
                    const listRes = await fetch('/api/benefits');
                    if (listRes.ok) {
                        const listJson = await listRes.json();
                        const found = listJson.data.find({
                            "DetailPage.useEffect.loadData.found": (b)=>b.id === id
                        }["DetailPage.useEffect.loadData.found"]);
                        if (found) setBenefit(found);
                    }
                    // 2. Load detailed info from detail API
                    const detailRes = await fetch(`/api/benefits/${id}`);
                    if (detailRes.ok) {
                        const detailJson = await detailRes.json();
                        if (detailJson.success && detailJson.source === 'api') {
                            setApiDetail(detailJson.data);
                        } else if (detailJson.success && detailJson.source === 'mock') {
                            // mock detail returned the Benefit directly
                            setBenefit(detailJson.data);
                        }
                    }
                } catch (err) {
                    console.error(err);
                } finally{
                    setLoading(false);
                }
            }
            loadData();
        }
    }["DetailPage.useEffect"], [
        id
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                    lineNumber: 106,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "page-content",
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        style: {
                            textAlign: 'center',
                            color: 'var(--text-secondary)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "shimmer",
                                style: {
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    margin: '0 auto 12px'
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "혜택 정보를 불러오고 있습니다..."
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                    lineNumber: 107,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                    lineNumber: 113,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    if (!benefit) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                    lineNumber: 121,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notFound,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            style: {
                                fontSize: 48
                            },
                            children: "🔍"
                        }, void 0, false, {
                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: "혜택 정보를 찾을 수 없습니다"
                        }, void 0, false, {
                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: "btn btn-primary",
                            children: "홈으로"
                        }, void 0, false, {
                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                    lineNumber: 127,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true);
    }
    const title = lang === 'ko' ? benefit.title : benefit.titleEn;
    const amount = lang === 'ko' ? benefit.amount : benefit.amountEn;
    const category = lang === 'ko' ? benefit.categoryLabel : benefit.categoryLabelEn;
    const ministry = apiDetail?.ministry || (lang === 'ko' ? benefit.ministry : benefit.ministryEn);
    const steps = benefit.steps.map((s)=>lang === 'ko' ? {
            title: s.title,
            desc: s.desc
        } : {
            title: s.titleEn,
            desc: s.descEn
        });
    const docs = apiDetail?.requiredDocs?.length ? apiDetail.requiredDocs : lang === 'ko' ? benefit.documents : benefit.documentsEn;
    const checks = benefit.eligibilityChecks;
    const fulfilled = checks.filter((c)=>c.pass).length;
    // Helper: render multi-line text as paragraphs
    const renderText = (text)=>{
        if (!text) return null;
        return text.split('\n').filter((l)=>l.trim()).map((line, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    margin: '4px 0',
                    lineHeight: 1.6,
                    color: 'var(--text-secondary)',
                    fontSize: 14
                },
                children: line
            }, i, false, {
                fileName: "[project]/src/app/detail/[id]/page.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this));
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$TopBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/detail/[id]/page.tsx",
                lineNumber: 151,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "page-content",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].detailHeader,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/search",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].backBtn,
                                children: "‹"
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].headerTitle,
                                children: t.benefitDetail
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 156,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].bookmarkBtn,
                                onClick: ()=>toggleBookmark(benefit.id),
                                "aria-label": "북마크",
                                children: isBookmarked(benefit.id) ? '❤️' : '🤍'
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 157,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroCard,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroTop,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "badge badge-purple-soft",
                                        children: category
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 169,
                                        columnNumber: 13
                                    }, this),
                                    benefit.dDay >= 0 && benefit.dDay <= 30 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `badge ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDDayColor"])(benefit.dDay)}`,
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$benefits$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDDayText"])(benefit.dDay, lang === 'ko' ? 'ko' : 'en')
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 171,
                                        columnNumber: 15
                                    }, this),
                                    apiDetail?.supportType && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "badge badge-coral-soft",
                                        children: apiDetail.supportType
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 176,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 168,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroTitle,
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 179,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroAmount,
                                children: amount
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 180,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].heroMinistry,
                                children: [
                                    "📌 ",
                                    ministry
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 181,
                                columnNumber: 11
                            }, this),
                            apiDetail?.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 13,
                                    color: 'var(--text-secondary)',
                                    marginTop: 4
                                },
                                children: [
                                    "📞 ",
                                    apiDetail.phone
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 183,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    apiDetail?.overview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: "📋 서비스 개요"
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 192,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].textBlock,
                                children: renderText(apiDetail.overview)
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 193,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, this),
                    apiDetail?.targetDetail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: "👤 지원 대상"
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 199,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].textBlock,
                                children: renderText(apiDetail.targetDetail)
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 200,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 198,
                        columnNumber: 11
                    }, this),
                    apiDetail?.selectionCriteria && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: "📊 선정 기준"
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 206,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].textBlock,
                                children: renderText(apiDetail.selectionCriteria)
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 207,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this),
                    apiDetail?.supportContent && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: "💰 지원 내용"
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 213,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].textBlock,
                                children: renderText(apiDetail.supportContent)
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 214,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 212,
                        columnNumber: 11
                    }, this),
                    (apiDetail?.lifeStages || apiDetail?.targetGroups || apiDetail?.themes) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: "🏷️ 관련 태그"
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 221,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 6
                                },
                                children: [
                                    apiDetail?.lifeStages?.split(',').map((tag, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "badge badge-purple-soft",
                                            children: tag.trim()
                                        }, `life-${i}`, false, {
                                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                                            lineNumber: 224,
                                            columnNumber: 17
                                        }, this)),
                                    apiDetail?.targetGroups?.split(',').map((tag, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "badge badge-coral-soft",
                                            children: tag.trim()
                                        }, `target-${i}`, false, {
                                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                                            lineNumber: 227,
                                            columnNumber: 17
                                        }, this)),
                                    apiDetail?.themes?.split(',').map((tag, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "badge badge-green-soft",
                                            children: tag.trim()
                                        }, `theme-${i}`, false, {
                                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                                            lineNumber: 230,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 222,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 220,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: t.mainInfo
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 238,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoGrid,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoIcon,
                                                style: {
                                                    background: '#EFF6FF'
                                                },
                                                children: "📅"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 241,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoLabel,
                                                        children: t.appPeriod
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 243,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoValue,
                                                        children: [
                                                            benefit.applicationStart,
                                                            " ~ ",
                                                            benefit.applicationEnd
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 244,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 242,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 240,
                                        columnNumber: 13
                                    }, this),
                                    (benefit.targetAge || apiDetail?.lifeStages) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoIcon,
                                                style: {
                                                    background: '#FAF5FF'
                                                },
                                                children: "👤"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 249,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoLabel,
                                                        children: t.targetPerson
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 251,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoValue,
                                                        children: benefit.targetAge || apiDetail?.lifeStages
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 250,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 248,
                                        columnNumber: 15
                                    }, this),
                                    (benefit.incomeLevel || apiDetail?.selectionCriteria) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoIcon,
                                                style: {
                                                    background: '#F0FDF4'
                                                },
                                                children: "💰"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 258,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoLabel,
                                                        children: t.incomeLevel
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 260,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoValue,
                                                        style: {
                                                            fontSize: 13
                                                        },
                                                        children: benefit.incomeLevel || apiDetail?.selectionCriteria?.substring(0, 80) + '...'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 261,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 259,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 257,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoIcon,
                                                style: {
                                                    background: '#FFF0ED'
                                                },
                                                children: "🏦"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 268,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoLabel,
                                                        children: t.paymentMethod
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 270,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoValue,
                                                        children: apiDetail?.supportType || t.monthlyTransfer
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 271,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 269,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 267,
                                        columnNumber: 13
                                    }, this),
                                    apiDetail?.supportCycle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoIcon,
                                                style: {
                                                    background: '#FFFBEB'
                                                },
                                                children: "🔄"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 276,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoLabel,
                                                        children: "지원 주기"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 278,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].infoValue,
                                                        children: apiDetail.supportCycle
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 279,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 277,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 275,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 239,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].eligCard,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].eligHeader,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "section-title",
                                            children: t.myEligibility
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                                            lineNumber: 290,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].eligCount,
                                            children: t.eligibilityCheck(fulfilled, checks.length)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                                            lineNumber: 291,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                                    lineNumber: 289,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "progress-bar mb-12",
                                    style: {
                                        marginBottom: 16
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "progress-fill green",
                                        style: {
                                            width: `${fulfilled / checks.length * 100}%`
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 294,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                                    lineNumber: 293,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkList,
                                    children: checks.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkItem,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: c.pass ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkPass : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkFail,
                                                    children: c.pass ? '✅' : '⚠️'
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                    lineNumber: 302,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkLabel,
                                                    children: lang === 'ko' ? c.label : c.labelEn
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                    lineNumber: 305,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].checkBadge} ${c.pass ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].passBadge : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].failBadge}`,
                                                    children: c.pass ? t.pass : t.fail
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                    lineNumber: 306,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, i, true, {
                                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                                            lineNumber: 301,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/detail/[id]/page.tsx",
                                    lineNumber: 299,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/detail/[id]/page.tsx",
                            lineNumber: 288,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 287,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ai$2f$AiEligibilityCheck$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        benefitId: benefit.id,
                        benefitTitle: title
                    }, void 0, false, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 316,
                        columnNumber: 9
                    }, this),
                    apiDetail?.applicationMethods && apiDetail.applicationMethods.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: "📝 신청 방법"
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 324,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepList,
                                children: apiDetail.applicationMethods.map((method, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepNum,
                                                children: i + 1
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 328,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepContent,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepTitle,
                                                        children: method
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 330,
                                                        columnNumber: 21
                                                    }, this),
                                                    apiDetail.applicationLinks[i] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                        href: apiDetail.applicationLinks[i],
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                        style: {
                                                            fontSize: 13,
                                                            color: 'var(--primary)'
                                                        },
                                                        children: "바로가기 →"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 332,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 329,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 327,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 325,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 323,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: t.howToApply
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 348,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepList,
                                children: steps.map((step, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepNum,
                                                children: i + 1
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 352,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepContent,
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepTitle,
                                                        children: step.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 354,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].stepDesc,
                                                        children: step.desc
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                        lineNumber: 355,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 353,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 351,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 349,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 347,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: t.requiredDocuments
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 365,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docList,
                                children: docs.map((doc, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docIcon,
                                                children: "📄"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 369,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docName,
                                                children: doc
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 370,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 368,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 366,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 364,
                        columnNumber: 9
                    }, this),
                    apiDetail?.relatedLaws && apiDetail.relatedLaws.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: "⚖️ 관련 법령"
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 379,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docList,
                                children: apiDetail.relatedLaws.map((law, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docIcon,
                                                children: "📜"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 383,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docName,
                                                children: law
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 384,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 382,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 380,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 378,
                        columnNumber: 11
                    }, this),
                    apiDetail?.homepages && apiDetail.homepages.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "section-title mb-12",
                                children: "🔗 관련 홈페이지"
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 394,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docList,
                                children: apiDetail.homepages.map((hp, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docItem,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].docIcon,
                                                children: "🌐"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 398,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: hp.url,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                style: {
                                                    color: 'var(--primary)',
                                                    fontSize: 14
                                                },
                                                children: hp.name || hp.url
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                                lineNumber: 399,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                                        lineNumber: 397,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 395,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 393,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].ctaArea,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: `btn ${shared ? 'btn-success' : 'btn-kakao'} ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].kakaoBtn}`,
                                onClick: handleShare,
                                children: shared ? '✅ 링크 복사됨!' : '📤 공유하기'
                            }, void 0, false, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 410,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: benefit.applyUrl,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: `btn btn-primary ${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$detail$2f5b$id$5d2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].applyBtn}`,
                                children: [
                                    t.applyNow,
                                    " →"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/detail/[id]/page.tsx",
                                lineNumber: 416,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/detail/[id]/page.tsx",
                        lineNumber: 409,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/detail/[id]/page.tsx",
                lineNumber: 152,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$BottomNav$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/app/detail/[id]/page.tsx",
                lineNumber: 426,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(DetailPage, "ffskY6QxAWzyKVZtE4mJPHdy2NE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$context$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApp"]
    ];
});
_c = DetailPage;
var _c;
__turbopack_context__.k.register(_c, "DetailPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_c93d87cb._.js.map