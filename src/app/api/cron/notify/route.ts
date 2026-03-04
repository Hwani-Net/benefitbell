import { NextResponse } from 'next/server'
import { getAdminMessaging } from '@/lib/firebase-admin'
import { getSubscriptions, removeSubscription } from '@/lib/push-store'
import { calculateDDay, fetchAllWelfareSources, transformListItemToBenefit } from '@/lib/welfare-api'

export const dynamic = 'force-dynamic'

// Verify cron secret to prevent unauthorized access
function verifyCron(req: Request): boolean {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return true // no secret configured = allow
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(req: Request) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subs = await getSubscriptions()

  // If no subscriptions, skip
  if (subs.length === 0) {
    return NextResponse.json({ message: 'No subscriptions', sent: 0 })
  }

  // VAPID Setup is no longer needed with FCM

  // Find urgent benefits (D-Day <= 3) from real API
  const apiItems = await fetchAllWelfareSources()
  const allBenefits = apiItems.map((item, i) => transformListItemToBenefit(item, i))
  const urgentBenefits = allBenefits
    .map(b => ({ ...b, dDay: calculateDDay(b.applicationEnd) }))
    .filter(b => b.dDay >= 0 && b.dDay <= 3)
    .sort((a, b) => a.dDay - b.dDay)

  if (urgentBenefits.length === 0) {
    return NextResponse.json({ message: 'No urgent benefits today', sent: 0 })
  }

  // Build notification message
  const topBenefit = urgentBenefits[0]
  const dDayText = topBenefit.dDay === 0 ? '오늘 마감!' : `D-${topBenefit.dDay}`
  const payload = JSON.stringify({
    title: `🔔 마감 임박! ${urgentBenefits.length}건의 혜택`,
    body: `${topBenefit.title} - ${dDayText}\n${topBenefit.amount}`,
    url: `/detail/${topBenefit.id}`,
    tag: `cron-alert-${new Date().toISOString().split('T')[0]}`,
  })

  // Send to all subscribers
  const messaging = getAdminMessaging()
  const results = await Promise.allSettled(
    subs.map(async sub => {
      if (sub.fcmToken) {
        return messaging.send({
          token: sub.fcmToken,
          notification: {
            title: `🔔 마감 임박! ${urgentBenefits.length}건의 혜택`,
            body: `${topBenefit.title} - ${dDayText}\n${topBenefit.amount}`,
          },
          data: { url: `/detail/${topBenefit.id}` }
        })
      } else {
        throw { code: 'messaging/registration-token-not-registered' }
      }
    })
  )

  // Cleanup expired
  results.forEach((r, i) => {
    if (r.status === 'rejected' && ((r.reason as any)?.code === 'messaging/registration-token-not-registered' || (r.reason as any)?.code === 'messaging/invalid-registration-token')) {
      removeSubscription(subs[i].fcmToken || subs[i].endpoint).catch(() => {})
    }
  })

  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  console.log(`[Cron] Push sent: ${sent}, failed: ${failed}, urgent: ${urgentBenefits.length}`)

  return NextResponse.json({
    sent,
    failed,
    urgentBenefits: urgentBenefits.map(b => ({ title: b.title, dDay: b.dDay })),
    timestamp: new Date().toISOString(),
  })
}
