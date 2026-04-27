// Firebase Cloud Messaging 서비스 워커 (public/firebase-messaging-sw.js)
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js",
);

// NEXT_PUBLIC_* 값은 클라이언트 공개값이므로 SW에 직접 기재 가능
firebase.initializeApp({
  apiKey: "AIzaSyD661gFi59xD6kDYcbqpr4XOghQtGX9_JI",
  authDomain: "ai-project-ce41f.firebaseapp.com",
  projectId: "ai-project-ce41f",
  storageBucket: "ai-project-ce41f.firebasestorage.app",
  messagingSenderId: "287186253524",
  appId: "1:287186253524:web:98d9a50c0d48dabafa2d41",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload,
  );
  const notificationTitle = payload.notification?.title || "혜택알리미";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icons/icon-192.png",
    data: payload.data,
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
