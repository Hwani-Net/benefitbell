# Project Context — 혜택알리미 (naedon-finder / BenefitBell)

> **최종 갱신**: 2026-03-03 (14:10 KST)
> **경로**: `e:\AI_Programing\naedon-finder`
> **서버**: `npm run dev -- -p 3008` (포트 3008)
> **Netlify**: https://zippy-lolly-1f23de.netlify.app

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

## 📊 현재 진행률: ~95%

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
| 9 | AI 프로덕션 검증 | ✅ OpenRouter API 연동 + 실사용 테스트 통과 (2026-03-03) |

## ✅ TODO

### Phase 4: AI 자격 판정 (🥇 최우선)
- [x] Gemini AI 배치 자격 판정 엔진 (`ai-eligibility.ts` + `/api/ai-eligibility`)
- [x] `recommendation.ts` AI 점수 통합 + 캐싱 강화
- [x] 수령 가능성 % 배지 UI (홈 리스트 맞춤 추천 섹션)
- [x] AI 3줄 요약 상세 페이지 (기존 `AiEligibilityCheck` inline 모드 활용)
- [x] 무관한 혜택 자동 숨김 (`recommendation.ts` 0점 필터)
- [x] 온보딩 단계별 프로필 입력 UI (기본→추가) — profile/page.tsx 2단계 위저드

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

## 🔧 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.1.6 (Turbopack) |
| 스타일 | Vanilla CSS (CSS Modules) |
| DB | Firestore (Firebase) |
| Auth | Firebase Custom Token (카카오 OAuth) |
| AI | OpenRouter API (무료 tier, 다중 모델 fallback) |
| 푸시 | Firebase Cloud Messaging (FCM) |
| 공공데이터 | data.go.kr 복지서비스 API |
| 호스팅 | Netlify (상업적 사용 허용) |
| 결제 | 토스페이먼츠 (test키 사용 중) |

## 📂 핵심 파일 지도

| 파일 | 역할 |
|------|------|
| `src/lib/recommendation.ts` | **프로필→혜택 매칭 엔진** (키워드 + AI 점수 통합) |
| `src/lib/ai-eligibility.ts` | **AI 배치 자격 판정 엔진** (OpenRouter 연동 + 캐싱) |
| `src/lib/ai-client.ts` | **공통 AI 클라이언트** (OpenRouter + 다중 모델 fallback) |
| `src/lib/welfare-api.ts` | 공공데이터 API 호출 + XML 파싱 |
| `src/data/document-urls.ts` | **서류 → 정부24 URL 화이트리스트 매핑** |
| `src/data/benefits.ts` | Benefit 타입 + 카테고리 정의 |
| `src/lib/firebase-admin.ts` | Firebase Admin SDK 초기화 |
| `src/lib/context.tsx` | 앱 전역 상태 (유저, 프로필, 언어) |
| `src/app/profile/page.tsx` | 프로필 입력 UI (692줄) |
| `NORTH_STAR.md` | 북극성 전략 문서 |

## 📚 참고 문서

| 문서 | 위치 |
|------|------|
| 북극성 & 안티테제 전략 | `NORTH_STAR.md` |
| 삽질 기록 | `docs/PITFALLS.md` |
| Firebase 키 스킬 | `C:\Users\AIcreator\.agent\skills\firebase-service-account\SKILL.md` |
| 카카오 API 키 위치 | Obsidian `kakao-api-key-location.md` |
| **Netlify 배포 가이드** | **Obsidian `뇽죵이Agent/memory/netlify-deployment-guide.md`** |

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
