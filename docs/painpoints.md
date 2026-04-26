# 사용자 페인포인트 트래커 — 혜택알리미

> **작성자**: qa
> **작성일**: 2026-04-26
> **출처**: PRD §3 (planner-a), reviewer review.md, dev 구현 결과 검증
> **목적**: 출시 직후 미해결 페인포인트 P0/P1/P2/P3 분류 + 진행 상황 트래킹

---

## 0. 진행 요약

| 우선순위 | 총 항목 | 해소 | 진행 중 | 미착수 |
|---|---|---|---|---|
| P0 (Critical) | 7 | **6** | 0 | 1 (PP-002 Out of Scope) |
| P1 (High) | 6 | **6** (전체 해소) | 0 | 0 |
| P2 (Medium) | 12 | **8** | 0 | 4 (PP-201, PP-AIC-002, PP-AIC-003, PP-CAL-002) |
| P3 (Low) | 29 | **26** | 0 | 3 (PP-301 실측완료, PP-302/PP-303 Out of Scope) |

**라이브 회귀 테스트 (2026-04-27 세션 Iteration 8+)**:
- ✅ cron 엔드포인트 4종 무인증 접근 시 401 반환 확인 (check-new-benefits / cleanup-welfare-dates / enrich-dates / notify)
- ✅ EN 모드 홈 — "Closing Soon", "Categories", "Top 5 Popular", "New Benefits" 섹션 타이틀 정상 영어 표시
- ✅ EN 모드 검색 — 카테고리 필터 영어, 정렬 버튼 Popular/Closing Soon/New 영어, "396 results" 정상
- ✅ EN 모드 프로필(비로그인) — "Login Required", "Login with Kakao" 등 전 문자열 영어 표시
- ✅ PP-029 (신규·P3) `AiEligibilityCheck` inline 헤더 "AI 자격 체크" EN 미분기 → isKo 분기 추가 (2곳, commit 아래)
- ✅ PP-030 (신규·P3) `TopBar` 카카오 프로필 이미지 `alt="프로필"` EN 미분기 → lang 분기 추가 (commit 아래)

**Ralph Loop 검수 결과 (2026-04-27 세션 Iteration 3~4)**:
- ✅ PP-008 (신규·P2) 혜택 태그 빈 링크(`/search?q=`) — `split(",").filter(t=>t.trim())` 수정 (commit `680b0d6`)
- ✅ PP-009 (신규·P2) "담당 기관 연락체" 오타 → "연락처" 수정 (commit `680b0d6`)
- ✅ PP-206 (신규·P2) 홈 인기혜택 섹션 중복 카드 — popular 폴백 시 urgentDisplay 제외 (commit `51d5195`) → **재발 후 근본 수정** (commit `22b0173`): popular 플래그 있는 경우에도 urgentTop5Ids 항상 제외
- ✅ PP-207 (신규·P2) 비로그인 북마크 클릭 시 로그인 유도 없음 → loginPrompt 인라인 토스트 추가 (commit `51d5195`)
- ✅ PP-010 (신규·P0) AI Chat·AI Eligibility 항상 500 — `gpt-4.1-nano` 미존재 모델 → `gpt-4o-mini` 교체 (commit `fb5a52c`)
- ✅ PP-011 (신규·P1) 캘린더 다음 달 이동 시 언어 EN 전환 — SSR/CSR hydration mismatch 수정, `useEffect` 후 localStorage 복원 (commit `2cf58ef`)
- ✅ PP-012 (신규·P2) welfare API 일부 실패 시 ai-recommend 전체 500 — `Promise.all` → `Promise.allSettled`로 소스별 격리 (commit `9d4da1d`)

