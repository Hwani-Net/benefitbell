import { NextResponse } from 'next/server'
import { getAdminMessaging } from '@/lib/firebase-admin'
import { getSubscriptions, removeSubscription } from '@/lib/push-store'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { title, body, url } = await req.json()
    const subs = await getSubscriptions()

    const messaging = getAdminMessaging()
    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        if (sub.fcmToken) {
          return messaging.send({
            token: sub.fcmToken,
            notification: {
              title: title || '혜택알리미 🔔',
              body: body || '마감 임박 혜택이 있습니다!',
            },
            data: { url: url || '/' }
          })
        }
        throw { code: 'messaging/registration-token-not-registered' }
      })
    )

    // Remove expired subscriptions
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        const code = (r.reason as { code?: string })?.code
        if (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token') {
          removeSubscription(subs[i].fcmToken || subs[i].endpoint).catch(() => {})
        }
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
