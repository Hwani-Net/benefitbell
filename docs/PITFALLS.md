# 🚧 삽질 기록 (PITFALLS) — 혜택알리미

> **이 문서의 목적**: 같은 실수를 두 번 하지 않기 위해.
> 새 에이전트가 이 프로젝트를 이어받을 때 반드시 읽어야 할 문서.

---

## 1. Firebase 서비스 계정 키 — 브라우저 다운로드 불가 🔥

**날짜**: 2026-03-02  
**증상**: Playwright 브라우저로 Firebase 콘솔에서 "키 생성" 버튼을 클릭하면 JSON 파일이 생성되지만, **실제 다운로드가 되지 않음**. 반복 클릭으로 키 10개 생성 → 한도 초과.  
**원인**: Playwright의 다운로드 핸들링이 Firebase 콘솔의 blob/직접 다운로드와 호환되지 않음.  
**해결**:
- ✅ **네트워크 요청 가로채기** (response body 캡처)
- ✅ **Cloud Shell CLI**: `gcloud iam service-accounts keys create`
- ❌ ~~브라우저 다운로드 버튼 클릭~~ — 절대 금지  
**스킬 문서**: `C:\Users\AIcreator\.agent\skills\firebase-service-account\SKILL.md`

---

## 2. Vercel CLI 환경변수 — development vs production

**날짜**: 2026-03-02  
**증상**: `vercel env pull` 하면 development 환경만 가져옴. TOSS/VAPID/GEMINI 키가 빠짐.  
**원인**: 대부분의 키가 **production 환경에만** 등록되어 있음.  
**해결**: `vercel env pull .env.production --environment production --yes`  
**금지**: development만 뽑고 "키가 없다"고 보고하지 마라.

---

## 3. 파이프(|) · tee · 셸 변수 — Windows bash 무한루프

**날짜**: 2026-03 (여러 번 반복)  
**증상**: `npm run build | tee build.log` 또는 `> "$TEMP/file"` 사용 시 무한 hang.  
**원인**: Windows bash에서 파이프/셸 변수 리다이렉트가 SIGPIPE 또는 경로 해석 실패.  
**해결**: 
```bash
# 빌드는 백그라운드 패턴만 사용
run_command: WaitMsBeforeAsync=500
command_status: WaitDurationSeconds=60
# 파일 저장 필요하면 하드코딩 절대경로만
npm run build > "e:/AI_Programing/프로젝트/build.log" 2>&1
```

---

## 4. 안티테제 전략 표류 (Goal Drift) 🔥

**날짜**: 2026-03-03  
**증상**: 안티테제 전략 문서를 만들어놓고 실행 안 함. Firebase 마이그레이션에 빠져서 전략적 킬러 피처 구현 0%.  
**원인**: "인프라 먼저" 핑계로 비즈니스 가치 구현을 계속 뒤로 미룸.  
**해결**:
- `NORTH_STAR.md` 생성 → 매 세션 시작 시 읽기 필수
- `docs/PROJECT_CONTEXT.md` 생성 → TODO 체크리스트 기준으로 작업
- **인프라는 킬러 피처에 필요한 만큼만** 하고, 기능 구현으로 돌아오기  
**금지**: "배포하고 마무리하겠다"며 기능은 안 만들고 인프라만 고치는 행위.

---

## 5. 공공데이터 API 서비스 키 — `\n` 꼬리

**날짜**: 2026-03-02  
**증상**: Vercel에서 `.env.production` 풀다운 시 일부 값에 `\n` 이스케이프가 붙어옴.  
**원인**: Vercel 대시보드에서 값 입력 시 줄바꿈이 들어간 것.  
**해결**: `.env.local`에 복사할 때 `\n` 제거 확인.

---

## 6. 포트 충돌 — 다른 Antigravity와 공존

**날짜**: 2026-02-25~  
**증상**: dev 서버 시작 시 포트 이미 사용 중 오류.  
**해결**: 반드시 `C:\Users\AIcreator\.agent\port-registry.json` 확인 후 빈 포트 할당.  
**현재 사용 포트**: 3008  
**금지**: `taskkill //IM node.exe` (다른 프로젝트 dev 서버 kill 위험)

---

## 7. KAKAO_CLIENT_SECRET — Vercel에 없음 (정상)