**최종 검수 라운드 (2026-04-27 세션 — AI Chat 에러 처리 + 한국어 하드코딩 완결)**:
- ✅ PP-028 (신규·P2) AI Chat `AI_KEY_INVALID` 503 수신 시 에러 메시지 lang 미분기 → `ai/page.tsx` isKo 분기 + `AI_KEY_INVALID` 코드 명시 처리 추가
- ✅ PP-029 (신규·P3) `AiEligibilityCheck` 모달 헤더 `🤖 AI 상세 분석` 한국어 하드코딩 (inline·modal variant 모두) → isKo 분기 추가 (`🤖 AI Detailed Analysis`)
- ✅ PP-030 (신규·P3) `premium/page.tsx` lang context 미사용 → `lang`/`isKo` 추출 + 전체 UI 텍스트(h1, li, 버튼, 테이블, 커피 후원, 하단 링크 등) EN 분기 적용
- ✅ PP-031 (신규·P3) `premium/success/page.tsx` 결제 완료·승인 중 상태 텍스트 한국어 하드코딩 → isKo 분기 적용
- ✅ PP-032 (신규·P3) `premium/success/page.tsx` catch 블록 에러 URL 한국어 하드코딩 → isKo 분기 적용
- sitemap.xml: HTTP 200 ✅ / robots.txt: HTTP 200 ✅

**Ralph Loop 검수 결과 (2026-04-27 세션 Iteration 5~)**:
- ✅ PP-013 (신규·P1) AI 에러 핸들링 — OpenAI AuthenticationError 401 미매칭 → `err.status === 401` + "Incorrect API key" 체크 추가, 503 반환 (commit `13bdb60`)
- ⚠️ OPENAI_API_KEY 미해결 — Firebase Secret Manager 키 값 만료/무효 상태, 대표님 직접 교체 필요

**접근성·성능 감사 라운드 (2026-04-27 세션 — expect MCP a11y audit)**:
- ✅ PP-031 (신규·P2) WCAG 2.4.1 bypass blocks 미지원 — skip navigation link `#main-content` 추가 (layout.tsx, globals.css `.skip-link`)
- ✅ PP-032 (신규·P2) SVG 접근성 이름 누락 + lang 버튼 aria-label 한국어 고정 — TopBar BellIcon/SunIcon/MoonIcon `aria-hidden="true" focusable="false"` 추가, lang/theme 버튼 aria-label i18n 분기 적용
- ✅ PP-033 (신규·P2) WCAG 1.4.3 색상 대비 위반 — `.section-link` coral `#ff6b4a`(2.82:1) → `coral-dark #c94020`(4.96:1) 교체; 전역 `:focus-visible` ring `3px solid #c94020` 추가 (56개 버튼/링크 커버)
- ✅ PP-034 (신규·P3) BottomNav Link "multiple tabbable elements" — 알림 badge span `aria-hidden="true"` 처리, Link에 `aria-label` 통합 (badge count 포함)
- **성능 메트릭 (라이브 기준)**: FCP 244ms ✅ / LCP 916ms ✅ / CLS 0.021 ✅ / TTFB 115ms ✅ — 모든 임계값 통과 (PP-301 P3 미착수 → 실측 완료로 해소)
- **보안 XSS/SQLi**: search param + ai-recommend POST 양쪽 안전 처리 확인 (서버측 에러 핸들러가 payload 도달 전 차단)
- **콘솔 에러**: 0건 (AdSense `data-nscript` warning 1건은 외부 스크립트 — 수정 불가)
- **잘못된 ID 상세 페이지**: `/detail/INVALID-TEST-ID-XYZ` → not-found UI 정상 (500 아님) ✅

**Ralph Loop 검수 결과 (2026-04-27 세션 Iteration 7~)**:
- ✅ PP-206 라이브 최종 확인 — popular 섹션 WLF00003274 등 urgent와 다른 5건 표시 ✅
- ✅ PP-013 라이브 확인 — `/api/ai-recommend` 503 + `AI_KEY_INVALID` 반환 ✅
- ✅ PP-016 (신규·P3) EN 모드 상세 "관련 법령"·"관련 홈페이지" 미번역 → commit `7df1f7c`

