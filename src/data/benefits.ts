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
  | 'small-biz'       // 소상공인 지원
  | 'startup'         // 창업 지원
  | 'closure-restart' // 폐업·재창업
  | 'debt-relief'     // 채무조정·회생

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
      { title: '온라인 신청', titleEn: 'Online Application', desc: '소상공인 정책자금 사이트(ols.semas.or.kr)에서 신청합니다.', descEn: 'Apply at ols.semas.or.kr.' },
      { title: '서류 제출', titleEn: 'Submit Documents', desc: '사업자등록증, 매출 증빙 등 서류를 제출합니다.', descEn: 'Submit business registration, revenue proof, etc.' },
      { title: '심사·면담', titleEn: 'Review & Interview', desc: '소진공 지역센터에서 현장 확인 및 면담이 진행됩니다.', descEn: 'Site visit and interview at SEMAS regional center.' },
      { title: '대출 실행', titleEn: 'Loan Disbursement', desc: '심사 통과 후 협약 은행에서 대출이 실행됩니다.', descEn: 'Loan is disbursed through partner bank after approval.' },
    ],
    documents: ['사업자등록증', '부가가치세 과세표준증명', '소득금액증명원', '국세·지방세 납세증명서'],
    documentsEn: ['Business Registration', 'VAT Tax Base Certificate', 'Income Certificate', 'Tax Payment Certificate'],
    eligibilityChecks: [
      { label: '소상공인 해당 (상시근로자 5인 미만)', labelEn: 'SME status (<5 employees)', pass: true },
      { label: '세금 체납 없음', labelEn: 'No tax delinquency', pass: true },
      { label: '신용 불량 여부 확인 필요', labelEn: 'Credit check required', pass: false },
    ],
    popular: true,
    new: true,
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
      { title: '자격 확인', titleEn: 'Check Eligibility', desc: '기존 대출 금리 7% 이상, NCB 신용점수 919점 이하 확인합니다.', descEn: 'Verify existing loan rate 7%+ and NCB score ≤919.' },
      { title: '온라인 신청', titleEn: 'Online Application', desc: '소진공 정책자금 사이트에서 신청합니다.', descEn: 'Apply at SEMAS online portal.' },
      { title: '심사', titleEn: 'Review', desc: '기존 대출 내역 및 상환 능력을 심사합니다.', descEn: 'Review existing loans and repayment capacity.' },
      { title: '대환 실행', titleEn: 'Loan Conversion', desc: '기존 고금리 대출을 상환하고 저금리로 전환됩니다.', descEn: 'Existing high-rate loan is repaid and converted to low rate.' },
    ],
    documents: ['사업자등록증', '기존 대출 확인서', '신용정보 조회 동의서', '소득 증빙 서류'],
    documentsEn: ['Business Registration', 'Existing Loan Confirmation', 'Credit Check Consent', 'Income Proof'],
    eligibilityChecks: [
      { label: '기존 대출 금리 7% 이상', labelEn: 'Existing loan rate 7%+', pass: true },
      { label: 'NCB 신용점수 919점 이하', labelEn: 'NCB credit score ≤919', pass: false },
      { label: '소상공인 자격 확인', labelEn: 'SME status confirmed', pass: true },
    ],
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
      { title: '자격 확인', titleEn: 'Check Eligibility', desc: '재창업자 또는 채무조정 성실상환자 여부를 확인합니다.', descEn: 'Verify re-startup status or faithful debt repayment.' },
      { title: '신청서 작성', titleEn: 'Fill Application', desc: '사업계획서와 함께 신청서를 작성합니다.', descEn: 'Complete application with business plan.' },
      { title: '현장 실사', titleEn: 'On-site Review', desc: '소진공 담당자가 사업장을 방문하여 확인합니다.', descEn: 'SEMAS officer visits business site for verification.' },
      { title: '대출 실행', titleEn: 'Loan Disbursement', desc: '승인 후 협약 은행을 통해 대출이 실행됩니다.', descEn: 'Loan disbursed through partner bank after approval.' },
    ],
    documents: ['사업자등록증', '폐업사실증명원', '채무조정 이행확인서', '사업계획서'],
    documentsEn: ['Business Registration', 'Business Closure Certificate', 'Debt Adjustment Compliance', 'Business Plan'],
    eligibilityChecks: [
      { label: '재창업 또는 채무조정 이행 중', labelEn: 'Re-startup or debt adjustment in progress', pass: true },
      { label: '폐업 이력 확인', labelEn: 'Business closure history confirmed', pass: true },
      { label: '세금 체납 확인 필요', labelEn: 'Tax delinquency check required', pass: false },
    ],
    new: true,
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
      { title: 'K-Startup 접속', titleEn: 'Visit K-Startup', desc: 'K-스타트업 사이트에서 사업 공고를 확인합니다.', descEn: 'Check announcements at k-startup.go.kr.' },
      { title: '사업계획서 작성', titleEn: 'Write Business Plan', desc: '혁신 아이템 중심의 사업계획서를 작성합니다.', descEn: 'Write a business plan focused on innovative items.' },
      { title: '서류·발표 평가', titleEn: 'Document & Pitch Eval', desc: '서류 심사 후 발표(피칭) 평가를 진행합니다.', descEn: 'Document review followed by pitch evaluation.' },
      { title: '선정·협약', titleEn: 'Selection & Agreement', desc: '선정 후 사업자등록 및 협약을 체결합니다.', descEn: 'Register business and sign agreement after selection.' },
    ],
    documents: ['사업계획서', '신분증', '졸업증명서 (해당 시)', '특허·지식재산권 증빙 (해당 시)'],
    documentsEn: ['Business Plan', 'ID Card', 'Diploma (if applicable)', 'Patent/IP Proof (if applicable)'],
    eligibilityChecks: [
      { label: '사업자등록 미완료 (예비창업자)', labelEn: 'No business registration (pre-entrepreneur)', pass: true },
      { label: '혁신 아이디어 보유', labelEn: 'Has innovative idea', pass: true },
      { label: '연령 제한 없음', labelEn: 'No age limit', pass: true },
    ],
    popular: true,
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
      { title: '공고 확인', titleEn: 'Check Announcement', desc: 'K-스타트업에서 모집 공고를 확인합니다.', descEn: 'Check recruitment notice at K-Startup.' },
      { title: '온라인 접수', titleEn: 'Online Registration', desc: '사업계획서와 함께 온라인으로 접수합니다.', descEn: 'Register online with business plan.' },
      { title: '심층 인터뷰', titleEn: 'In-depth Interview', desc: '서류 통과 후 심층 인터뷰(발표 평가)를 진행합니다.', descEn: 'In-depth interview after document screening.' },
      { title: '협약 체결', titleEn: 'Sign Agreement', desc: '최종 선정 후 협약을 체결하고 자금이 지원됩니다.', descEn: 'Sign agreement and receive funding after final selection.' },
    ],
    documents: ['사업자등록증', '사업계획서', '법인등기부등본 (법인)', '재무제표'],
    documentsEn: ['Business Registration', 'Business Plan', 'Corporate Registry (Corp)', 'Financial Statements'],
    eligibilityChecks: [
      { label: '창업 3년 이내', labelEn: 'Within 3 years of founding', pass: true },
      { label: '자부담 30% 가능', labelEn: 'Can cover 30% self-funding', pass: false },
      { label: '유흥업·부동산업 제외', labelEn: 'Excludes entertainment/real estate', pass: true },
    ],
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
      { title: '온라인 접수', titleEn: 'Online Application', desc: '청년창업사관학교 사이트에서 입교 신청합니다.', descEn: 'Apply at Youth Startup Academy website.' },
      { title: '서류 평가', titleEn: 'Document Review', desc: '사업계획서 및 기술력을 서류 평가합니다.', descEn: 'Business plan and technology assessment.' },
      { title: '발표 평가', titleEn: 'Pitch Evaluation', desc: '대면 발표를 통해 사업 아이템을 평가합니다.', descEn: 'In-person pitch evaluation of business idea.' },
      { title: '입교·사업 개시', titleEn: 'Enrollment & Start', desc: '입교 후 사무공간 배정 및 사업을 시작합니다.', descEn: 'Office assigned and business begins after enrollment.' },
    ],
    documents: ['사업계획서', '신분증', '졸업증명서', '병적증명서 (해당 시)'],
    documentsEn: ['Business Plan', 'ID Card', 'Diploma', 'Military Service Certificate (if applicable)'],
    eligibilityChecks: [
      { label: '만 39세 이하', labelEn: 'Age ≤39', pass: true },
      { label: '기술 기반 창업 아이템', labelEn: 'Tech-based startup item', pass: true },
      { label: '금융 불량거래 없음', labelEn: 'No financial default', pass: true },
    ],
    popular: true,
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
      { title: '온라인 신청', titleEn: 'Online Application', desc: '희망리턴패키지 사이트(hope.sbiz.or.kr)에서 접수합니다.', descEn: 'Apply at hope.sbiz.or.kr.' },
      { title: '상담·진단', titleEn: 'Consultation', desc: '전담 상담사가 폐업 상황을 진단합니다.', descEn: 'Dedicated counselor diagnoses closure situation.' },
      { title: '철거 지원', titleEn: 'Demolition Support', desc: '점포 철거 업체 연결 및 비용을 지원합니다.', descEn: 'Connect with demolition company and cover costs.' },
      { title: '후속 연계', titleEn: 'Follow-up Linkage', desc: '재취업·재창업 프로그램으로 연계됩니다.', descEn: 'Linked to re-employment or re-startup programs.' },
    ],
    documents: ['사업자등록증 또는 폐업사실증명원', '신분증', '임대차계약서', '점포 사진'],
    documentsEn: ['Business Registration or Closure Certificate', 'ID Card', 'Lease Contract', 'Store Photos'],
    eligibilityChecks: [
      { label: '사업 운영 60일 이상', labelEn: 'Business operated 60+ days', pass: true },
      { label: '소상공인 자격', labelEn: 'SME qualification', pass: true },
      { label: '폐업 예정 또는 이미 폐업', labelEn: 'Closing or already closed', pass: true },
    ],
    new: true,
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
      { title: '온라인 신청', titleEn: 'Online Application', desc: '희망리턴패키지 사이트에서 재기사업화 모집에 신청합니다.', descEn: 'Apply to the re-startup program at hope.sbiz.or.kr.' },
      { title: '현장 진단', titleEn: 'On-site Diagnosis', desc: '전문가가 사업장을 방문하여 매출 감소 원인을 분석합니다.', descEn: 'Expert visits business to analyze revenue decline.' },
      { title: '맞춤 교육', titleEn: 'Custom Training', desc: '업종 전환, 마케팅 등 맞춤형 교육을 받습니다.', descEn: 'Receive training on industry change, marketing, etc.' },
      { title: '사업화 자금 지원', titleEn: 'Funding', desc: '사업계획 수립 후 최대 2,000만원 자금을 지원받습니다.', descEn: 'Receive up to ₩20M after business plan completion.' },
    ],
    documents: ['폐업사실증명원', '사업계획서', '신분증', '사업자등록증 (재창업 시)'],
    documentsEn: ['Business Closure Certificate', 'Business Plan', 'ID Card', 'Business Registration (for re-startup)'],
    eligibilityChecks: [
      { label: '폐업 소상공인 또는 재창업 1년 이내', labelEn: 'Closed SME or re-started within 1 year', pass: true },
      { label: '새출발기금 채무조정 약정자 포함', labelEn: 'Includes New Start Fund debt adjustment', pass: true },
      { label: '업종 전환 재창업 가능', labelEn: 'Industry change re-startup OK', pass: true },
    ],
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
      { title: '자격 확인', titleEn: 'Check Eligibility', desc: '새출발기금 홈페이지에서 자격 여부를 조회합니다.', descEn: 'Check eligibility at newstartfund.or.kr.' },
      { title: '온라인 신청', titleEn: 'Online Application', desc: '본인인증 후 채무 내역을 조회하고 신청합니다.', descEn: 'Verify identity, check debts, and apply.' },
      { title: '채무조정안 수립', titleEn: 'Adjustment Plan', desc: '캠코(KAMCO)에서 맞춤형 조정안을 수립합니다.', descEn: 'KAMCO creates customized adjustment plan.' },
      { title: '조정 확정·이행', titleEn: 'Confirmation & Execution', desc: '조정안 확정 후 감면/분할 상환을 시작합니다.', descEn: 'After confirmation, begin reduced/installment payments.' },
    ],
    documents: ['신분증', '사업자등록증 또는 폐업증명서', '채무 내역서', '소득 증빙 서류'],
    documentsEn: ['ID Card', 'Business Registration or Closure Certificate', 'Debt Statement', 'Income Proof'],
    eligibilityChecks: [
      { label: '2020.4~2025.6 사업 영위자', labelEn: 'Business operated Apr 2020~Jun 2025', pass: true },
      { label: '90일 이상 연체 (부실차주)', labelEn: '90+ days overdue (delinquent)', pass: false },
      { label: '총 채무 15억원 이하', labelEn: 'Total debt ≤₩1.5B', pass: true },
    ],
    popular: true,
    new: true,
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
      { title: '자격 확인', titleEn: 'Check Eligibility', desc: '무담보 10억, 담보 15억 이하 채무와 지속적 소득 여부를 확인합니다.', descEn: 'Verify debts (unsecured ≤₩1B, secured ≤₩1.5B) and steady income.' },
      { title: '서류 준비', titleEn: 'Prepare Documents', desc: '채무자목록, 재산목록, 소득·지출 명세서를 준비합니다.', descEn: 'Prepare debtor list, asset list, income/expense statements.' },
      { title: '법원 제출', titleEn: 'Court Filing', desc: '관할 법원에 개인회생 신청서를 제출합니다.', descEn: 'Submit personal rehabilitation application to court.' },
      { title: '변제계획 인가', titleEn: 'Repayment Plan Approval', desc: '법원이 변제계획을 인가하면 3~5년간 변제합니다.', descEn: 'Court approves plan, repay over 3~5 years.' },
    ],
    documents: ['신청서', '진술서', '채무자목록', '재산목록', '소득·지출 명세서', '주민등록등본', '가족관계증명서'],
    documentsEn: ['Application', 'Statement', 'Debtor List', 'Asset List', 'Income/Expense Statement', 'Resident Registration', 'Family Relation Certificate'],
    eligibilityChecks: [
      { label: '지속적 소득 있음', labelEn: 'Has steady income', pass: true },
      { label: '무담보 10억/담보 15억 이하', labelEn: 'Unsecured ≤₩1B / Secured ≤₩1.5B', pass: true },
      { label: '변제 곤란 상태', labelEn: 'Unable to repay debts', pass: false },
    ],
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
      { title: '상담 예약', titleEn: 'Book Consultation', desc: '신용회복위원회 홈페이지 또는 지부에서 상담을 예약합니다.', descEn: 'Book consultation at ccrs.or.kr or local branch.' },
      { title: '서류 제출', titleEn: 'Submit Documents', desc: '신분증, 소득 증빙, 연체 내역 등을 제출합니다.', descEn: 'Submit ID, income proof, delinquency records, etc.' },
      { title: '채무조정안 수립', titleEn: 'Adjustment Plan', desc: '채무 현황을 확인하고 조정안을 수립합니다.', descEn: 'Review debt status and create adjustment plan.' },
      { title: '금융기관 동의·개시', titleEn: 'Bank Approval & Start', desc: '금융기관 동의 후 채무조정이 개시되고 추심이 중단됩니다.', descEn: 'After bank consent, adjustment starts and collection stops.' },
    ],
    documents: ['신분증', '소득증빙서류', '연체내역서', '채무확인서'],
    documentsEn: ['ID Card', 'Income Proof', 'Delinquency Records', 'Debt Confirmation'],
    eligibilityChecks: [
      { label: '90일(3개월) 이상 연체', labelEn: '90+ days (3+ months) overdue', pass: true },
      { label: '총 채무 15억원 이하', labelEn: 'Total debt ≤₩1.5B', pass: true },
      { label: '최저생계비 이상 소득', labelEn: 'Income above minimum living cost', pass: false },
    ],
  },
]