**날짜**: 2026-03-02  
**증상**: Vercel에서 `KAKAO_CLIENT_SECRET`이 없어서 누락인 줄 앎.  
**원인**: 카카오 OAuth에서 Client Secret은 선택사항. 앱에서 활성화 안 함 = 없어도 정상.  
**해결**: `KAKAO_CLIENT_ID`만 있으면 됨 (=REST API 키).  
**키 위치**: 카카오 개발자센터 → 앱 → 내 앱 선택 → 앱 키 → REST API 키

---

## 8. AI API 3단 마이그레이션 삽질 🔥

**날짜**: 2026-03-03  
**증상**: Gemini API → OpenAI API → OpenRouter로 3번 교체.  
**원인**:  
1. **Gemini**: 무료 tier quota 소진 (계정 수준 limit=0, 새 프로젝트 키도 동일)
2. **OpenAI**: gpt-4o-mini 크레딧 소진 (429 quota exceeded, 충전 필요)
3. **OpenRouter**: `openrouter/free` 모델만 동작, 나머지 free 모델은 upstream rate limit  
**해결**:  
- ✅ `ai-client.ts` 공통 헬퍼 생성 — 다중 모델 fallback 체인
- ✅ OpenRouter `openrouter/free` (자동 라우팅) 우선 사용
- ✅ 환경변수 `OPENROUTER_API_KEY` 하나만 관리  
**교훈**:  
- 무료 tier는 언제든 죽을 수 있다 → **반드시 fallback 체인** 필요
- 새 프로젝트 키 발급해도 Google 계정 수준 한도는 공유됨
- OpenRouter 무료 모델은 upstream provider의 공유 키를 사용 → 혼잡 시 429  
**금지**: 단일 API provider에 의존하는 코드 작성

---

## 9. activate API 인증 없이 오픈 — self-claim 보안 취약점 🔥

**날짜**: 2026-03-03  
**증상**: `/api/premium/activate`에 아무 kakaoId로 POST → 인증 없이 프리미엄 활성화 가능.  
**원인**: 카카오페이 송금 → self-claim 구조에서 서버 측 검증이 없었음.  
**해결**:
- ✅ `PREMIUM_ACTIVATE_SECRET` 환경변수 추가 → 클라이언트/서버 양쪽에서 검증
- ✅ 중복 프리미엄 활성화 방지 (이미 premium이면 조기 반환)
- Netlify 환경변수에도 등록 완료  
**금지**: 결제 관련 API를 인증 없이 오픈하는 것. 최소한 시크릿 키 검증 필수.

---

## 10. firebase-admin.ts — Turbopack에서 require() 외부경로 실패

**날짜**: 2026-03-03  
**증상**: `FIREBASE_SERVICE_ACCOUNT_KEY_PATH`로 경로를 주면 MODULE_NOT_FOUND 에러.  
**원인**: Turbopack이 `require()` 호출을 빌드 타임에 resolve 시도 → 외부 절대경로 인식 실패.  
**해결**: `require(keyPath)` → `readFileSync(keyPath, 'utf-8')` + `JSON.parse()` 로 변경.  
**금지**: Turbopack/Webpack 번들러 환경에서 런타임 경로를 `require()`에 전달하지 말 것.

---

## 11. Netlify Functions — AWS Lambda 환경변수 4KB 한도 🔥

**날짜**: 2026-03-05  
**증상**: `git push` 후 Netlify 빌드는 성공하나 Deploy 단계에서 실패: `Your environment variables exceed the 4KB limit imposed by AWS Lambda`.  
**원인**: `FIREBASE_SERVICE_ACCOUNT_KEY`에 전체 서비스 계정 JSON(~2.5KB)을 넣어놓아서, 다른 환경변수 20+개와 합치면 4KB 초과.  
**해결**:  
- ✅ `FIREBASE_SERVICE_ACCOUNT_KEY` 삭제
- ✅ 3개 개별 필드로 분리: `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_PROJECT_ID` (기존 `NEXT_PUBLIC_FIREBASE_PROJECT_ID` 재사용)
- ✅ `firebase-admin.ts`에서 개별 필드 우선 → JSON fallback → 파일 경로 fallback 체인 구현  
**금지**: Netlify/Vercel의 서버리스 함수에 대형 JSON을 환경변수 하나에 통째로 넣지 말 것.

---

## 2026-03-07: Firebase App Hosting 배포