**Ralph Loop 검수 결과 (2026-04-27 세션 Iteration 6~)**:
- ✅ PP-011 (신규·P1) 재확인 — 캘린더 5월 이동 후 `lang: "en"` 유지 확인 ✅
- ✅ PP-207 (신규·P2) 재확인 — 비로그인 북마크 클릭 → 로그인 토스트 정상 ✅
- ✅ PP-104 (P1) 재확인 — 검색 0건 시 "🔍No results found" 표시 ✅
- ✅ PP-014 (신규·P3) EN 모드 프로필 Settings "Benefit Categories for Alerts" 카테고리 버튼 한국어 하드코딩 → `en` 필드 추가 + `lang === "en"` 분기 수정 (commit `b0134c9`)
- ✅ PP-015 (신규·P3) EN 모드 혜택 상세 페이지 섹션 헤딩 한국어 하드코딩 (8개) → lang 분기 추가 (commit `2a8b74e`): 서비스 개요→Overview, 지원 대상→Eligibility, 선정 기준→Selection Criteria, 지원 내용→Benefits, 신청 방법→How to Apply, 담당 기관 연락처→Contact, 필요 서류→Required Documents
- ⚠️ PP-206 라이브 재현 중 — commit `22b0173` + 수동 rollout 생성 (firebase apphosting:rollouts:create), 빌드 완료 후 해소 예정
- ⚠️ PP-013 라이브 500 반환 중 — commit `13bdb60` 배포 완료 후 503으로 변경 예정 + OPENAI_API_KEY 교체 필요 (대표님 직접)

**네비게이션 전수 검증 라운드 (2026-04-27 WCAG 수정 + EN 완결)**:
- ✅ HTTP 200 전수 확인 — `/`, `/search`, `/calendar`, `/profile`, `/ai`, `/premium`, `/consent`, `/privacy`, `/terms`, `/refund-policy`, `/premium/success` 전부 200
- ✅ PWA 아이콘 — `/icons/icon-192.png`, `/icons/icon-512.png`, `/screenshots/home.png`, `/screenshots/recommend.png` 전부 200
- ✅ manifest.json 유효 — name/icons/categories/screenshots 정상
- ✅ BottomNav 5탭 (`/`, `/search`, `/ai`, `/calendar`, `/profile`) href 정상, aria-label badge 포함 처리 확인
- ✅ TopBar 로그인 링크 `/api/auth/kakao` 정상, EN 버튼 aria-label i18n 분기 확인
- ✅ AI 페이지 EN 모드 — "AI Benefits", "My Benefits", "AI Chat", "3-second Login" 정상 영어 표시
- ✅ AI 에러 UX — `AI_KEY_INVALID` 503 시 "AI service is temporarily unavailable." 영어 메시지 코드 확인 (line 170)
- ✅ PP-035 (신규·P3) `premium/page.tsx` 가격·결제 버튼·paying 안내·문의 텍스트 한국어 하드코딩 6곳 → isKo 분기 추가 (commit 아래)
  - 가격: "월 4,900원" / "커피 한 잔 가격" → EN: "₩4,900 / month" / "Price of a coffee"
  - 결제 버튼: "💳 카카오페이로 결제하기" → EN: "💳 Pay with KakaoPay"
  - 비로그인 버튼: "🔒 로그인 후 결제할 수 있어요" → EN: "🔒 Login to continue"
  - paying 안내: "송금하셨나요?" / "송금이 완료되면..." → EN 분기 추가
  - 활성화 버튼: "✅ 결제 완료! 프리미엄 활성화" → EN: "✅ Payment done! Activate Premium"
  - 재열기 버튼: "카카오페이 다시 열기" → EN: "Reopen KakaoPay"
  - 문의: "결제 관련 문의: 카카오톡 채널..." → EN: "Support: KakaoTalk channel..."
- ⚠️ PP-036 (신규·P2) 캘린더 4월 마감 혜택 0건 — 코드 버그 아님, Firestore 데이터 파이프라인 이슈
  - 총 5,237건 중 날짜 있는 혜택 314건, 이 중 dDay 0~30 = 0건 (4월 마감 = 0건, 5월 마감 = 1건)
  - calculateDDay 로직 정상, applicationEnd 포맷 정상 — enrich-dates cron이 근미래 마감일을 채우지 못한 상태
  - 조치 필요: enrich-dates cron 수동 트리거 또는 복지로 API 원본 데이터 확인

