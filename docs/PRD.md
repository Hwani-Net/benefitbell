# 혜택알리미 개선 PRD

> **작성자**: planner-a
> **작성일**: 2026-04-26
> **프로젝트**: 혜택알리미 (BenefitBell)
> **라이브 URL**: https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app
> **목표**: (1) URL 404 체크, (2) 경쟁앱 벤치마킹, (3) 사용자 페인포인트 진화 — 3개 동시 진행

---

## 0. 요약 (TL;DR)

본 PRD는 혜택알리미의 출시 직후(Google Play 내부 테스트) 단계에서 **운영 안정성**과 **차별화 포지션**을 동시에 강화하기 위한 작업 명세이다. 핵심 산출물 3종:

1. **URL 헬스 매트릭스** — 13개 페이지 + 20개 API 라우트 전수 검증, 404/500 발생 시 자동 수정
2. **경쟁앱 비교표** — 복지로 / 복지멤버십 / 정부24 / 국민비서 vs 혜택알리미 5종 매트릭스
3. **페인포인트 트래커** — 신규 `painpoints.md` 생성 + 출시 후 미해결 항목 P0/P1/P2 분류

검증 통과 기준: 섹션 4의 테스트 벡터 7건 전수 통과.

---

## 1. URL 체크 대상 목록

### 1-1. 페이지 라우트 (13개)

| URL 경로 | 기대 HTTP | 인증 필요 | 비고 |
|---|---|---|---|
| `/` | 200 | X | 메인 (혜택 리스트) |
| `/search` | 200 | X | 검색 페이지 |
| `/calendar` | 200 | X | 신청 마감일 캘린더 |
| `/ai` | 200 | X | AI 자격 판정 페이지 |
| `/detail/[id]` | 200 / 404 | X | 혜택 상세 (유효 ID = 200, 잘못된 ID = 404) |
| `/profile` | 200 | △ | 프로필 위저드 (비로그인 시 로그인 유도) |
| `/premium` | 200 | X | 프리미엄 안내 페이지 |
| `/premium/success` | 200 | X | 결제 성공 콜백 페이지 |
| `/premium/fail` | 200 | X | 결제 실패 콜백 페이지 |
| `/refund-policy` | 200 | X | 환불 정책 (전자상거래법 필수) |
| `/terms` | 200 | X | 이용약관 |
| `/privacy` | 200 | X | 개인정보처리방침 |
| `/consent` | 200 | X | 동의 페이지 |

### 1-2. API 라우트 (20개)

| URL 경로 | Method | 인증 | 기대 HTTP | 비고 |
|---|---|---|---|---|
| `/api/benefits` | GET | X | 200 | 혜택 리스트 (Firestore 캐시) |
| `/api/benefits/[id]` | GET | X | 200 / 404 | 혜택 상세 |
| `/api/ai-check` | POST | △ | 200 / 401 | AI 자격 단건 체크 |
| `/api/ai-eligibility` | POST | △ | 200 / 401 | AI 배치 자격 판정 (현재 규칙 기반) |
| `/api/ai-recommend` | POST | △ | 200 / 401 | AI 맞춤 추천 |
| `/api/auth/kakao` | GET | X | 302 | 카카오 OAuth 시작 (redirect) |
| `/api/auth/kakao/callback` | GET | X | 302 | 카카오 OAuth 콜백 |
| `/api/cron/check-new-benefits` | POST | Bearer | 200 / 401 | 신규 혜택 수집 (Cloud Scheduler) |
| `/api/cron/notify` | POST | Bearer | 200 / 401 | 푸시 발송 cron |
| `/api/cron/cleanup-welfare-dates` | POST | Bearer | 200 / 401 | 만료 데이터 TTL 정리 |
| `/api/cron/enrich-dates` | POST | Bearer | 200 / 401 | 날짜 보강 |
| `/api/premium/activate` | POST | Secret | 200 / 401 | 프리미엄 활성화 (시크릿 인증) |
| `/api/premium/payment-date` | GET | △ | 200 / 401 | 결제일 조회 |
| `/api/payments/confirm` | POST | △ | 200 / 4xx | 토스 결제 확인 |
| `/api/push/subscribe` | POST | △ | 200 / 401 | FCM 토큰 등록 |
| `/api/push/send` | POST | Bearer | 200 / 401 | 푸시 발송 |
| `/api/push/cron-deadline` | POST | Bearer | 200 / 401 | 마감 임박 푸시 cron |
| `/api/user/profile` | GET / POST | △ | 200 / 401 | 프로필 CRUD |
| `/api/user/consent` | POST | △ | 200 / 401 | 동의 저장 |
| `/api/indexnow` | GET | X | 200 | IndexNow 핑 (SEO) |

