// Firebase Cloud Messaging 서비스 워커 (public/firebase-messaging-sw.js)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js')

// url 쿼리 파라미터나 환경설정을 이 곳 하드코딩 또는 서버로부터 로드.
// 빌드시점에 넣어주는게 좋으나 서비스워커는 정적이므로 직접 설정 객체를 명시합니다.
// 우리는 NEXT_PUBLIC 변수를 쓸 수 없으므로, URL의 query param을 파싱하거나 IndexedDB를 쓰거나 해야합니다.
// 단순화를 위해 Vercel 배포/로컬에 맞춰 여기서만 쓰는 전역 키 객체를 선언하거나 Fetch로 가져오게 합니다.
// (가장 흔한 패턴은 firebase-messaging-sw.js 파일 상단에 config를 삽입하는 것입니다.)

self.addEventListener('push', (event) => {
  // sw.js와 중복 동작을 막거나 통합해야 함
  // FCM을 쓰더라도 push 이벤트는 native 웹푸시 이벤트로도 들어올 수 있음 (지원 환경에 따라 다름)
  // firebase-messaging-compat.js 가 백그라운드 메시지를 알아서 처리하게 두려면
  // 별도의 push 핸들러를 굳이 구현할 필요 없거나, firebase.messaging().onBackgroundMessage를 씁니다.
});

// Firebase config는 나중에 빌드 스크립트에서 자동 치환하거나, 쿼리스트링 꼼수 사용 가능
// 일단 Firebase App 초기화를 임시로 지연시키거나, 실제 앱의 설정값을 텍스트 치환으로 넣어야 합니다.
// next.js 환경에서 public 폴더 내 JS에 환경변수를 넣는 쉬운 방법: 빌드 시 스크립트로 덮어쓰거나, API 라우트를 통해 서비스 워커를 서빙.
// 하지만 FCM 서비스워커 기본 경로(/firebase-messaging-sw.js)를 반드시 써야하는 경우가 많습니다.

// 일단 sw.js 가 이미 PUSH 이벤트를 잘 처리하고 있었으므로, FCM도 payload 구조체만 맞추면 기존 sw.js 로직을 태울 수 있습니다.
// 사실 FCM 웹 토큰을 쓰더라도 수신 자체는 브라우저 Service Worker의 'push' 이벤트를 통해 들어옵니다.
// 즉, 기존 `public/sw.js`의 `push` 이벤트 리스너가 FCM 메시지도 받아 처리할 수 있습니다. 
// FCM 전용 firebase-messaging-sw.js는 필수가 아닐 수도 있으나, Firebase SDK 기본값 충족을 위해 빈 파일로 두거나 import 하기도 합니다.
