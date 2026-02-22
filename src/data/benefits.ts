// 혜택 데이터 타입 정의 및 모의 데이터

export type BenefitCategory =
  | 'basic-living'    // 기초생활수급
  | 'near-poverty'    // 차상위계층
  | 'youth'           // 청년
  | 'middle-aged'     // 장년
  | 'senior'          // 노인
  | 'housing'         // 주거
  | 'medical'         // 의료
  | 'education'       // 교육
  | 'employment'      // 취업

export type BenefitStatus = 'open' | 'upcoming' | 'closed'

export interface Benefit {
  id: string
  title: string
  titleEn: string
  category: BenefitCategory
  categoryLabel: string
  categoryLabelEn: string
  amount: string
  amountEn: string
  description: string
  descriptionEn: string
  targetAge?: string
  incomeLevel?: string
  applicationStart: string
  applicationEnd: string
  dDay: number  // negative = closed, 0 = today, positive = days remaining
  status: BenefitStatus
  applyUrl: string
  ministry: string
  ministryEn: string
  steps: { title: string; titleEn: string; desc: string; descEn: string }[]
  documents: string[]
  documentsEn: string[]
  eligibilityChecks: { label: string; labelEn: string; pass: boolean }[]
  popular?: boolean
  new?: boolean
}

export const BENEFITS: Benefit[] = [
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
      { title: '복지로 접속', titleEn: 'Visit Bokjiro', desc: '복지로 웹사이트 또는 앱에 접속합니다.', descEn: 'Go to bokjiro.go.kr or the Bokjiro app.' },
      { title: '본인인증', titleEn: 'Identity Verification', desc: '공동인증서 또는 간편인증으로 본인인증합니다.', descEn: 'Verify identity via certificate or easy-auth.' },
      { title: '신청서 작성', titleEn: 'Fill Application', desc: '주소, 소득정보, 임대차계약 정보를 입력합니다.', descEn: 'Enter address, income, and lease info.' },
      { title: '서류 첨부', titleEn: 'Attach Documents', desc: '필요서류를 스캔하여 업로드합니다.', descEn: 'Scan and upload required documents.' },
    ],
    documents: ['주민등록등본', '소득확인증명서', '임대차계약서', '통장 사본'],
    documentsEn: ['Resident Registration', 'Income Certificate', 'Lease Contract', 'Bank Account Copy'],
    eligibilityChecks: [
      { label: '나이 조건 (만 19~34세)', labelEn: 'Age (19-34)', pass: true },
      { label: '소득 조건 (중위소득 60% 이하)', labelEn: 'Income (≤60% median)', pass: true },
      { label: '무주택 확인 필요', labelEn: 'No Home Ownership Required', pass: false },
    ],
    popular: true,
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
      { title: '주민센터 방문', titleEn: 'Visit Community Center', desc: '거주지 관할 주민센터를 방문합니다.', descEn: 'Visit your local community center.' },
      { title: '신청서 제출', titleEn: 'Submit Application', desc: '사회보장급여신청서를 작성하여 제출합니다.', descEn: 'Fill and submit the social security application.' },
      { title: '자산·소득 조사', titleEn: 'Asset/Income Survey', desc: '담당자가 가구 자산 및 소득을 조사합니다.', descEn: 'Staff investigates household assets and income.' },
      { title: '결정 통보', titleEn: 'Decision Notice', desc: '약 30일 내 수급자 결정 통보를 받습니다.', descEn: 'Receive decision notice within ~30 days.' },
    ],
    documents: ['주민등록등본', '가족관계증명서', '금융정보 동의서', '소득재산신고서'],
    documentsEn: ['Resident Registration', 'Family Certificate', 'Financial Info Consent', 'Income Declaration'],
    eligibilityChecks: [
      { label: '소득인정액 기준 충족', labelEn: 'Income Threshold Met', pass: true },
      { label: '부양의무자 기준 확인 필요', labelEn: 'Support Obligation Check Needed', pass: false },
    ],
    popular: true,
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
      { title: '주민센터 신청', titleEn: 'Apply at Community Center', desc: '거주지 주민센터에 방문하여 신청합니다.', descEn: 'Visit your community center to apply.' },
      { title: '서류 제출', titleEn: 'Submit Documents', desc: '필요서류를 준비하여 제출합니다.', descEn: 'Prepare and submit required documents.' },
      { title: '심사', titleEn: 'Review', desc: '자격 요건 심사가 진행됩니다.', descEn: 'Eligibility review process.' },
      { title: '지원 결정', titleEn: 'Support Decision', desc: '지원 여부 및 금액이 결정됩니다.', descEn: 'Support amount and eligibility determined.' },
    ],
    documents: ['주민등록등본', '의료비 영수증', '소득확인서'],
    documentsEn: ['Resident Registration', 'Medical Receipts', 'Income Certificate'],
    eligibilityChecks: [
      { label: '차상위계층 해당', labelEn: 'Near-Poverty Status', pass: true },
      { label: '의료비 신청 요건', labelEn: 'Medical Eligibility', pass: true },
      { label: '최근 6개월 의료비 내역', labelEn: '6-Month Medical History Needed', pass: false },
    ],
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
      { title: '복지로 or 앱 접속', titleEn: 'Visit Bokjiro or App', desc: '복지로, 정부24, 주민센터 중 선택합니다.', descEn: 'Choose Bokjiro, Gov24, or Community Center.' },
      { title: '자녀 정보 입력', titleEn: 'Enter Child Info', desc: '자녀의 생년월일 등을 입력합니다.', descEn: 'Enter child\'s birth date and info.' },
      { title: '계좌 등록', titleEn: 'Register Bank Account', desc: '급여를 받을 계좌를 등록합니다.', descEn: 'Register bank account for deposit.' },
      { title: '신청 완료', titleEn: 'Application Complete', desc: '매월 25일 지급됩니다.', descEn: 'Paid on the 25th of every month.' },
    ],
    documents: ['출생증명서 or 주민등록등본', '부모 신분증'],
    documentsEn: ['Birth Certificate or Resident Registration', 'Parent ID'],
    eligibilityChecks: [
      { label: '만 0~1세 자녀 보유', labelEn: 'Child age 0-1', pass: true },
      { label: '국내 거주 중인 대한민국 국민', labelEn: 'Korean Resident', pass: true },
    ],
    popular: true,
    new: true,
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
      { title: '주민센터 방문 or 온라인', titleEn: 'Visit Center or Online', desc: '주민센터 방문 또는 복지로에서 신청합니다.', descEn: 'Apply at community center or Bokjiro.' },
      { title: '소득·재산 확인', titleEn: 'Income/Asset Check', desc: '소득 및 재산 조회가 진행됩니다.', descEn: 'Income and asset review.' },
      { title: '결정 통보', titleEn: 'Decision', desc: '약 30일 내 지급 여부 결정됩니다.', descEn: 'Decision made within ~30 days.' },
    ],
    documents: ['신분증', '통장 사본'],
    documentsEn: ['ID Card', 'Bank Account Copy'],
    eligibilityChecks: [
      { label: '만 65세 이상', labelEn: 'Age 65+', pass: true },
      { label: '소득 하위 70% 해당', labelEn: 'Bottom 70% Income', pass: true },
    ],
    popular: true,
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
      { title: '은행 앱에서 신청', titleEn: 'Apply via Bank App', desc: '참여 은행 앱에서 청년도약계좌를 신청합니다.', descEn: 'Apply through participating bank apps.' },
      { title: '소득 확인', titleEn: 'Income Verification', desc: '국세청 소득 자료 조회 동의 후 확인합니다.', descEn: 'Consent to NTS income data inquiry.' },
      { title: '계좌 개설', titleEn: 'Account Opening', desc: '심사 통과 후 계좌가 개설됩니다.', descEn: 'Account opened after approval.' },
      { title: '납입 시작', titleEn: 'Start Deposits', desc: '매월 납입하면 정부기여금이 지급됩니다.', descEn: 'Monthly deposit with government contribution.' },
    ],
    documents: ['신분증', '소득 확인 서류'],
    documentsEn: ['ID Card', 'Income Documents'],
    eligibilityChecks: [
      { label: '나이 (만 19~34세)', labelEn: 'Age 19-34', pass: true },
      { label: '총급여 7,500만원 이하', labelEn: 'Income ≤ ₩75M', pass: true },
      { label: '직전년도 금융소득 2,000만원 이하', labelEn: 'Financial Income ≤ ₩20M', pass: true },
    ],
    new: true,
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
      { title: 'K-패스 앱 다운로드', titleEn: 'Download K-Pass App', desc: 'K-패스 앱을 설치합니다.', descEn: 'Install the K-Pass app.' },
      { title: '회원가입', titleEn: 'Sign Up', desc: '본인인증 후 회원가입합니다.', descEn: 'Sign up with identity verification.' },
      { title: 'K-패스 카드 발급', titleEn: 'Get K-Pass Card', desc: '연계 카드사에서 K-패스 카드를 발급받습니다.', descEn: 'Get K-Pass card from partner card company.' },
      { title: '환급 수령', titleEn: 'Receive Refund', desc: '월 15회 이상 이용 시 다음달 환급됩니다.', descEn: 'Refund received next month after 15+ uses.' },
    ],
    documents: ['본인 명의 카드'],
    documentsEn: ['Personal Credit/Debit Card'],
    eligibilityChecks: [
      { label: '대한민국 국민', labelEn: 'Korean Citizen', pass: true },
      { label: '월 15회 이상 이용', labelEn: '15+ Monthly Uses', pass: true },
    ],
    popular: true,
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
      { title: '주민센터 방문', titleEn: 'Visit Community Center', desc: '거주지 주민센터를 방문합니다.', descEn: 'Visit your local community center.' },
      { title: '장애정도 확인', titleEn: 'Disability Level Check', desc: '중증장애인 여부가 확인됩니다.', descEn: 'Severity of disability is verified.' },
      { title: '소득·재산 조사', titleEn: 'Income/Asset Survey', desc: '소득 및 재산 조회가 진행됩니다.', descEn: 'Income and asset review.' },
      { title: '지급 결정', titleEn: 'Payment Decision', desc: '매월 20일 지급됩니다.', descEn: 'Paid on the 20th of every month.' },
    ],
    documents: ['장애인 등록증', '신분증', '통장 사본'],
    documentsEn: ['Disability Certificate', 'ID Card', 'Bank Account Copy'],
    eligibilityChecks: [
      { label: '중증장애인 등록', labelEn: 'Registered Severe Disability', pass: true },
      { label: '만 18세 이상', labelEn: 'Age 18+', pass: true },
      { label: '소득 하위 70%', labelEn: 'Bottom 70% Income', pass: false },
    ],
  },
]