> 인증 표기: X = 공개 / △ = 카카오 OAuth 세션 / Bearer = `CRON_SECRET` / Secret = `ACTIVATE_SECRET`

### 1-3. 정적 자원 (PWA / SEO)

| URL | 기대 HTTP | 비고 |
|---|---|---|
| `/manifest.json` | 200 | PWA manifest |
| `/sw.js` | 200 | Service Worker |
| `/.well-known/assetlinks.json` | 200 | TWA Digital Asset Links (com.nuvolabs.benefitbell) |
| `/sitemap.xml` | 200 | SEO |
| `/robots.txt` | 200 | SEO |
| `/icons/icon-192.png` | 200 | PWA 아이콘 |
| `/icons/icon-512.png` | 200 | PWA 아이콘 |

---

## 2. 경쟁앱 벤치마킹 기준

### 2-1. 비교 대상

| 앱 | 운영 주체 | 플랫폼 | 별점 (참고) | 핵심 약점 |
|---|---|---|---|---|
| **혜택알리미** | NuvoLabs | PWA + TWA | 신규 | (대상) |
| 복지로 | 보건복지부 | Web + 앱 | 2점대 | UI 노후, 자격 판정 불가 |
| 복지멤버십 | 보건복지부 | 앱 | 2점대 | 신청 흐름 복잡, 정보 과부하 |
| 정부24 | 행정안전부 | Web + 앱 | 1~2점대 | PC 전용 UI 강제, 모바일 UX 최악 |
| 국민비서 | 행정안전부 | 앱 + 카톡 | 3점대 | 광범위 알림 (혜택 외 다수 — 노이즈) |

### 2-2. 비교 매트릭스

| 기능 / 지표 | 혜택알리미 | 복지로 | 복지멤버십 | 정부24 | 국민비서 |
|---|---|---|---|---|---|
| **AI 자격 판정 (% 배지)** | ✅ GPT-4.1 nano | ❌ | ❌ | ❌ | ❌ |
| **3초 이내 결과** | ✅ 규칙 엔진 | ❌ 검색만 | ❌ 검색만 | ❌ | ❌ |
| **무관 혜택 자동 숨김** | ✅ 0점 필터 | ❌ | ❌ | ❌ | ❌ |
| **수령 가능성 % 표시** | ✅ likely 65+ | ❌ | ❌ | ❌ | ❌ |
| **서류 원스톱 안내 (정부24 직접 링크)** | ✅ 화이트리스트 매핑 | △ | △ | (자체) | ❌ |
| **마감일 캘린더** | ✅ `/calendar` | ❌ | △ | ❌ | △ |
| **카카오 1초 로그인** | ✅ Custom Token | ❌ 공동인증서 | ❌ 공동인증서 | ❌ 공동인증서 | △ |
| **PWA + TWA (앱 미설치 사용 가능)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **푸시 (FCM, 중복방지)** | ✅ sent_notifications dedup | △ 광고성 | △ | ❌ 이메일 위주 | ✅ (단, 노이즈) |
| **광고/대출 권유 없음** | ✅ Anti-Scope 정책 | ✅ | ✅ | ✅ | ❌ 보험/대출 다수 |
| **모바일 우선 UI** | ✅ 모바일 First | ❌ | △ | ❌ PC 강제 | ✅ |
| **다크모드** | ✅ | ❌ | ❌ | ❌ | △ |
| **다국어 (한/영)** | ✅ i18n | ❌ | ❌ | △ | ❌ |
| **프로필 단계별 입력 (3단계 위저드)** | ✅ v4 21필드 | ❌ 일괄 | ❌ 일괄 | ❌ | △ |
| **상시 프로그램 명시** | ✅ "상시" 라벨 | ❌ D-365 표시 | ❌ | ❌ | ❌ |
| **개인사업자 혜택 매칭** | ✅ 6필드 | △ | ❌ | △ | ❌ |
| **만료 혜택 자동 숨김** | ✅ closed status 필터 | ❌ | ❌ | ❌ | ❌ |

