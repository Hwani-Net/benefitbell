/**
 * Shared push subscription store
 * Primary: Vercel KV (Redis) for persistence across cold starts
 * Fallback: globalThis memory (if KV not configured)
 */

export interface PushSub {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// ─── Vercel KV helpers (dynamic import to avoid build errors when KV not installed) ───

async function kvAvailable(): Promise<boolean> {
  try {
    // KV env vars presence check
    return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  } catch {
    return false
  }
}

const KV_KEY = 'benefitbell:push_subs'

async function kvGet(): Promise<PushSub[]> {
  try {
    const { kv } = await import('@vercel/kv')
    const subs = await kv.smembers(KV_KEY) as string[]
    return subs.map((s: string) => JSON.parse(s) as PushSub)
  } catch {
    return []
  }
}

async function kvAdd(sub: PushSub): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv')
    await kv.sadd(KV_KEY, JSON.stringify(sub))
  } catch {
    // silent — fallback will handle
  }
}

async function kvRemove(endpoint: string): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv')
    const all = await kvGet()
    const target = all.find(s => s.endpoint === endpoint)
    if (target) await kv.srem(KV_KEY, JSON.stringify(target))
  } catch {
    // silent
  }
}

// ─── In-memory fallback ───

const STORE_KEY = '__benefitbell_push_subs'

function memStore(): PushSub[] {
  if (!(globalThis as Record<string, unknown>)[STORE_KEY]) {
    ;(globalThis as Record<string, unknown>)[STORE_KEY] = []
  }
  return (globalThis as Record<string, unknown>)[STORE_KEY] as PushSub[]
}

// ─── Public API ───

export async function addSubscription(sub: PushSub): Promise<void> {
  if (await kvAvailable()) {
    const existing = await kvGet()
    if (!existing.some(s => s.endpoint === sub.endpoint)) {
      await kvAdd(sub)
    }
    return
  }
  // fallback
  const store = memStore()
  if (!store.some(s => s.endpoint === sub.endpoint)) store.push(sub)
}

export async function removeSubscription(endpoint: string): Promise<void> {
  if (await kvAvailable()) {
    await kvRemove(endpoint)
    return
  }
  const store = memStore()
  const idx = store.findIndex(s => s.endpoint === endpoint)
  if (idx !== -1) store.splice(idx, 1)
}

export async function getSubscriptions(): Promise<PushSub[]> {
  if (await kvAvailable()) return kvGet()
  return memStore()
}

export async function getSubscriptionCount(): Promise<number> {
  return (await getSubscriptions()).length
}
