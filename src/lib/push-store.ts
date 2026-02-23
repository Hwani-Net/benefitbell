/**
 * Shared push subscription store
 * Uses globalThis for Vercel serverless (same cold-start instance)
 * For production scale, migrate to Vercel KV or DB
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PushSub {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

const STORE_KEY = '__benefitbell_push_subs'

function getStore(): PushSub[] {
  if (!(globalThis as Record<string, unknown>)[STORE_KEY]) {
    (globalThis as Record<string, unknown>)[STORE_KEY] = []
  }
  return (globalThis as Record<string, unknown>)[STORE_KEY] as PushSub[]
}

export function addSubscription(sub: PushSub): void {
  const store = getStore()
  const exists = store.some(s => s.endpoint === sub.endpoint)
  if (!exists) {
    store.push(sub)
  }
}

export function removeSubscription(endpoint: string): void {
  const store = getStore()
  const idx = store.findIndex(s => s.endpoint === endpoint)
  if (idx !== -1) store.splice(idx, 1)
}

export function getSubscriptions(): PushSub[] {
  return getStore()
}

export function getSubscriptionCount(): number {
  return getStore().length
}
