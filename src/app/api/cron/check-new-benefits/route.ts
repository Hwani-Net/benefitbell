import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import webpush from 'web-push'
import { fetchAllWelfareList, transformListItemToBenefit, calculateDDay } from '@/lib/welfare-api'

// Vercel Cron 보안 헤더 체크
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: Request) {
  // 프로덕션에서는 secret 검증
  if (CRON_SECRET) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // VAPID 설정
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_SUBJECT ?? 'noreply@example.com'}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    const supabase = createServiceClient()

    // 1. 모든 활성 구독자 조회
    const { data: subscribers, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) throw error
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No subscribers' })
    }

    // 2. 마감 7일 이내 OR 오픈 예정 혜택 필터 (실 API)
    const apiItems = await fetchAllWelfareList()
    const allBenefits = apiItems.map((item, i) => transformListItemToBenefit(item, i))
    const relevantBenefits = allBenefits
      .map(b => ({ ...b, dDay: calculateDDay(b.applicationEnd) }))
      .filter(b =>
        (b.status === 'open' && b.dDay >= 0 && b.dDay <= 7) ||
        b.status === 'upcoming'
      )

    if (relevantBenefits.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No relevant benefits today' })
    }

    let sent = 0
    const failed: string[] = []

    // 3. 구독자별 매칭 혜택 찾아 푸시 발송
    for (const sub of subscribers) {
      const subCategories: string[] = sub.categories ?? []

      // 카테고리 태그 없으면 → 모든 혜택 알림 (전체 구독)
      const matched = subCategories.length === 0
        ? relevantBenefits
        : relevantBenefits.filter(b => subCategories.includes(b.category))

      if (matched.length === 0) continue

      // 가장 관련성 높은 혜택 1개만 발송 (스팸 방지)
      const top = matched[0]
      const payload = JSON.stringify({
        title: top.dDay <= 7 && top.status === 'open'
          ? `📢 마감 D-${top.dDay}: ${top.title}`
          : `🔔 새 혜택: ${top.title}`,
        body: top.amount,
        url: `/detail/${top.id}`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
      })

      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        )
        sent++
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        // 410 Gone = 구독 만료 → DB에서 삭제
        if (status === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint)
        }
        failed.push(sub.endpoint.slice(-20))
      }
    }

    console.log(`[cron] Sent: ${sent}, Failed: ${failed.length}`)
    return NextResponse.json({ sent, failed: failed.length, benefits: relevantBenefits.length })
  } catch (err) {
    console.error('[cron] Error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
