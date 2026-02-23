'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

// =====================
// i18n 딕셔너리
// =====================
export const translations = {
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
    greeting: (name: string) => `안녕하세요, ${name}님 👋`,
    guestGreeting: '혜택을 찾아드릴게요! 👋',
    urgentSubtitle: (count: number) => `맞춤 혜택 ${count}건이 곧 마감됩니다!`,
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
    benefitsOnDate: (date: string) => `${date} 마감 혜택`,
    noBenefits: '해당 날짜에 마감되는 혜택이 없습니다.',
    urgentBannerTitle: (count: number) => `${count}개 혜택 마감 임박!`,
    urgentBannerSub: (name: string, extra: number) => `${name} 외 ${extra}건 — 놓치지 마세요`,
    calMonthTitle: (year: number, month: number) => `${year}년 ${month}월`,
    calHint: '마감일 기준으로 표시됩니다',
    calDayNames: ['일', '월', '화', '수', '목', '금', '토'],
    monthlyDeadlineTitle: (month: number, count: number) => `📋 ${month}월 마감 혜택 (${count}건)`,
    noMonthlyDeadline: '이번 달 마감 혜택이 없습니다',
    alwaysOpenTitle: (count: number) => `🟢 상시 신청 가능 (${count}건)`,
    alwaysOpenBadge: '상시',
    showMoreBenefits: (count: number) => `+${count}건 더 보기 →`,
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
    eligibilityCheck: (fulfilled: number, total: number) => `자격 조건 ${fulfilled}/${total} 충족`,
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
    underPercent: (pct: number) => `${pct}% 이하`,
  },
  en: {
    appName: 'BenefitBell',
    appTagline: 'Your personalized benefit alerts',
    home: 'Home',
    search: 'Search',
    calendar: 'Calendar',
    myPage: 'My Page',
    aiRecommend: 'AI',
    greeting: (name: string) => `Hello, ${name}! 👋`,
    guestGreeting: 'Find your benefits! 👋',
    urgentSubtitle: (count: number) => `${count} of your benefits are closing soon!`,
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
    benefitsOnDate: (date: string) => `Deadlines on ${date}`,
    noBenefits: 'No benefits closing on this date.',
    urgentBannerTitle: (count: number) => `${count} benefit(s) closing soon!`,
    urgentBannerSub: (name: string, extra: number) => `${name} and ${extra} more — don't miss out`,
    calMonthTitle: (year: number, month: number) => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      return `${months[month - 1]} ${year}`
    },
    calHint: 'Sorted by deadline',
    calDayNames: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    monthlyDeadlineTitle: (month: number, count: number) => {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      return `📋 ${months[month - 1]} Deadlines (${count})`
    },
    noMonthlyDeadline: 'No deadlines this month',
    alwaysOpenTitle: (count: number) => `🟢 Always Open (${count})`,
    alwaysOpenBadge: 'Open',
    showMoreBenefits: (count: number) => `+${count} more →`,
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
    eligibilityCheck: (fulfilled: number, total: number) => `${fulfilled}/${total} Conditions Met`,
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
    underPercent: (pct: number) => `Under ${pct}%`,
  }
}

export type Lang = 'ko' | 'en'
export type Translations = typeof translations.ko

// =====================
// Context
// =====================
interface AppContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
  theme: 'light' | 'dark'
  toggleTheme: () => void
  bookmarks: string[]
  toggleBookmark: (id: string) => void
  isBookmarked: (id: string) => boolean
  userProfile: UserProfile
  setUserProfile: (p: UserProfile) => void
  kakaoUser: { nickname: string; profile_image?: string } | null
  setKakaoUser: (u: { nickname: string; profile_image?: string } | null) => void
}

export interface UserProfile {
  name: string
  birthYear: number
  gender: 'male' | 'female'
  region: string
  householdSize: number
  incomePercent: number
  housingType: 'monthly' | 'deposit' | 'owned'
  employmentStatus: 'jobSeeking' | 'employed' | 'selfEmployed' | 'student'
  specialStatus: string[]
  kakaoAlerts: boolean
  alertDays: number[]
}

const defaultProfile: UserProfile = {
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
  alertDays: [7, 3],
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('ko')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile)
  const [kakaoUser, setKakaoUser] = useState<{ nickname: string; profile_image?: string } | null>(null)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const savedLang = localStorage.getItem('lang') as Lang | null
    const savedBookmarks = localStorage.getItem('bookmarks')
    const savedProfile = localStorage.getItem('userProfile')
    if (savedTheme) setTheme(savedTheme)
    if (savedLang) setLang(savedLang)
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks))
    if (savedProfile) setUserProfile(JSON.parse(savedProfile))
    // Load kakao user from cookie (set by /api/auth/kakao/callback)
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '')
      return null
    }
    const kakaoProfileCookie = getCookie('kakao_profile')
    if (kakaoProfileCookie) {
      try {
        const data = JSON.parse(kakaoProfileCookie)
        if (data.name) {
          setKakaoUser({ nickname: data.name, profile_image: data.profile_image })
        }
      } catch (e) {
        console.error('Failed to parse kakao_profile cookie', e)
      }
    }

  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  const toggleBookmark = (id: string) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

  const isBookmarked = (id: string) => bookmarks.includes(id)

  const t = translations[lang]

  return (
    <AppContext.Provider value={{
      lang, setLang, t, theme, toggleTheme,
      bookmarks, toggleBookmark, isBookmarked,
      userProfile, setUserProfile,
      kakaoUser, setKakaoUser,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