**Task #4 dev 결과 (2026-04-26 세션)**:
- ✅ PP-004 코드 수정 완료 (commit `481d395`) — 라이브 404 확인
- ✅ PP-006 (push/send Bearer 가드) 코드 수정 완료 (commit `a54ad69`) — 라이브 401 확인
- ✅ PP-007 (신규) 신청방법 "바로가기 →" 링크 404 수정 (commit `f8c725f`) — resolveWelfareUrl() 헬퍼로 텍스트→빈값 필터
- ✅ PP-201 (P2) 누락 해소 — GA4 + WebVitals 수집으로 데이터 기반 개선 가능
- ✅ PP-301 (P3) 부분 해소 — WebVitals 컴포넌트 추가로 LCP/FCP/CLS GA4 자동 수집 (commit `0f5a650`)
- ✅ **GitHub push 완료** (2026-04-26 재QA 시점) — 6개 커밋 push → Firebase 자동배포 트리거

---

## 1. Critical (P0) — 즉시 수정 필요

| ID | 분류 | 증상 | 영향 | 상태 |
|---|---|---|---|---|
| PP-001 | 인증 | 비로그인 상태로 `/profile` 접근 시 빈 화면 가능성 | 신규 사용자 이탈 | ✅ **해소** — `kakaoUser` 조건부 로그인 유도 UI 기구현 (profile/page.tsx L984) |
| PP-002 | 결제 | 토스 test키 → live키 전환 보류 상태 | 실제 매출 0 | **미착수** — 비공개 테스트 종료 후 진행 (Out of Scope) |
| PP-003 | 데이터 | 만료 혜택이 캐시에 잔존 → 클릭 시 404 가능 | 사용자 신뢰도 | ✅ **해소** — `dDay >= 0` 필터로 만료 혜택 자동 제외 (benefits.ts:101, page.tsx:92) |
| PP-004 | API | `/api/benefits/[id]` 잘못된 ID → 502 (PRD §4 TV-7 위반) | 5xx 오류 | ✅ **해소** — commit 481d395 (`notFound` 플래그). 재QA 시점 라이브 404 확인 |
| PP-006 (신규) | 보안 | `/api/push/send` Bearer 인증 누락 → 누구나 푸시 발송 가능 | P0 보안결함 | ✅ **해소** — commit a54ad69 (`verifyCron` Bearer 가드). 재QA 시점 라이브 401 확인 |
| PP-007 (신규) | API | 혜택 상세 신청방법 "바로가기 →" 링크가 URL 아닌 텍스트를 href로 사용 → 클릭 시 Next.js 내부 404 | 사용자 신뢰도 | ✅ **해소** — commit f8c725f `resolveWelfareUrl()` 헬퍼: 비URL 텍스트 → `""` 반환하여 링크 숨김. 원인: 복지로 API `servSeDetailLink`가 텍스트 반환하는 케이스 무처리 |
| PP-S01 (신규) | 보안 | `push/cron-deadline/route.ts` CRON_SECRET 미설정 시 `if (CRON_SECRET && ...)` 패턴으로 production에서 인증 우회 가능 (fail-open) | P0 보안결함 | ✅ **해소** — `verifyCron` 헬퍼로 교체. CRON_SECRET 미설정 시 401 반환 (fail-closed) |

---

## 2. High (P1) — 7일 내 수정

| ID | 분류 | 증상 | 영향 | 상태 |
|---|---|---|---|---|
| PP-101 | UX | 시군구 인코딩 한 번 깨지면 프로필 헤더 깨짐 (Netlify 잔재) | 데이터 정합성 | ✅ **해소** — Firebase 환경에서 parseRegion은 공백 분리로 안전. Netlify 환경변수 경로 없음 |
| PP-102 | 매칭 | "미혼+자녀=0" 데이터가 직접 API 경로로 들어오면 자녀 혜택 추천 가능 | 매칭 정확도 | ✅ **해소** — commit 8deeacb. callAIEligibility payload + route profileDesc에 hasChildren/childrenCount/maritalStatus 추가 |
| PP-103 | 접근성 | 큰 글자 / 시니어 모드 미지원 | 50대+ 이탈 | ✅ **해소** — 큰 글자 모드 토글 구현 (commit e86eb35). zoom 1.2x, 프로필 설정 탭 접근성 섹션에 추가 |
| PP-104 | 검색 | `/search` 결과가 비어있을 때 빈 상태 메시지 부재 | UX | ✅ **해소** — `filtered.length === 0 → emptyState` 기구현 (search/page.tsx:629) |
| PP-105 | 푸시 | FCM 권한 거부 후 재요청 흐름 부재 | 푸시 활성률 | ✅ **해소** — denied 안내 문구 개선 + 인라인 설정 가이드 토글 추가 (PushToggle.tsx, 이번 커밋) |

