# Project Context — 혜택알리미 (naedon-finder / BenefitBell)

> **최종 갱신**: 2026-03-12 (23:03 KST)
> **경로**: `e:\AI_Programing\naedon-finder`
> **서버**: `npm run dev -- -p 3008` (포트 3008)
> **Firebase App Hosting**: https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app
> **Firebase 프로젝트**: `ai-project-ce41f` (호스팅 + Auth + Firestore + FCM 통합)
> **GitHub**: Hwani-Net/benefitbell → main 브랜치 자동 배포

---

## 🌟 북극성 (존재 이유)

**사용자가 스스로 찾지 않아도 혜택이 먼저 찾아오고, 3초 만에 "나 해당돼/안 해" 결과를 알 수 있는 유일한 앱.**

> 경쟁사(보조금24/캐시노트/정부24/복지로)의 약점 — 광고 범벅, 자격 판단 불가, 정보 과부하 — 을 정면 공략하는 **안티테제 전략** 기반.  
> 전략 문서: `NORTH_STAR.md` (프로젝트 루트)

## 🚫 Anti-Scope (절대 안 만들 것)

- ❌ 대출/카드/적금 광고 알림 (캐시노트가 망한 이유)
- ❌ 보조금 "검색만" 시켜주는 앱 (보조금24가 별점 1.0인 이유)
- ❌ PC 전용 UI / 특정 브라우저 강제 (정부24가 욕먹는 이유)
- ❌ 시스템 자동 재알림 (김짜증 핑퐁에서 확정 — 스팸이 됨)

## 📊 현재 진행률: 100% (출시 준비 완료)

| Phase | 내용 | 상태 |
|-------|------|------|
| 1 | Firebase 기반 설정 (Admin SDK, Client SDK) | ✅ 완료 |
| 2 | 카카오 OAuth → Firebase Custom Token | ✅ 완료 |
| 3 | DB 교체 (Supabase → Firestore) | ✅ 완료 |
| 4 | **킬러 피처 #1: AI 자격 판정 + % 배지** | ✅ 완료 |
| 5 | 킬러 피처 #2: 맞춤 푸시 (발송 이력 체크) | ✅ 완료 |
| 6 | 킬러 피처 #3: 서류 안내 + 원스톱 | ✅ 완료 |
| 7 | FCM 마이그레이션 (VAPID → FCM) | ✅ 완료 |
| 8 | 배포 + 프리미엄 런칭 | ✅ Netlify 배포 완료 (2026-03-03) |
| 9 | AI 프로덕션 검증 | ✅ OpenAI GPT-4.1 nano 연동 + E2E 전수 테스트 통과 (2026-03-11) |
| 10 | **UX 개선 (페르소나 자문 기반)** | ✅ P0~P3 전체 완료 (2026-03-03) |
| 11 | **Netlify → Firebase App Hosting 이전** | ✅ 백엔드 생성 + 시크릿 9개 등록 완료 (2026-03-07) |
| 12 | **QA 감사 + Lint 클린업** | ✅ 에러 0개 달성 (2026-03-10) |
| 13 | **AI 배치 점수 → 규칙 기반 전환** | ✅ API 호출 0건, 즉시 응답 (2026-03-10) |
| 14 | **프로필 확장 + 점수 밸런스 v3** | ✅ maritalStatus/hasChildren 추가, 팀장 리뷰 통과 (2026-03-10) |
| 15 | **UserProfile v4 + 규칙 엔진 v3** | ✅ 11필드 추가(가족·상세·사업자), 15매칭규칙, 3단계 위저드 (2026-03-11) |
| 16 | **Lint 0경고 + 기관 프로그램 필터** | ✅ 코드 완료, ⏳ 프로덕션 배포 대기 (2026-03-11) |

## ✅ TODO

