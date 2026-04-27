const CACHE_NAME = "hyetack-v5";
const STATIC_ASSETS = [
  "/",
  "/search",
  "/calendar",
  "/profile",
  "/manifest.json",
];

// Install: 핵심 페이지 캐시
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activate: 오래된 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch: 네트워크 우선, 실패 시 캐시
self.addEventListener("fetch", (event) => {
  // API 요청은 캐시 안 함
  if (event.request.url.includes("/api/")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 성공 응답은 캐시에 저장
        if (response.ok && event.request.method === "GET") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 오프라인: 캐시에서 반환
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // 캐시도 없으면 오프라인 응답
          return (
            caches.match("/") ||
            new Response(
              "<html><body><p>오프라인 상태입니다. 인터넷 연결 후 다시 시도하세요.</p></body></html>",
              { headers: { "Content-Type": "text/html; charset=utf-8" } },
            )
          );
        });
      }),
  );
});

// Push 알림 수신
self.addEventListener("push", (event) => {
  let data = {};
  try {
    const text = event.data?.text();
    if (text) data = JSON.parse(text);
  } catch (err) {
    console.error("[sw] push data parse failed:", err);
    data = {};
  }
  const title = data.title || "혜택알리미 🔔";
  const options = {
    body: data.body || "마감 임박 혜택이 있습니다!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: data.tag || "benefit-alert",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
    actions: [
      { action: "view", title: "확인하기" },
      { action: "dismiss", title: "나중에" },
    ],
  };
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // 열린 클라이언트에 뱃지 카운트 업 요청
      self.clients.matchAll({ type: "window" }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({
            type: "PUSH_RECEIVED",
            benefitId: data.data?.benefitId,
          });
        });
      }),
    ]),
  );
});

// 알림 클릭 시 앱 열기
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const rawUrl = event.notification.data?.url || "/";
  // Only allow same-origin relative paths — block javascript: and external URLs
  const targetUrl =
    typeof rawUrl === "string" &&
    rawUrl.startsWith("/") &&
    !rawUrl.startsWith("//")
      ? rawUrl
      : "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          try {
            const clientPath = new URL(client.url).pathname;
            const targetPath = new URL(targetUrl, self.location.origin)
              .pathname;
            if (clientPath === targetPath && "focus" in client)
              return client.focus();
          } catch (err) {
            console.error("[sw] notificationclick URL parse failed:", err);
          }
        }
        return clients.openWindow(targetUrl);
      }),
  );
});