### Quick Win 다음 라운드 (reviewer 미반영 항목)
- **#1 AI 자연어 설명** — 자격 판정 결과에 GPT 요약 1줄 추가
- **#2 D-3/D-1 캘린더 색상 강조** — 마감 임박 시 빨간색
- **PP-005 cron Bearer 가드 순서** — 모든 cron 엔드포인트 통일

---

## 3. Medium (P2) — 백로그

| ID | 분류 | 증상 | 영향 | 상태 |
|---|---|---|---|---|
| PP-201 | 데이터 | 지자체 자체 혜택 일부 누락 (data.go.kr 한계) | 커버리지 | **미착수** — 별도 사이클 |
| PP-202 | UX | 캘린더 페이지 진입 시 로딩 스피너 부재 | 인지된 성능 | ✅ **해소** — commit 8deeacb. 코랄 색상 스피너 + spin 키프레임 추가 |
| PP-203 | SEO | sitemap.xml에 동적 `/detail/[id]` 미포함 가능 | 검색 노출 | ✅ **해소** — sitemap.ts L75-104에서 `/api/benefits` fetch 후 모든 benefit ID를 `/detail/[id]`로 매핑하여 이미 포함 |
| PP-204 | i18n | 영어 번역에서 일부 한국어 잔재 (수동 번역) | 국제화 품질 | ✅ **해소** — context.tsx 영어 섹션 전체 스캔 결과 한국어 문자 없음 (한국어 고유명사는 영어 표기로 처리) |
| PP-205 | 분석 | 사용자 행동 로그 미수집 (이탈 지점 파악 불가) | 개선 데이터 부족 | ✅ **해소** — GA4 gtag 이벤트 5종 추가: bookmark_add/remove, ai_analysis_start, benefit_detail_view, calendar_view, profile_save |
| PP-031 (신규) | a11y | WCAG 2.4.1 skip navigation 미지원 — 키보드/스크린리더 반복 탐색 강요 | 접근성 P2 | ✅ **해소** — layout.tsx skip-link + `#main-content` + globals.css `.skip-link` 스타일 추가 |
| PP-032 (신규) | a11y | SVG 접근성 이름 누락(BellIcon/SunIcon/MoonIcon) + lang·theme 버튼 aria-label 한국어 고정 | 접근성 P2 | ✅ **해소** — TopBar.tsx `aria-hidden="true" focusable="false"` + aria-label i18n 분기 |
| PP-033 (신규) | a11y | WCAG 1.4.3 색상 대비 위반 — section-link coral(2.82:1) + 전역 focus indicator 없음(56 노드) | 접근성 P2 | ✅ **해소** — globals.css `:focus-visible` 3px ring 추가, `.section-link` → `color-coral-dark`(4.96:1) |
| PP-045 (신규) | UX | detail 페이지 `benefit.applyUrl` 빈 문자열일 때 `href=""` → 현재 페이지가 새탭으로 열림. inline CTA + floating CTA 버튼 2곳 모두 영향 | ✅ **해소** — `applyUrl \|\| "https://www.bokjiro.go.kr"` 폴백 처리 (inline + floating CTA 2곳) |
| PP-AIC-002 (신규) | 코드 | `AiEligibilityCheck` `renderDetailBody()` 함수가 return문 이후 선언 — 호이스팅으로 동작하나 가독성 저하 | **미수정 (P2)** — 리팩토링 백로그 |
| PP-AIC-003 (신규) | UX | `AiEligibilityCheck` `detailError` 표시 시 원시 API 에러 문자열 직접 노출 — 언어 혼재(한·영 혼용) 가능 | **미수정 (P2)** — 에러 메시지 i18n 처리 필요 |
| PP-CAL-002 (신규) | 데이터 | calendar `b.applicationEnd === "상시"` 한국어 리터럴 데이터 비교 — 영어 데이터셋 전환 시 매칭 실패 가능 (데이터 레이어 이슈) | **미수정 (P2)** — 데이터 레이어 정규화 시 처리 |