### 2-3. 차별화 우월 기능 (북극성 정합)

혜택알리미만 충족하는 핵심 가치:

1. **3초 결과**: 프로필 입력 → 즉시 매칭 % + 추천 상위 10개 (경쟁사 모두 "검색"만 가능)
2. **자격 판정**: % 배지 + 3줄 요약 + 무관 항목 0점 필터 (경쟁사 0)
3. **원스톱 신청**: 서류 체크리스트 → 정부24 발급 URL 직접 연결 (할루시 0%, 화이트리스트)
4. **광고 0**: Anti-Scope 정책 — 대출/카드/보험 광고 영구 차단 (캐시노트가 망한 이유)
5. **알림 비-스팸**: 같은 혜택 같은 날 1회만, 시스템 재발송 금지 (능동 리마인더만)

### 2-4. 갭 분석 (혜택알리미가 약한 영역)

| 영역 | 경쟁사 강점 | 혜택알리미 현황 | 우선순위 |
|---|---|---|---|
| 데이터 커버리지 | 복지로 = 보건복지부 직결 | data.go.kr 단일 소스 (지자체 누락 가능) | P1 |
| 공동인증서 연동 | 정부24 = 신청까지 가능 | 외부 링크 안내만 | P2 (정책상 직접 신청 미지원) |
| 카카오톡 알림 채널 | 국민비서 = 카톡 직발송 | FCM 푸시만 | P2 |
| 음성/시니어 UX | 복지멤버십 = 큰 글자 모드 | 다크모드만 (큰 글자 미지원) | P1 |
| 오프라인 (앱 미설치 시) | 정부24 = 웹 접속 가능 | PWA로 동등하나 인지도 낮음 | P2 (마케팅 영역) |

---

## 3. 사용자 페인포인트 목록