### 출시 최종 점검 (2026-03-10)
- [x] 뇽죵이 Agent v0.7.5 종합 기능 감사 (22항목 전수 통과, S등급)
- [x] `npm run build` 통과 (Next.js 16.1.6 Turbopack)
- [x] `npm run lint` — **경고 27개 → 0 달성** (0 error, 0 warning)
- [x] `.netlify/**` ESLint globalIgnores 추가 (빌드 아티팩트 제외)
- [x] API 라우트 6개 보안+안정성 점검 완료
- [x] SEO/PWA 설정 확인 (OG태그, manifest, sw.js)
- [x] ①번 AI 배치 점수(`/api/ai-eligibility`) → 규칙 기반 전환 (API 과금 제거)
- [x] 프로덕션 환경변수 감사 (22개 매핑 확인, ADC 자동 인증 확인)
- [x] 프로필에 결혼상태/자녀여부 추가 + 규칙 점수 v3 (팀장 리뷰 통과)
- [x] UserProfile v4: 11필드 추가 + 규칙 엔진 v3 (15매칭규칙) + 3단계 위저드 (2026-03-11)
- [x] 카카오 SDK 도메인 등록 — localhost:3008(기존) + Firebase 호스팅 도메인 추가 (2026-03-11)
- [x] Firebase App Hosting 배포 최종 확인 — 7커밋 push + 프로덕션 사이트 정상 로드 (2026-03-11)
- [x] 토스페이먼츠 live키 전환 + 실결제 테스트 (보류)
- [x] 경고 27개 정리 완료 (unused-vars, no-img-element 모두 해결, 0 error / 0 warning 달성)
- [x] 공공데이터 기관/인프라 프로그램 54건 필터링 로직 추가 (리스트+상세+캐시 3중 적용)
- [x] GCP Secret Manager에 `OPENAI_API_KEY` 시크릿 생성 + IAM 바인딩 3개 부여
- [x] ✅ Firebase App Hosting 재배포 확인 완료 (2026-03-11 20:44 KST, 6,187건 정상 표시)
- [x] GPT-4o mini → GPT-4.1 nano 모델 교체 (33% 비용 절약, 2배 속도 향상) (2026-03-11)
- [x] E2E 프로덕션 전수 테스트 **24/24 PASS** — 속도, 추천 품질, 슬라이드, 검색, AI분석, 다크모드, 영어전환, 프로필위저드 (2026-03-11)
- [x] ✅ D-365 기본값 이슈 해결: 상시 프로그램 "상시"/"Year-round" 라벨 + 초록색 배지 (2026-03-11)
- [x] ✅ **카카오 로그인 수정 3건** (2026-03-12):
  - Secret trailing newline → `Bad client credentials` 해결 (PITFALLS #15)
  - stale closure 버그 → 프로필 초기화 해결 (`setUserProfile(prev => ...)` 패턴)
  - `SetStateAction<UserProfile>` 타입 수정
- [x] ✅ **프로덕션 Firestore 500 에러 해결** (2026-03-12):
  - 원인: App Hosting(ai-project-ce41f) ≠ Firestore(benefitbell-565b2) 프로젝트 분리
  - 해결: `FIREBASE_SERVICE_ACCOUNT_KEY` Secret 추가 + IAM 바인딩 (PITFALLS #16)
- [x] ✅ **프로덕션 Firestore API 정상 동작 확인 완료** (2026-03-12 12:10 KST)
  - 원인: `FIREBASE_SERVICE_ACCOUNT_KEY` Secret에 IAM `grantaccess` 미부여 → 빌드 실패 반복
  - 해결: `firebase apphosting:secrets:grantaccess` 실행
- [x] ✅ 프로덕션 Firestore API 정상 동작 확인 완료 (2026-03-12 14:56 KST)
  - 홈페이지 정상 로드, 카카오 로그인 세션 유지, 프로필 21필드 Firestore 읽기 정상
  - ⚠️ 프로필 헤더 시군구 표시 인코딩 깨짐 발견 (Firestore 데이터 문제, 코드 이슈 아님)
- [x] ✅ **Firestore 프로젝트 통합 완료** (2026-03-12 16:10 KST)
  - `benefitbell-565b2` → `ai-project-ce41f`로 데이터 마이그레이션 (13문서)
  - `firebase-admin.ts`: SA Key 크로스-프로젝트 → ADC 단일 프로젝트 전환
  - `apphosting.yaml`: `FIREBASE_SERVICE_ACCOUNT_KEY` 시크릿 제거
- [x] ✅ 프로필 시군구 인코딩 깨짐 수정 완료 (2026-03-12 15:20 KST)
  - 원인: 이전 배포 환경(Netlify)에서 한글 데이터가 깨진 인코딩으로 Firestore에 저장됨
  - 해결: 프로덕션 API POST로 name="환이", region="충북 청주" 재저장
  - 코드 자체엔 인코딩 이슈 없음
- [x] ✅ **미혼 선택 시 자녀 데이터 연동 수정** (2026-03-12 15:40 KST):
  - UI: handleMaritalStatusChange() — 미혼 클릭 시 childrenCount=0, hasChildren=false 자동 리셋
  - 추천 엔진: recommendation.ts — effectiveHasChildren 가드, 미혼이면 자녀 데이터 점수 계산 무시
  - 2중 방어: UI리셋 + 엔진가드로 edge case 방지
- [x] ✅ **Google Play Store 출시 준비 완료** (2026-03-12 23:00 KST)
  - ✅ manifest.json 풀 업데이트 (id, scope, display_override, icons purpose 분리, screenshots 4장)
  - ✅ 아이콘 PNG 변환 (JPEG 640x640 → PNG 192x192/512x512)
  - ✅ 스토어 스크린샷 4장 + 기능 그래픽 생성
  - ✅ PWABuilder 재검증 통과 — "Your PWA is store ready!" (Manifest 30/45, 에러 0)
  - ✅ AAB 패키지 생성 완료 (혜택알리미.aab, 1.65MB, Package ID: com.nuvolabs.benefitbell)
  - ✅ signing.keystore + signing-key-info.txt 확보 → `play-store-package/` 폴더 보관
  - ✅ assetlinks.json (SHA256 fingerprint 포함) 프로덕션 배포 완료
  - ✅ Google Play 개발자 계정: gptKR (hwanizero01@gmail.com, $25 결제 완료)
  - ✅ Play Console 앱 생성 + AAB v1.0.0 업로드 + 내부 테스트 출시
  - ✅ 앱 콘텐츠 설정 10/10 완료 (개인정보·등급·데이터보안·광고·타겟·정부앱·금융·건강·광고ID)
  - ✅ 스토어 등록정보: 설명 + 아이콘(512x512) + 그래픽(1024x500) + 스크린샷(phone/tablet7/tablet10)
  - ✅ 내부 테스터 13명 등록 완료 (내부 테스터 이메일 목록)
  - ✅ AI 맞춤 채널 지역 필터링 수정 (matchRegion: 비매칭 지역 -20 감점, 매칭 +10)
- [ ] 🔜 **비공개 테스트 시작** (프로덕션 출시 전 필수)
  - [x] 비공개 테스트 트랙 생성 및 12명 이상 참여 준비 ✅ 2026-03-14
- [ ] 14일 이상 비공개 테스트 실행 (Day 0)
- [ ] 프로덕션 출시 신청

### Phase 4: AI 자격 판정 (🥇 최우선)
- [x] Gemini AI 배치 자격 판정 엔진 (`ai-eligibility.ts` + `/api/ai-eligibility`)
- [x] `recommendation.ts` AI 점수 통합 + 캐싱 강화
- [x] 수령 가능성 % 배지 UI (홈 리스트 맞춤 추천 섹션)
- [x] AI 3줄 요약 상세 페이지 (기존 `AiEligibilityCheck` inline 모드 활용)
- [x] 무관한 혜택 자동 숨김 (`recommendation.ts` 0점 필터)
- [x] 온보딩 단계별 프로필 입력 UI (기본→추가) — profile/page.tsx 3단계 위저드 (v4)

### Phase 5: 맞춤 푸시
- [x] Firestore `sent_notifications` 중복 방지 유틸 (`push-dedup.ts`)
- [x] `push/cron-deadline` 강화 — categories/age_group 맞춤 필터 + 중복방지
- [x] BottomNav 안 읽음 뱃지 UI (localStorage 카운터)
- [x] SW push 수신 → 앱 메시지 전송 → 뱃지 실시간 업데이트

### Phase 6: 서류 원스톱
- [x] 공통 서류 → 정부24 발급 URL 화이트리스트 매핑 (`document-urls.ts`)
- [x] 상세 페이지 서류 체크리스트 UI (진행률 바 + 발급 링크 + 체크박스)
- [x] 만료 혜택 자동 숨김 (홈/검색에서 `closed` status 필터)

## 📝 ADR (Architecture Decision Records)

| 날짜 | 결정 | 이유 | 기각된 대안 |
|------|------|------|------------|
| 2026-03-02 | Supabase → Firebase 전면 이전 | 모든 프로젝트를 Firebase 단일 스택으로 통일 | Supabase 유지 |
| 2026-03-02 | 서비스 계정 키를 파일 경로로 관리 | Vercel 환경변수에 JSON 넣기 어려움 | env에 JSON 직접 삽입 |
| 2026-03-03 | 안티테제 전략 → 킬러 피처 3개 확정 | 김짜증 핑퐁으로 UX 검증 완료 | 니치 마켓 전략(기각) |
| 2026-03-03 | 알림 재발송 금지, 사용자 능동 리마인더만 | 시스템 재알림 = 스팸 인식 (핑퐁 결과) | 안 읽은 혜택 자동 재알림 |
| 2026-03-03 | 프로필 단계별 입력 | 한 번에 다 받으면 이탈 (핑퐁 결과) | 한 번에 전체 폼 |
| 2026-03-03 | AI 배치 판정 (10개/1호출) | API 과금 최소화 + 인메모리 캐싱 | 개별 호출 (기각) |
| 2026-03-03 | Gemini 2.0 Flash 사용 | 속도+비용 최적, 판정 정확도 충분 | gemini-pro (비용 과다) |
| 2026-03-03 | sent_notifications 30일 TTL | 30일 후 자동 만료 — 쿼리 최소화 | 영구 보관 (불필요한 과거 데이터) |
| 2026-03-03 | 같은 혜택 같은 날 1회만 발송 | ADR: 재알림=스팸. 일별 dedup key | 요일별/주별 재발송 |
| 2026-03-03 | 서류 매핑: 화이트리스트 > Gemini | 할루시네이션 방어 + API 과금 0원 | Gemini 서류명 추출 (기각) |
| 2026-03-03 | 서류 체크 상태 localStorage 저장 | 서버 부하 없음 + 오프라인 지원 | Firestore 저장 (과잉) |
| 2026-03-03 | web-push 라이브러리 제거 및 FCM 도입 | 기존 VAPID 키 의존성 제거, FCM 토큰 및 firebase-admin messaging 기반 푸시 발송 구조로 완전 전환 | web-push 유지 (기각) |
| 2026-03-03 | Gemini → OpenAI API 전환 | Gemini API Quota Exceeded 문제 해결, gpt-4o-mini는 가성비 최적 + JSON 모드 지원 | Gemini 유료 tier (기각) |
| 2026-03-03 | OpenAI → OpenRouter 전환 | OpenAI 키도 quota 소진, Gemini 계정 수준 limit=0. OpenRouter 무료 tier(20RPM/200RPD) + 다중 모델 fallback | Groq (단일 provider 의존) |
| 2026-03-03 | 이용약관/환불정책 페이지 추가 | 전자상거래법 준수 + 토스 live키 전환 사전 준비 | 약관 없이 결제 (법적 위험) |
| 2026-03-03 | 토스 에러 코드 매핑 17종 | 사용자 친화적 한국어 에러 메시지 + retryable 플래그 | 영문 에러 메시지 그대로 노출 (기각) |
| 2026-03-03 | activate API 시크릿 인증 | self-claim 방지, 외부 curl 차단 (QA에서 발견) | 인증 없이 오픈 (기각) |
| 2026-03-03 | firebase-admin require→readFileSync | Turbopack에서 require() 외부경로 resolve 실패 | require() 유지 (기각) |
| 2026-03-03 | success 페이지 useEffect ref 가드 | 중복 confirm API 호출 방지 (무한루프 위험) | userProfile deps 유지 (기각) |
| 2026-03-07 | Netlify → Firebase App Hosting 이전 | Firebase 단일 스택 통일 + GitHub 자동 배포 | Vercel (무료 리밋), Netlify 유지 (기각) |
| 2026-03-07 | GCP 결제 계정: 토스뱅크 (hwanizero01) | stayicon 결제 문제 → hwanizero01로 전환 | stayicon 결제 수정 (기각) |
| 2026-03-07 | 시크릿 9개 Cloud Secret Manager 등록 | apphosting.yaml에서 참조, IAM 바인딩 완료 | .env 파일 직접 배포 (보안 위험) |
| 2026-03-08 | GCP 예산 알림 ₩5,000/월 설정 | 과금 안전 필수 — 50/90/100/150% 임계값 이메일 알림 | 예산 미설정 (과금 폭탄 위험) |
| 2026-03-10 | React 19 strict: useState lazy init 패턴 | `set-state-in-effect` 에러 해결 — localStorage/cookie 읽기를 useState 초기화로 이동 | useEffect 내 setState 유지 (기각) |
| 2026-03-10 | useMemo 파생값 패턴 | `apiError`, `loading` 등 단순 조건값을 useState+useEffect 대신 useMemo로 파생 | 상태 + 이펙트 조합 (불필요한 리렌더) |
| 2026-03-10 | `any` → `unknown` + type assertion | `no-explicit-any` 에러 해결, 타입 안전 강화 | `@ts-ignore` (기각) |
| 2026-03-10 | AI 배치 점수 → 규칙 기반 전환 | 구조화 데이터(targetAge/incomeLevel/category)로 충분히 매칭 가능, API 과금 제거, 응답 속도 0ms | AI 배치 유지 (불필요한 과금) |
| 2026-03-10 | UserProfile에 maritalStatus/hasChildren 추가 + 규칙 점수 v3 | 미혼인데 자녀 혜택 추천 문제 해결. 기본점수 10, 카테고리 불일치 감점(-5~-15), likely≥65. 팀장 리뷰: divorced+자녀=한부모 로직 반영 | 프로필 미확장 (자녀 필터 불가능) |
| 2026-03-11 | UserProfile v4: 11필드 추가 + 규칙 엔진 v3 | NLM 리서치(16소스)+Council 5인 자문 기반. 개인5필드(자녀수/연령대/임신/수급/보험/장애등급)+사업자6필드. 3단계 프로그레시브 위저드로 UX 최적화 | 필드 축소 → 매칭 부정확 (기각) |
| 2026-03-11 | GPT-4o mini → GPT-4.1 nano 전환 | 33% 비용 절약($0.15/$0.60→$0.10/$0.40), 2배 속도 향상(200+ tok/s), SDK 변경 없음 | GPT-4.1 mini (2.67배 비쌈, 성능 향상 미미 — 기각) |
| 2026-03-12 | 프로덕션 Firestore: SA Key via Secret Manager | App Hosting(ai-project-ce41f)과 Firestore(benefitbell-565b2)가 다른 프로젝트 → ADC 불가. 서비스 어카운트 키를 Secret으로 저장 | ADC 의존 (기각: 크로스-프로젝트 불가) |
| 2026-03-12 | **Firestore 프로젝트 통합** (ai-project-ce41f 단일) | 2프로젝트 분리 구조의 복잡성 제거. SA Key 크로스-프로젝트 의존성 제거 → ADC 단순 인증. 13문서 마이그레이션 완료 | 분리 유지 (기각: 불필요한 복잡성) |

## 🔧 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.1.6 (Turbopack) |
| 스타일 | Vanilla CSS (CSS Modules) |
| DB | Firestore (`ai-project-ce41f`, ADC 인증, asia-northeast3 서울) |
| Auth | Firebase Custom Token (카카오 OAuth) |
| AI | **OpenAI GPT-4.1 nano** ($0.10/$0.40 per 1M tokens) |
| 푸시 | Firebase Cloud Messaging (FCM) |
| 공공데이터 | data.go.kr 복지서비스 API |
| 호스팅 | **Firebase App Hosting** (asia-east1, Blaze 요금제) |
| 배포 | GitHub main 브랜치 push → 자동 빌드·배포 |
| 결제 | 토스페이먼츠 (test키 사용 중) |

## 📂 핵심 파일 지도

| 파일 | 역할 |
|------|------|
| `src/lib/recommendation.ts` | **프로필→혜택 매칭 엔진 v3** (15규칙, 규칙 기반) |
| `src/lib/ai-eligibility.ts` | **AI 배치 자격 판정 엔진** (OpenRouter 연동 + 캐싱) |
| `src/lib/ai-client.ts` | **공통 AI 클라이언트** (OpenAI GPT-4.1 nano) |
| `src/lib/welfare-api.ts` | 공공데이터 API 호출 + XML 파싱 |
| `src/data/document-urls.ts` | **서류 → 정부24 URL 화이트리스트 매핑** |
| `src/data/benefits.ts` | Benefit 타입 + 카테고리 정의 |
| `src/lib/firebase-admin.ts` | Firebase Admin SDK 초기화 |
| `src/lib/context.tsx` | 앱 전역 상태 (UserProfile v4: 21필드 + i18n) |
| `src/app/profile/page.tsx` | 프로필 입력 UI (3단계 위저드, ~900줄) |
| `NORTH_STAR.md` | 북극성 전략 문서 |

## 📚 참고 문서

| 문서 | 위치 |
|------|------|
| 북극성 & 안티테제 전략 | `NORTH_STAR.md` |
| 삽질 기록 | `docs/PITFALLS.md` |
| Firebase 키 스킬 | `C:\Users\AIcreator\.agent\skills\firebase-service-account\SKILL.md` |
| 카카오 API 키 위치 | Obsidian `kakao-api-key-location.md` |
| App Hosting 설정 | `apphosting.yaml` (시크릿 매핑 + 런타임 설정) |
| Firebase 프로젝트 설정 | `.firebaserc` + `firebase.json` |
| 프로젝트 NLM | `d9df123e-ab1e-4b31-ae64-ae7d00d0a682` (혜택알리미 리서치) |
| Claude Code 매뉴얼 | `6c899a82-3880-4e7f-a17e-155358af46f2` (글로벌 CLI 가이드) |

---

<details>
<summary>📦 완료된 항목 (아카이브)</summary>

- [x] Firebase 프로젝트 생성 (benefitbell-565b2)
- [x] Firebase Admin SDK 초기화 (`firebase-admin.ts`)
- [x] Firebase Client SDK 초기화 (`firebase.ts`)
- [x] 카카오 OAuth → Firebase Custom Token 교체
- [x] Supabase → Firestore DB 교체 (users, push_subscriptions, payment_logs, benefit_cache)
- [x] `.env.local` 모든 키 세팅 완료 (Vercel CLI로 추출)
- [x] Firebase Admin SDK 연동 테스트 통과
- [x] Gemini API 연동 테스트 통과 (모델 44개 확인)
- [x] `/발상` 워크플로우 실행 → 10x 킬러 피처 3개 도출
- [x] 김짜증 핑퐁 1~2 라운드 → UX 스펙 확정

</details>