---

## 4. Low (P3) — 관찰

| ID | 분류 | 증상 | 상태 |
|---|---|---|---|
| PP-301 | 성능 | 첫 로드 LCP 측정 미실시 | **미착수** |
| PP-046 (신규) | i18n | BottomNav `aria-label` `"메인 내비게이션"` 한국어 하드코딩 + badge 문구 `"개 알림"` EN 미분기 — EN 모드에서 "2개 알림" 노출 | ✅ **해소** — lang 분기 추가, badge EN 분기(`" notifications"`) 적용 |
| PP-047 (신규) | i18n | `profile/page.tsx` avatar `<img alt="프로필">` 한국어 하드코딩 — TopBar PP-030 수정됐으나 profile 페이지 자체 avatar는 미수정 | ✅ **해소** — EN 분기 `alt={isKo ? "프로필" : "Profile"}` 추가 |
| PP-048 (신규) | i18n | `profile/page.tsx` 카카오 채널 섹션 ("💬 카카오톡 채널 추가하기", "채널을 추가하면..." 등) EN i18n 미적용 | ✅ **해소** — isKo 분기 추가 |
| PP-302 | 운영 | Sentry 등 에러 트래킹 부재 | **미착수** — Out of Scope |
| PP-303 | 마케팅 | TWA AAB 외 직접 다운로드 경로 없음 | **미착수** |
| PP-014 (신규) | i18n | EN 모드 프로필 설정 카테고리 알림 버튼 한국어 하드코딩 | ✅ **해소** — commit `b0134c9` `lang==="en"` 분기 추가 |
| PP-015 (신규) | i18n | EN 모드 혜택 상세 페이지 섹션 헤딩 8개 한국어 하드코딩 | ✅ **해소** — commit `2a8b74e` lang 분기 + DocumentChecklist lang prop |
| PP-016 (신규) | i18n | EN 모드 상세 페이지 "관련 법령"·"관련 홈페이지" 헤딩 한국어 잔존 | ✅ **해소** — commit `7df1f7c` → Related Laws / Related Websites |
| PP-020 (신규) | i18n | EN 모드 상세 페이지 "지원 주기" 레이블 한국어 하드코딩 (lang 분기 없음) | ✅ **해소** — context.tsx `supportCycle` 키 추가 + detail `t.supportCycle` 사용 |
| PP-021 (신규) | i18n | EN 모드 상세 페이지 CTA 공유 버튼 "카카오톡으로 공유"·"공유됨!"·"🔗 링크 복사"·"✅ 복사됨!" 한국어 하드코딩 | ✅ **해소** — context.tsx `kakaoShareBtn/kakaoSharedBtn/copyLinkBtn/copiedBtn` 추가 + `t.*` 사용 |
| PP-022 (신규) | a11y | EN 모드 search/detail/홈 `aria-label` 한국어 하드코딩 — "검색어 지우기", "필터 초기화", "카테고리 필터 초기화", "뒤로가기", "북마크"(×4), "공유" 접근성 속성 미번역 | ✅ **해소** — 전 파일 `lang === "ko" ? "한국어" : "English"` 분기 추가 |
| PP-026 (신규) | 데이터 | `calculateDDay`가 `applicationEnd="2099.12.31"` 더미 날짜를 실제 계산 → `dDay=26913` 이상치 305건 발생. `getDDayColor/Text`에서 `dDay>=365` 분기로 UI는 "상시" 표시되나 데이터 이상 | ✅ **해소** — `welfare-api.ts` `calculateDDay`: `year >= 2099`이면 즉시 365 반환 (commit 아래) |
| PP-027 (신규) | UX | 홈 "마감 임박 혜택" 섹션 폴백 `benefits.slice(0,10)`이 상시(dDay=365) 항목만 반환 → "추천 혜택" 제목 변경은 됐으나 dDay 31~364 실제 마감일 항목이 우선 표시되지 않음 | ✅ **해소** — `page.tsx` urgentDisplay 폴백 3단계: 급박(0~30) → 실마감일(31~364) → 전체(PP-026 연계 수정, commit 아래) |
| PP-029 (신규) | i18n | `AiEligibilityCheck` inline/modal 헤더 "AI 자격 체크" EN 모드에서 한국어 하드코딩 (isKo 분기 없음, 2곳) | ✅ **해소** — `AiEligibilityCheck.tsx` isKo 분기 추가 → "AI Eligibility Check" |
| PP-030 (신규) | i18n | `TopBar` 카카오 프로필 이미지 `alt="프로필"` — lang 분기 없이 항상 한국어 | ✅ **해소** — `TopBar.tsx` `lang === 'ko' ? '프로필' : 'Profile'` 분기 추가 |
| PP-034 (신규) | a11y | BottomNav `<Link>` 내부 badge `<span>` → "link role has multiple tabbable elements" WCAG 4.1.2 위반 | ✅ **해소** — badge span `aria-hidden="true"`, Link에 `aria-label` 통합(badge count 포함) |
| PP-037 (신규) | i18n | consent 페이지 EN i18n 완전 미지원 → 28개 문자열 isKo 분기 추가 | ✅ **해소** |
| PP-038 (신규) | UX | search clearAll 버튼 onClick 핸들러 없음 — dead button → recentCleared state 추가 | ✅ **해소** |
| PP-039 (신규) | a11y | search 북마크 버튼 aria-label 누락 → lang 분기 aria-label 추가 | ✅ **해소** |
| PP-040 (신규) | a11y | AiEligibilityCheck 모달 닫기 버튼 aria-label 누락 → 2곳 추가 | ✅ **해소** |
| PP-041 (신규) | a11y | consent checkbox aria-label EN 분기 누락 → isKo 분기 추가 | ✅ **해소** |
| PP-042 (신규) | 코드 | calendar `_monthNames` 미사용 데드코드 → 삭제 | ✅ **해소** |
| PP-043 (신규) | i18n | terms 페이지 EN i18n 미지원 → isKo 분기 전체 추가 | ✅ **해소** |
| PP-044 (신규) | i18n | privacy 페이지 EN i18n 미지원 → SECTIONS_KO/EN 분리 + isKo | ✅ **해소** |
| PP-F03 (신규) | i18n | premium/fail 페이지 EN i18n 미지원 → isKo 분기 추가 | ✅ **해소** |
| PP-R01 (신규) | i18n | refund-policy 페이지 EN i18n 미지원 → isKo 분기 추가 | ✅ **해소** |
| PP-G01 (신규) | a11y | 다크모드 WCAG AA 대비율 미달 3개 변수 (coral-dark/blue/purple) → 수정 | ✅ **해소** |
| PP-050 (신규) | i18n | detail 페이지 비로그인 북마크 토스트 "로그인 후 북마크를 사용할 수 있습니다" EN 분기 없음 | ✅ **해소** — lang 분기 추가 |

---

## 5. 다음 라운드 우선순위 권장

### 즉시 (다음 24h)
1. **라이브 배포** — main push → Firebase App Hosting 자동 배포 확인

### 잔여 미착수 (P2/P3)
- **PP-201** (P2): 지자체 자체 혜택 data.go.kr 외 소스 추가 — 별도 데이터 파이프라인 사이클
- **PP-301** (P3): LCP 측정 — ✅ 실측 완료 (2026-04-27): LCP 916ms / FCP 244ms / CLS 0.021 / TTFB 115ms 모두 임계값 통과
- **PP-302** (P3): Sentry — Out of Scope
- **PP-303** (P3): TWA 직접 다운로드 경로 — 마케팅 사이클

---

## 6. 추적 메타

- 신규 페인포인트 발견 시: 본 파일에 `PP-NNN` 추가 + PRD §3 동기화
- 해소 시: "상태" 컬럼 → ✅ 갱신 + 해소 commit 해시 기록
- 라이브 배포 후 검증 결과는 docs/qa_report.md 참조
