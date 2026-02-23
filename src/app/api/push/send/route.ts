import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { getSubscriptions, removeSubscription } from '@/lib/push-store'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT!,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    const { title, body, url } = await req.json()
    const subs = getSubscriptions()

    const payload = JSON.stringify({
      title: title || '혜택알리미 🔔',
      body: body || '마감 임박 혜택이 있습니다!',
      url: url || '/',
      tag: 'benefit-alert',
    })

    const results = await Promise.allSettled(
      subs.map((sub) => webpush.sendNotification(sub, payload))
    )

    // Remove expired subscriptions
    results.forEach((r, i) => {
      if (r.status === 'rejected' && (r.reason as { statusCode?: number })?.statusCode === 410) {
        removeSubscription(subs[i].endpoint)
      }
    })

    const sent = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return NextResponse.json({ sent, failed, total: subs.length })
  } catch (err) {
    console.error('[Push Send]', err)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