### GCP 결제 계정 "카드 비밀번호 틀림"
**증상**: GCP 결제 계정 생성 시 "잘못된 비밀번호" 반복.
**원인**: "카드 비밀번호 앞 2자리"는 ATM PIN이며, 카드 만료일도 오입력.
**해결**: 카드 만료일 수정 후 "토스뱅크" 결제 계정 재생성.
**금지**: 결제 계정 여러 개 만들지 말 것. 해지된 계정은 "다시 열기" 어려움.

### Firebase CLI GitHub 연동 실패
**증상**: `firebase apphosting:backends:create`에서 GitHub 계정 목록에 Hwani-Net 안 보임.
**원인**: GitHub App 설치 완료됐지만 CLI가 인식 못함 (인터랙티브 프롬프트 한계).
**해결**: Firebase 콘솔 UI(브라우저)에서 직접 App Hosting 설정.
**금지**: CLI만으로 해결하려 고집하지 말 것.

### gcloud vs Firebase CLI 계정 불일치
**증상**: `gcloud secrets create` 시 "permission denied".
**원인**: gcloud = stayicon (프로젝트 접근 불가), Firebase CLI = hwanizero01 (프로젝트 소유자).
**해결**: `firebase apphosting:secrets:set` 사용 (Firebase CLI 인증 활용).
**금지**: `gcloud secrets create`를 stayicon 계정으로 실행하지 말 것.

### 시크릿 등록 파이프 실패
**증상**: `echo "value" | firebase apphosting:secrets:set` 실행 시 에러.
**원인**: Windows bash에서 인터랙티브 프롬프트가 파이프 입력을 씹음.
**해결**: 각 시크릿을 개별 실행 + 수동 입력 (값 → Enter → Production → Enter → Y → Enter).
**금지**: 여러 시크릿을 한꺼번에 파이프로 등록하려 하지 말 것.

---

### 시크릿 IAM 바인딩 누락 — "Backend Not Found" 🔥
**날짜**: 2026-03-08  
**증상**: 시크릿 9개를 `firebase apphosting:secrets:set`으로 등록 완료했는데, 배포 시 `fah/misconfigured-secret` 에러 발생. 프로덕션 사이트는 "Backend Not Found" 표시.  
**원인**: `secrets:set`으로 값은 Cloud Secret Manager에 저장됐지만, **App Hosting 서비스 어카운트에 IAM 접근 권한이 부여되지 않음**. `preparer` 단계에서 시크릿을 resolve할 수 없어 빌드 실패.  
**해결**:
```bash
firebase apphosting:secrets:grantaccess [SECRET_NAME] --backend benefitbell-web --project ai-project-ce41f
```
모든 시크릿(9개)에 대해 개별적으로 `grantaccess` 실행 → 빌드 성공.  
**금지**: `secrets:set`만 하고 `grantaccess` 없이 배포하지 말 것. 시크릿 등록 후 반드시 IAM 바인딩 확인.

---

### data.go.kr API 응답에 HTML 태그 포함 — 상세 페이지 코드 노출 🔥
**날짜**: 2026-03-08  
**증상**: 혜택 상세 페이지에서 `<p>`, `<br>`, `<p style="line-height: 1.8;">` 등 HTML 태그가 텍스트로 그대로 표시됨.  
**원인**: data.go.kr 복지서비스 API(XML 응답)의 `wlfareInfoOutlCn`, `tgtrDtlCn`, `alwServCn` 등 필드에 **HTML 마크업이 포함**되어 있었음. `cleanText()` 함수는 공백만 정리하고 HTML은 제거하지 않았음.  
**해결**:
- ✅ **서버 측** (`route.ts` `cleanText()`): `<p>`, `<div>` 등 블록 태그 → 줄바꿈 변환 후 모든 HTML 태그 제거 + HTML 엔티티 디코딩
- ✅ **클라이언트 측** (`page.tsx` `renderText()`): Firestore 캐시에 HTML이 남아있을 경우를 대비해 동일한 strip 로직 적용 (방어적 코딩)
- ✅ **OG 메타데이터** (`layout.tsx`): 소셜 미리보기에 HTML 태그 노출 방지  
**금지**: 외부 API 텍스트 필드를 `dangerouslySetInnerHTML`이나 plain text로 무조건 신뢰하지 말 것. 반드시 sanitize 후 렌더링.

---