// Helper functions
export function getBenefitById(id: string): Benefit | undefined {
  return BENEFITS.find(b => b.id === id)
}

export function getBenefitsByCategory(category: BenefitCategory): Benefit[] {
  return BENEFITS.filter(b => b.category === category)
}

export function getUrgentBenefits(maxDays: number = 14): Benefit[] {
  return BENEFITS.filter(b => b.dDay >= 0 && b.dDay <= maxDays && b.status === 'open')
    .sort((a, b) => a.dDay - b.dDay)
}

export function getPopularBenefits(): Benefit[] {
  return BENEFITS.filter(b => b.popular)
}

export function getDDayColor(dDay: number): string {
  if (dDay <= 3) return 'badge-red'
  if (dDay <= 7) return 'badge-orange'
  if (dDay <= 14) return 'badge-blue'
  return 'badge-green'
}

export function getDDayText(dDay: number, lang: 'ko' | 'en' = 'ko'): string {
  if (dDay < 0) return lang === 'ko' ? '마감' : 'Closed'
  if (dDay === 0) return lang === 'ko' ? 'D-day' : 'Today!'
  return `D-${dDay}`
}

export const CATEGORY_INFO = {
  'basic-living': { label: '기초생활수급', labelEn: 'Basic Living', icon: '🏠', color: '#FF6B4A' },
  'near-poverty': { label: '차상위계층', labelEn: 'Near Poverty', icon: '👥', color: '#3B82F6' },
  'youth': { label: '청년 지원', labelEn: 'Youth', icon: '⭐', color: '#A855F7' },
  'middle-aged': { label: '장년 지원', labelEn: 'Middle-Aged', icon: '💼', color: '#22C55E' },
  'senior': { label: '노인 복지', labelEn: 'Senior', icon: '❤️', color: '#F97316' },
  'housing': { label: '주거 지원', labelEn: 'Housing', icon: '🏡', color: '#6366F1' },
  'medical': { label: '의료 지원', labelEn: 'Medical', icon: '🏥', color: '#EC4899' },
  'education': { label: '교육 지원', labelEn: 'Education', icon: '📚', color: '#14B8A6' },
  'employment': { label: '취업 지원', labelEn: 'Employment', icon: '💪', color: '#EAB308' },
}
