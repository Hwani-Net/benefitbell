import { NextResponse } from 'next/server'
import webpush from 'web-push'

// Shared in-memory subscription store (same module reference as subscribe route)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subscriptions: any[] = (globalThis as any).__pushSubs ?? []
;(globalThis as any).__pushSubs = subscriptions

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    const { title, body, url } = await req.json()

    const payload = JSON.stringify({
      title: title || '혜택알리미 🔔',
      body: body || '마감 임박 혜택이 있습니다!',
      url: url || '/',
      tag: 'benefit-alert',
    })

    const results = await Promise.allSettled(
      subscriptions.map((sub) => webpush.sendNotification(sub, payload))
    )

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({ sent, failed, total: subscriptions.length })
  } catch (err) {
    console.error('[Push Send]', err)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
