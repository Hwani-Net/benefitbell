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
**현재 사용 포트**: 3007  
**금지**: `taskkill //IM node.exe` (다른 프로젝트 dev 서버 kill 위험)

---

## 7. KAKAO_CLIENT_SECRET — Vercel에 없음 (정상)

**날짜**: 2026-03-02  
**증상**: Vercel에서 `KAKAO_CLIENT_SECRET`이 없어서 누락인 줄 앎.  
**원인**: 카카오 OAuth에서 Client Secret은 선택사항. 앱에서 활성화 안 함 = 없어도 정상.  
**해결**: `KAKAO_CLIENT_ID`만 있으면 됨 (=REST API 키).  
**키 위치**: 카카오 개발자센터 → 앱 → 내 앱 선택 → 앱 키 → REST API 키
