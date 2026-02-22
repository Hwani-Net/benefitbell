const CACHE_NAME = 'hyetack-v1'
const STATIC_ASSETS = [
  '/',
  '/search',
  '/calendar',
  '/profile',
  '/manifest.json',
]

// Install: 핵심 페이지 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate: 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch: 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', (event) => {
  // API 요청은 캐시 안 함
  if (event.request.url.includes('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 성공 응답은 캐시에 저장
        if (response.ok && event.request.method === 'GET') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // 오프라인: 캐시에서 반환
        return caches.match(event.request).then((cached) => {
          if (cached) return cached
          // 캐시도 없으면 홈으로
          return caches.match('/')
        })
      })
  )
})

// Push 알림 수신
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const title = data.title || '혜택알리미 🔔'
  const options = {
    body: data.body || '마감 임박 혜택이 있습니다!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'benefit-alert',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: '확인하기' },
      { action: 'dismiss', title: '나중에' },
    ],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// 알림 클릭 시 앱 열기
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) return client.focus()
      }
      return clients.openWindow(event.notification.data?.url || '/')
    })
  )
})