> 출처: PROJECT_CONTEXT.md ‘출시 최종 점검’ 미해결 항목, PITFALLS.md 회귀 위험, 비공개 테스트 13명 트래킹 시작 직후 예상 이슈.
> 신규 파일: `docs/painpoints.md` 생성 (Task #3 구현 단계에서 작성).

### 3-1. Critical (P0) — 즉시 수정 필요

| ID | 분류 | 증상 | 영향 | 비고 |
|---|---|---|---|---|
| PP-001 | 인증 | 비로그인 상태로 `/profile` 접근 시 빈 화면 가능성 | 신규 사용자 이탈 | 미들웨어/가드 확인 필요 |
| PP-002 | 결제 | 토스 test키 → live키 전환 보류 상태 | 실제 매출 0 | 라이브 키 전환 + 실결제 1건 검증 |
| PP-003 | 데이터 | 만료 혜택이 캐시에 잔존 → 클릭 시 404 가능 | 사용자 신뢰도 |  `/api/cron/cleanup-welfare-dates` 정상 동작 검증 |

### 3-2. High (P1) — 7일 내 수정

| ID | 분류 | 증상 | 영향 |
|---|---|---|---|
| PP-101 | UX | 시군구 인코딩 한 번 깨지면 프로필 헤더 깨짐 (이전 Netlify 잔재) | 데이터 정합성 |
| PP-102 | 매칭 | "미혼+자녀=0" 데이터가 다른 경로(예: 직접 API)로 들어오면 자녀 혜택 추천 가능 | 매칭 정확도 |
| PP-103 | 접근성 | 큰 글자 / 시니어 모드 미지원 | 50대+ 이탈 |
| PP-104 | 검색 | `/search` 결과가 비어있을 때 빈 상태 메시지 부재 추정 | UX |
| PP-105 | 푸시 | FCM 권한 거부 후 재요청 흐름 부재 | 푸시 활성률 |

### 3-3. Medium (P2) — 백로그

| ID | 분류 | 증상 | 영향 |
|---|---|---|---|
| PP-201 | 데이터 | 지자체 자체 혜택 일부 누락 (data.go.kr 한계) | 커버리지 |
| PP-202 | UX | 캘린더 페이지 진입 시 로딩 스피너 부재 가능 | 인지된 성능 |
| PP-203 | SEO | sitemap.xml에 동적 `/detail/[id]` 미포함 가능 | 검색 노출 |
| PP-204 | i18n | 영어 번역에서 일부 한국어 잔재 가능 (수동 번역) | 국제화 품질 |
| PP-205 | 분석 | 사용자 행동 로그 미수집 (이탈 지점 파악 불가) | 개선 데이터 부족 |

### 3-4. Low (P3) — 관찰

| ID | 분류 | 증상 |
|---|---|---|
| PP-301 | 성능 | 첫 로드 LCP 측정 미실시 |
| PP-302 | 운영 | Sentry 등 에러 트래킹 부재 |
| PP-303 | 마케팅 | TWA AAB 외 직접 다운로드 경로 없음 |

---

## 4. 테스트 벡터

### TV-1: 메인 페이지 HTTP 200
- **요청**: `curl -sI https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app/`
- **기대**: `HTTP/2 200`, `content-type: text/html`
- **PASS 기준**: 응답 시간 < 3초, HTML에 `<title>혜택알리미` 포함

### TV-2: 공개 API 200 — 혜택 리스트
- **요청**: `curl -s https://.../api/benefits | jq '.benefits | length'`
- **기대**: HTTP 200, JSON, `benefits` 배열 길이 ≥ 1000 (data.go.kr 캐시)
- **PASS 기준**: 응답 시간 < 2초

### TV-3: 결제 페이지 200 (전자상거래법 준수)
- **요청**: `/refund-policy`, `/terms`, `/privacy` 3개 페이지 동시
- **기대**: 모두 HTTP 200, 페이지 본문에 "환불"/"이용"/"개인정보" 키워드 포함
- **PASS 기준**: 3개 모두 PASS

### TV-4: 보호 cron API 401 (시크릿 미포함)
- **요청**: `curl -s -o /dev/null -w "%{http_code}" https://.../api/cron/check-new-benefits` (POST, Bearer 없음)
- **기대**: HTTP 401 (또는 403)
- **PASS 기준**: 200 이 절대 아닐 것 (200 = 보안 결함 P0)

### TV-5: 카카오 OAuth 시작 302
- **요청**: `curl -sI https://.../api/auth/kakao`
- **기대**: HTTP 302, `location` 헤더가 `kauth.kakao.com` 포함
- **PASS 기준**: 카카오 도메인 redirect

### TV-6: PWA 정적 자원 200
- **요청**: `/manifest.json`, `/sw.js`, `/.well-known/assetlinks.json`
- **기대**: 모두 HTTP 200
  - `manifest.json` JSON 파싱 가능 + `id`, `start_url`, `icons` 필수
  - `assetlinks.json` SHA256 fingerprint 포함
- **PASS 기준**: 3개 모두 PASS (TWA 무결성 검증)

### TV-7: 잘못된 혜택 ID 404
- **요청**: `curl -sI https://.../detail/INVALID-ID-99999`
- **기대**: HTTP 404 (또는 200 + "혜택을 찾을 수 없습니다" 빈 상태)
- **PASS 기준**: 5xx 가 아닐 것 (5xx = 서버 에러 P0)

### TV-8 (보너스): 경쟁사 라이브 검증
- **요청**: 복지로(`https://www.bokjiro.go.kr`), 정부24(`https://www.gov.kr`), 국민비서(`https://ips.go.kr`) 메인 페이지 응답 시간 측정
- **기대**: 혜택알리미 메인 페이지가 동등 이상 (TTFB 비교)
- **PASS 기준**: 참고 데이터 (실패해도 무관)

---

## 5. 기술 스택 (확정)

| 영역 | 기술 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js 15 App Router** | (PROJECT_CONTEXT.md 기록은 16.1.6, package.json 확인 필요 — Task #2 검증 항목) |
| 언어 | TypeScript strict | `npx tsc --noEmit` 필수 |
| 스타일 | Tailwind CSS + Vanilla CSS Modules | |
| DB | Firestore (`ai-project-ce41f`, asia-northeast3 서울, ADC 인증) | |
| Auth | Firebase Custom Token + 카카오 OAuth | |
| AI | OpenAI GPT-4.1 nano | $0.10/$0.40 per 1M, 규칙 엔진 보조 |
| 푸시 | Firebase Cloud Messaging (FCM) | sent_notifications 30일 TTL dedup |
| 호스팅 | Firebase App Hosting (asia-east1, Blaze) | GitHub main → 자동 배포 |
| 결제 | 토스페이먼츠 (test키) | live 전환 보류 (PP-002) |
| TWA | PWABuilder AAB v1.0.0 | com.nuvolabs.benefitbell, signing.keystore 보관 |

---

## 6. Out of Scope (이번 사이클 제외)

- 데이터 소스 추가 (지자체 직결 API) → 별도 사이클
- 시니어 모드 풀 구현 → P1, 다음 사이클
- 토스 live키 전환 → 비공개 테스트 종료 후
- Sentry 도입 → P3, 별도 사이클

---

## 7. 다음 단계

| Task | 담당 | 차단 조건 |
|---|---|---|
| #2 PRD 교차검증 | planner-b | (현재 PRD) |
| #3 구현 | dev | #2 통과 |
| #4 코드 리뷰 | reviewer | #3 완료 |
| #5 QA 검증 | qa | #4 완료 |

**Task #2 검증 포인트** (planner-b 참고):
- Next.js 버전 실제 확인 (15 vs 16.1.6)
- API 라우트 20개 누락 없는지 재확인
- 경쟁사 별점/특징은 실사 (스토어 직접 확인)
- 테스트 벡터 7건 외 추가 케이스 발굴

---

## 6. 교차검증 결과 (planner-b, 2026-04-26)

### 6-1. 라이브 URL 실사 (전수 통과)

`E:/AI_Programing/혜택알리미` 디렉토리 직접 탐색 + 라이브 curl 검증:

| 검증 항목 | PRD 표기 | 실측 결과 | 판정 |
|---|---|---|---|
| 페이지 라우트 13개 | 13개 | `src/app/**/page.tsx` 13개 일치 | ✅ |
| API 라우트 20개 | 20개 | `src/app/api/**/route.ts` 20개 일치 | ✅ |
| 메인 `/` 응답시간 | <3초 | 0.26초 / Title="혜택알리미 - 나에게 맞는 정부 지원금·복지 혜택, 한눈에" | ✅ |
| `/api/benefits` 길이 | ≥1000 | **5,237개** (6.6 MB) | ✅ |
| PWA 정적 5종 | 200 | manifest/sw.js/assetlinks/sitemap/robots 모두 200 | ✅ |
| 페이지 13종 | 200 | refund/terms/privacy/ai/calendar/search/premium(+success/fail)/consent/profile 모두 200 | ✅ |
| 카카오 OAuth | 302 | **307 Temporary Redirect** (kauth.kakao.com 정상) | ⚠️ PRD 수정 |
| `assetlinks.json` SHA256 | 포함 | `AF:3D:61:AC:F5:CD:A0:CC:5B:B6:59:78:00:A7:C7:DB:77:68:A9:17:0B:BC:03:9C:10:27:9E:B3:A0:00:91:1F` 정상 | ✅ |

### 6-2. PRD 수정 사항 (dev가 Task #3에서 반영)

| 항목 | 현재 PRD | 실측값 | 수정 위치 |
|---|---|---|---|
| Next.js 버전 | "15 (16.1.6 확인 필요)" | **16.1.6 확정** | §5 기술 스택 표 첫 행 → "Next.js 16.1.6 App Router"로 단정 |
| 카카오 redirect | "302" | **307** | §1-2 `/api/auth/kakao` 행 + §4 TV-5 기대값 |
| TV-4 cron 응답 | "401 (또는 403)" | **405** (POST body 없으면 메서드 가드 우선) | §4 TV-4 기대값 보완 — 401 검증 위해 `-X POST -H "Content-Type: application/json" -d '{}'` 필수 |
| TV-7 `/api/benefits/[id]` | "200 / 404" | **502 발생 (P0)** ← 아래 PP-NEW-001 | §1-2 + §3-1 |

### 6-3. 신규 P0 페인포인트 (실측 발견)

| ID | 분류 | 증상 | 영향 | 우선순위 |
|---|---|---|---|---|
| **PP-004** | API 안정성 | `/api/benefits/[id]` 잘못된 ID 호출 시 **HTTP 502** 반환 (Cloud Run 게이트웨이) — 응답 본문은 `{"success":false,"error":"Failed after 3 attempts: NO DATA FOUND"}`. 즉 3회 재시도 후 502로 래핑 | 사용자가 만료 혜택 링크 클릭 시 502 페이지 노출 → 신뢰도 하락 + Crawl 오류 | **P0** |
| **PP-005** | 보안 검증 가시성 | cron API가 GET/no-body 요청에 405를 반환하지만, 잘못된 Bearer 토큰에도 405 반환 (메서드 가드 우선). 401/403 응답을 명시적으로 반환하지 않아 보안 모니터링 미흡 | 침투 시도 로그 부재 | **P1** |

### 6-4. 신규 P1 페인포인트 (경쟁앱 실사 발견)

| ID | 분류 | 증상 | 영향 | 출처 |
|---|---|---|---|---|
| **PP-106** | 네이밍 충돌 | "혜택알리미" 명칭이 정부24 공식 서비스 `plus.gov.kr/portal/benefitV2/`와 **동일** | 검색 시 정부24와 혼동 → 브랜드 인식 약화 | 정부24 실사 |
| **PP-107** | 경쟁 우위 약화 | 국민비서가 2025-05-27부터 문자 알림 폐지 → 카톡/네이버/토스 등 20개 앱 연동만 가능. 우리 앱이 그 20개에 없음 | 사용자가 알림을 우리 앱이 아닌 토스/카톡으로 받게 됨 | 행안부 정책 변경 |

### 6-5. Quick Win 후보 (구현 난이도 낮음, 차별화 효과 큼)

`/api/ai-eligibility`, `/calendar`, `/search` 등 이미 보유한 라우트를 확장하면 빠르게 차별화 가능:

#### Quick Win #1: AI 자격 판정 결과 자연어 설명 강화 (P1, 1~2일)
- **현재**: `/api/ai-eligibility` POST → 매칭 % + 단순 사유 (규칙 엔진)
- **개선**: GPT-4.1 nano로 "왜 받을 수 있는지/왜 못 받는지" 한 문단 자연어 설명 추가
- **차별화**: 복지로/정부24/국민비서 모두 단순 검색·알림만 — **자격 판정 자체가 0**
- **구현**: `src/app/api/ai-eligibility/route.ts` 응답에 `naturalLanguageReason: string` 필드 추가, 클라이언트 `/ai` 페이지에 표시
- **비용**: 1회 호출 < $0.001 (GPT-4.1 nano nano)

#### Quick Win #2: 마감일 D-3/D-1 자동 푸시 + 캘린더 색상 강조 (P1, 1일)
- **현재**: `/calendar` 페이지 + `/api/push/cron-deadline` 보유 (cron으로 발송)
- **개선**:
  1. 캘린더 D-3 빨강, D-1 빨강 강조 표시
  2. cron-deadline이 D-3/D-1 두 시점에 발송 (현재 단일 시점인지 확인 필요)
  3. 클릭 시 곧바로 정부24 신청 페이지로 deep-link
- **차별화**: 복지로/정부24 모두 마감일 캘린더 뷰 부재. 국민비서는 알림만 있고 시각화 없음
- **구현**: `src/app/calendar/page.tsx` D-Day CSS 추가 + `/api/push/cron-deadline` 로직에 D-3/D-1 분기 추가

#### Quick Win #3: 검색 오타 보정 + 자동완성 (P1, 1일)
- **현재**: `/search` 페이지 + `/api/benefits` (5,237개 캐시) 보유
- **개선**: 클라이언트 측 fuzzy 매칭 (`Fuse.js` 0.6KB gzipped) — "출산축하급" → "출산축하금" 자동 보정
- **차별화**: 복지로 검색은 정확 매칭만, 정부24는 PC 검색 UX. 모바일 즉시 결과 = 우리 앱만의 강점
- **구현**: `src/app/search/page.tsx`에 Fuse.js 추가, threshold=0.3, 5,237개 인덱스는 빌드 타임 정적 생성

#### (보너스) Quick Win #4: 시니어 모드 (큰 글자 + 고대비) — P1, 0.5일
- **현재**: 다크모드만 지원 (PP-103과 동일)
- **개선**: `/profile` 토글로 폰트 +20% / 버튼 +30% / 색 대비 강화
- **차별화**: 복지멤버십에 큰 글자 모드 있으나 우리는 부재 → 50대+ 사용자 이탈 방지
- **구현**: Tailwind 변형 클래스 + localStorage 토글, 1개 컴포넌트로 전역 적용

### 6-6. TV-8 경쟁사 응답 시간 비교 (참고)

| 사이트 | HTTP | 응답시간 | 비고 |
|---|---|---|---|
| **혜택알리미** | 200 | **0.26초** | 메인 페이지 |
| 정부24 (gov.kr) | 200 | 0.08초 | 정적 redirect |
| plus.gov.kr/benefitV2/ | 200 | 0.10초 | 75 KB |
| 국민비서 (ips.go.kr) | 200 | 1.33초 | 우리보다 5배 느림 ✅ |
| 복지로 (bokjiro.go.kr) | **000** | (응답 없음) | curl 연결 실패 — 봇 차단 가능성 |

→ 우리 앱이 정부24/plus.gov.kr보다는 느리지만 75KB 메인 페이지 기준이므로 동등 수준. 국민비서 대비 5배 빠름.

### 6-7. 추가 테스트 벡터 (PRD §4에 추가 권장)

| ID | 검증 | 기대값 |
|---|---|---|
| **TV-9** | `/api/benefits/[id]` 잘못된 ID → **404 명시 반환** (현재 502) | HTTP 404 + JSON `{"success":false,"error":"Not found"}` |
| **TV-10** | cron POST + body + wrong Bearer → **명시적 401** | HTTP 401 (현재 405) |
| **TV-11** | 메인 페이지 H1 텍스트 + meta description 한국어/영어 i18n 검증 | i18n 토글 시 텍스트 변경 |
| **TV-12** | `/manifest.json` `id`, `start_url`, `icons` 필수 필드 파싱 | JSON.parse 통과 |

### 6-8. 결론 (planner-b 의견)

PRD §1~§5 구조는 견고함. 다만 **3건의 P0/P1 신규 발견**으로 dev 작업 범위가 약간 늘어남:

1. **P0 PP-004**: `/api/benefits/[id]` 잘못된 ID에 404 명시 반환 (502 → 404 수정)
2. **P1 PP-005**: cron 인증 가드를 메서드 가드보다 먼저 발동시켜 401 명시
3. **Quick Win 3개**: AI 자연어 설명 / D-Day 캘린더 / 검색 오타 보정 — 모두 1~2일 내 구현 가능, 차별화 효과 큼

§5 표 첫 행 "Next.js 15"는 "Next.js 16.1.6"으로 확정 수정. §1-2 카카오 row는 "302" → "307"로 수정. §4 TV-4 기대값에 "POST body 필수" 주석 추가. §4 TV-5 기대값 "302" → "302 또는 307"로 변경.

dev는 Task #3에서 위 P0 1건 + P1 1건 + Quick Win 3건을 우선순위대로 구현. `painpoints.md`에는 §3 + §6-3 + §6-4 통합 반영.
