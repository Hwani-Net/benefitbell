# 혜택알리미 Agent Team — 세션 컨텍스트

## 프로젝트 개요
- **앱**: 혜택알리미 (복지 혜택 알리미 PWA + TWA)
- **라이브 URL**: https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app
- **패키지**: com.nuvolabs.benefitbell
- **스택**: Next.js 15 + Firebase App Hosting + Firestore
- **작업 디렉토리**: E:/AI_Programing/혜택알리미

## 이번 팀 목표
1. **URL 404 체크**: 앱 내 모든 연결 URL 확인, 404/500 발견 즉시 수정
2. **경쟁앱 벤치마킹**: 복지로·복지멤버십·정부24·혜택알리미 경쟁앱 대비 우월한 기능 도출
3. **사용자 페인포인트 진화**: 기존 페인포인트 목록 확인 + 신규 발굴 + 개선 PR 작성

## 검증 기준
- URL 404 체크: HTTP 200 확인 (curl)
- 경쟁앱 벤치마킹: 기능 비교표 docs/competitive-analysis.md 작성
- 페인포인트: docs/painpoints.md 업데이트 + 개선 코드 PR

## 기술 스택 제약
- Next.js 15 App Router (src/app/)
- TypeScript strict
- Firebase Admin SDK (서버사이드)
- Tailwind CSS

## 외부 모델 호출 (검수용)
- GPT-4.1: `curl -s --max-time 30 http://localhost:4141/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"gpt-4.1","messages":[{"role":"user","content":"..."}]}'`
- Codex: `bash D:/jamesclew/harness/scripts/codex-rotate.sh "프롬프트"`

## 주의사항
- 시크릿 코드 노출 금지 (.env 수정 금지)
- Firebase 배포는 preview channel만 (`firebase hosting:channel:deploy`)
- 모든 수정 후 `npx tsc --noEmit` 타입체크 필수
