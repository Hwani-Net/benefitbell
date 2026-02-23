/**
 * POST /api/push/cron-deadline
 * Vercel Cron: 매일 오전 9시 KST (00:00 UTC)
 * D-7, D-1 임박 혜택을 구독자 전체에게 Push 발송
 */

import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { getSubscriptions } from '@/lib/push-store'
import { getUrgentBenefits } from '@/data/benefits'

// Cron secret validation
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
  const VAPID_MAILTO = process.env.VAPID_MAILTO || 'mailto:admin@benefitbell.kr'

  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.warn('[cron-deadline] VAPID keys not configured — skipping')
    return NextResponse.json({ skipped: true, reason: 'no_vapid' })
  }

  webpush.setVapidDetails(VAPID_MAILTO, VAPID_PUBLIC, VAPID_PRIVATE)

  // D-7 and D-1 benefits
  const urgent7 = getUrgentBenefits(7)   // 7일 이내 마감
  const urgent1 = getUrgentBenefits(1)   // 오늘/내일 마감

  // No urgency → skip
  if (urgent7.length === 0) {
    return NextResponse.json({ sent: 0, reason: 'no_urgent_benefits' })
  }

  // Build notification payload
  const isTodayUrgent = urgent1.length > 0
  const title = isTodayUrgent
    ? `⚠️ 오늘 마감! ${urgent1[0].title}`
    : `📅 D-7 임박: ${urgent7[0].title}`

  const body = isTodayUrgent
    ? `${urgent1.map(b => `${b.title} (D-${b.dDay})`).join(', ')} 마감이 임박했어요!`
    : `${urgent7.length}개 혜택이 7일 이내 마감됩니다. 놓치지 마세요!`

  const payload = JSON.stringify({
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'deadline-alert',
    url: '/?tab=deadline',
    data: { type: 'deadline', count: urgent7.length },
  })

  const subscriptions = await getSubscriptions()
  let sent = 0
  let failed = 0

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          payload,
          { TTL: 3600 * 24 } // 24h TTL
        )
        sent++
      } catch (err) {
        console.error('[cron-deadline] Push failed:', err)
        failed++
      }
    })
  )

  console.log(`[cron-deadline] Sent: ${sent}, Failed: ${failed}, Benefits: ${urgent7.length}`)

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    urgentCount: urgent7.length,
    todayCount: urgent1.length,
  })
}
