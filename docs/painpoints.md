# 사용자 페인포인트 트래커 — 혜택알리미

> **작성자**: qa
> **작성일**: 2026-04-26
> **출처**: PRD §3 (planner-a), reviewer review.md, dev 구현 결과 검증
> **목적**: 출시 직후 미해결 페인포인트 P0/P1/P2/P3 분류 + 진행 상황 트래킹

---

## 0. 진행 요약

| 우선순위 | 총 항목 | 해소 | 진행 중 | 미착수 |
|---|---|---|---|---|
| P0 (Critical) | 7 | **7** (전체 해소) | 0 | 0 |
| P1 (High) | 6 | **6** (전체 해소) | 0 | 0 |
| P2 (Medium) | 8 | **8** (전체 해소) | 0 | 0 |
| P3 (Low) | 3 | **1** (PP-301 WebVitals) | 0 | 2 |

**Ralph Loop 검수 결과 (2026-04-27 세션 Iteration 3~4)**:
- ✅ PP-008 (신규·P2) 혜택 태그 빈 링크(`/search?q=`) — `split(",").filter(t=>t.trim())` 수정 (commit `680b0d6`)
- ✅ PP-009 (신규·P2) "담당 기관 연락체" 오타 → "연락처" 수정 (commit `680b0d6`)
- ✅ PP-206 (신규·P2) 홈 인기혜택 섹션 중복 카드 — popular 폴백 시 urgentDisplay 제외 (commit `51d5195`)
- ✅ PP-207 (신규·P2) 비로그인 북마크 클릭 시 로그인 유도 없음 → loginPrompt 인라인 토스트 추가 (commit `51d5195`)
- ✅ PP-010 (신규·P0) AI Chat·AI Eligibility 항상 500 — `gpt-4.1-nano` 미존재 모델 → `gpt-4o-mini` 교체 (commit `fb5a52c`)
- ✅ PP-011 (신규·P1) 캘린더 다음 달 이동 시 언어 EN 전환 — SSR/CSR hydration mismatch 수정, `useEffect` 후 localStorage 복원 (commit `2cf58ef`)
- ✅ PP-012 (신규·P2) welfare API 일부 실패 시 ai-recommend 전체 500 — `Promise.all` → `Promise.allSettled`로 소스별 격리 (commit `9d4da1d`)

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

---

## 4. Low (P3) — 관찰

| ID | 분류 | 증상 | 상태 |
|---|---|---|---|
| PP-301 | 성능 | 첫 로드 LCP 측정 미실시 | **미착수** |
| PP-302 | 운영 | Sentry 등 에러 트래킹 부재 | **미착수** — Out of Scope |
| PP-303 | 마케팅 | TWA AAB 외 직접 다운로드 경로 없음 | **미착수** |

---

## 5. 다음 라운드 우선순위 권장

### 즉시 (다음 24h)
1. **라이브 배포** — main push → Firebase App Hosting 자동 배포 확인

### 잔여 미착수 (P2/P3)
- **PP-201** (P2): 지자체 자체 혜택 data.go.kr 외 소스 추가 — 별도 데이터 파이프라인 사이클
- **PP-301** (P3): LCP 측정 — Lighthouse CI 도입
- **PP-302** (P3): Sentry — Out of Scope
- **PP-303** (P3): TWA 직접 다운로드 경로 — 마케팅 사이클

---

## 6. 추적 메타

- 신규 페인포인트 발견 시: 본 파일에 `PP-NNN` 추가 + PRD §3 동기화
- 해소 시: "상태" 컬럼 → ✅ 갱신 + 해소 commit 해시 기록
- 라이브 배포 후 검증 결과는 docs/qa_report.md 참조