### Firebase App Hosting + 카카오 OAuth KOE006 — request.url이 0.0.0.0:8080 반환 🔥
**날짜**: 2026-03-08  
**증상**: 카카오 로그인 클릭 → KOE006 에러 ("등록하지 않은 리다이렉트 URI"). 실제 사용된 URI: `https://0.0.0.0:8080/api/auth/kakao/callback`  
**원인**: Firebase App Hosting은 **리버스 프록시** 뒤에서 Next.js를 `0.0.0.0:8080`으로 실행. `new URL(request.url).host`가 내부 컨테이너 주소를 반환.  
**해결**: `x-forwarded-host` / `x-forwarded-proto` 헤더를 우선 사용하도록 OAuth route 수정.  
**금지**: Firebase App Hosting, Cloud Run 등 컨테이너 기반 호스팅에서 `request.url.host`를 공개 도메인으로 사용하지 말 것. 반드시 forwarded 헤더 확인.  
**추가**: 카카오 개발자 콘솔에서도 Firebase 도메인 Redirect URI 등록 필요 (앱 → 플랫폼 키 → REST API 키 수정 → 카카오 로그인 리다이렉트 URI).

---

### AI 상세 분석 전면 실패 — 이중 원인 🔥
**날짜**: 2026-03-08  
**증상**: 혜택 상세 페이지에서 "AI 상세 분석" 클릭 시 "⚠ AI분석 중 오류가 발생했습니다" 에러.  
**원인 1 (404)**: `/api/ai-check` PUT route에서 `fetchWelfareDetail(servId)` 호출 → null 반환 → 404 에러. 비중앙부처 혜택(LG-, BIZ-, KSU-, SUB- 접두사)은 중앙부처 상세 API에서 조회 불가.  
**원인 2 (500)**: Gemini API 403 (Generative Language API 미활성화) + OpenRouter 무료 모델 3개 모두 429/400 rate limit → 전체 AI 모델 체인 실패.  
**해결**:
- ✅ fetchWelfareDetail 실패 시 클라이언트가 보낸 `benefitTitle`로 fallback (404 대신 AI가 제한된 정보로 분석)
- ✅ `extractServId`에서 LG-/BIZ-/KSU-/SUB- 접두사 제거
- ✅ `openrouter/free` 자동 라우터를 모델 체인 최우선 배치 (개별 모델 rate limit 우회)
- ✅ `deepseek/deepseek-r1:free` fallback 추가
- ✅ GCP 프로젝트에 Generative Language API 활성화  
**금지**: 
- fetchWelfareDetail 실패 시 무조건 404 반환하지 말 것 — 제한된 정보로도 AI 분석은 가능
- OpenRouter 개별 무료 모델만 사용하지 말 것 — 반드시 `openrouter/free` 라우터를 포함

---

## 13. GCP Secret Manager 시크릿 누락 → Firebase 배포 무한 실패 🔥

**날짜**: 2026-03-11
**증상**: `git push` 하면 Firebase App Hosting 빌드가 계속 실패. 프로덕션은 이전 버전 유지.
**원인**: `apphosting.yaml`에 `OPENAI_API_KEY` secret 참조가 있었지만, GCP Secret Manager에 해당 시크릿이 존재하지 않았음. 이전 세션에서 시크릿 마이그레이션 시 `OPENAI_API_KEY`가 누락된 것으로 추정.
**해결**:
1. `gcloud secrets create OPENAI_API_KEY --data-file=- --project=ai-project-ce41f`
2. IAM 바인딩 3개 부여 (secretAccessor, secretVersionManager, viewer)
**금지**:
- `apphosting.yaml`에서 시크릿을 제거하기 전에 `grep -r "해당변수명" src/` 로 실제 사용 여부를 **반드시** 확인할 것
- 이전 세션의 "컨텍스트 요약"을 맹신하여 "OpenRouter로 전환됨"이라고 판단하지 말 것 — **코드가 진실**

---

## 14. AI 모델 혼동 — 이 프로젝트는 OpenAI GPT-4o mini ⚠️

**날짜**: 2026-03-11
**증상**: 에이전트가 "OpenRouter API로 전환됨"이라고 잘못 판단하여 `OPENAI_API_KEY`를 `apphosting.yaml`에서 삭제 → 배포 차단
**원인**: 이전 세션 요약에 "OpenRouter 전환"이라는 기록이 있었으나, 실제 코드(`ai-client.ts`)는 `import OpenAI from 'openai'`로 직접 OpenAI API를 사용
**교훈**: 컨텍스트 요약보다 **코드 grep 결과가 항상 우선**
**금지**:
- 세션 요약에 "OOO로 전환됨"이라고 적혀있어도, 실제 코드 확인 없이 시크릿/설정 삭제 절대 금지
