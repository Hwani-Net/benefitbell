/**
 * Shared push subscription store
 * Firebase App Hosting 이전 후 Vercel KV → in-memory 유지
 * (실제 FCM 토큰은 Firestore push_subscriptions 컬렉션에서 관리)
 *
 * 2026-03-10: @vercel/kv 패키지 제거 (Firebase App Hosting 이전 완료)
 * - Vercel KV 환경에서는 더 이상 동작하지 않음
 * - Firebase App Hosting에서는 Firestore 기반 push_subscriptions 사용
 */

export interface PushSub {
  fcmToken?: string
  endpoint: string
  keys?: {
    p256dh: string
    auth: string
  }
}

// ─── In-memory store (Firebase App Hosting 환경) ───
// Note: FCM 등록은 Firestore push_subscriptions 컬렉션에서 별도 관리됨
// 이 store는 레거시 VAPID 방식 호환성 유지용

const STORE_KEY = '__benefitbell_push_subs'

function memStore(): PushSub[] {
  if (!(globalThis as Record<string, unknown>)[STORE_KEY]) {
    ;(globalThis as Record<string, unknown>)[STORE_KEY] = []
  }
  return (globalThis as Record<string, unknown>)[STORE_KEY] as PushSub[]
}

// ─── Public API ───

export async function addSubscription(sub: PushSub): Promise<void> {
  const store = memStore()
  if (!store.some(s => s.endpoint === sub.endpoint)) store.push(sub)
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const store = memStore()
  const idx = store.findIndex(s => s.endpoint === endpoint)
  if (idx !== -1) store.splice(idx, 1)
}

export async function getSubscriptions(): Promise<PushSub[]> {
  return memStore()
}

export async function getSubscriptionCount(): Promise<number> {
  return (await getSubscriptions()).length
}