// Helper functions
import { calculateDDay } from '@/lib/welfare-api'

/** Get benefit with live D-Day calculation */
function withLiveDDay(b: Benefit): Benefit {
  const dDay = calculateDDay(b.applicationEnd)
  return { ...b, dDay, status: dDay < 0 ? 'closed' as BenefitStatus : 'open' as BenefitStatus }
}

export function getBenefitById(id: string): Benefit | undefined {
  const b = BENEFITS.find(b => b.id === id)
  return b ? withLiveDDay(b) : undefined
}

export function getBenefitsByCategory(category: BenefitCategory): Benefit[] {
  return BENEFITS.filter(b => b.category === category).map(withLiveDDay)
}

export function getUrgentBenefits(maxDays: number = 14): Benefit[] {
  return BENEFITS.map(withLiveDDay)
    .filter(b => b.dDay >= 0 && b.dDay <= maxDays && b.status === 'open')
    .sort((a, b) => a.dDay - b.dDay)
}

export function getPopularBenefits(): Benefit[] {
  return BENEFITS.filter(b => b.popular).map(withLiveDDay)
}

export function getAllBenefitsLive(): Benefit[] {
  return BENEFITS.map(withLiveDDay)
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
  'small-biz': { label: '소상공인 지원', labelEn: 'Small Biz', icon: '🏪', color: '#D97706' },
  'startup': { label: '창업 지원', labelEn: 'Startup', icon: '🚀', color: '#7C3AED' },
  'closure-restart': { label: '폐업·재창업', labelEn: 'Closure & Restart', icon: '🔄', color: '#059669' },
  'debt-relief': { label: '채무조정·회생', labelEn: 'Debt Relief', icon: '⚖️', color: '#0891B2' },
}
