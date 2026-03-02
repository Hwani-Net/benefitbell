/**
 * GET /api/push/cron-deadline
 * Vercel Cron: 매일 오전 9시 KST (00:00 UTC)
 *
 * 강화 버전 (Phase 5):
 * 1. 구독자별 프로필(categories, age_group, region) 기반 맞춤 필터링
 * 2. sent_notifications 중복 방지 (같은 혜택 같은 날 재발송 없음)
 * 3. 만료된 구독(410 GONE) 자동 정리
 * 4. D-7, D-3, D-1 알림 + 프리미엄은 D-14 선알림
 */

import { NextResponse } from 'next/server'
import { getAdminFirestore, getAdminMessaging } from '@/lib/firebase-admin'
import { fetchAllWelfareList, transformListItemToBenefit, calculateDDay } from '@/lib/welfare-api'
import { getSentBenefitIds, markSent } from '@/lib/push-dedup'

const CRON_SECRET = process.env.CRON_SECRET

// D-day thresholds for standard users
const DDAY_THRESHOLDS = [1, 3, 7]
// D-day thresholds for premium users
const DDAY_THRESHOLDS_PREMIUM = [1, 3, 7, 14]

interface PushSubscription {
  fcmToken?: string
  endpoint?: string // Legacy VAPID
  p256dh?: string
  auth?: string
  categories?: string[]
  age_group?: string  // 'youth' | 'middle-aged' | 'senior'
  region?: string
  is_premium?: boolean
}

export async function GET(request: Request) {
  // Auth validation
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 1. 혜택 데이터 로드 ──────────────────────────
  const apiItems = await fetchAllWelfareList()
  const allBenefits = apiItems
    .map((item, i) => transformListItemToBenefit(item, i))
    .map(b => ({ ...b, dDay: calculateDDay(b.applicationEnd) }))
    .filter(b => b.dDay >= 0 && b.dDay <= 14 && b.status === 'open')

  if (allBenefits.length === 0) {
    return NextResponse.json({ sent: 0, reason: 'no_urgent_benefits' })
  }

  // ── 2. 구독자 로드 (Firestore) ───────────────────
  const db = getAdminFirestore()
  const subsSnapshot = await db.collection('push_subscriptions').get()
  const subscriptions: (PushSubscription & { docId: string })[] = []
  subsSnapshot.forEach(doc => {
    const d = doc.data() as PushSubscription
    // FCM 토큰이 있거나 기존 endpoint가 있는 경우 수집
    if (d.fcmToken || d.endpoint) {
      subscriptions.push({ ...d, docId: doc.id })
    }
  })

  if (subscriptions.length === 0) {
    return NextResponse.json({ sent: 0, reason: 'no_subscriptions' })
  }

  const today = new Date().toISOString().split('T')[0]
  const toDelete: string[] = []
  let totalSent = 0
  let totalSkippedDedup = 0
  let totalSkippedFilter = 0
  const messaging = getAdminMessaging()

  // ── 3. 구독자별 맞춤 발송 ────────────────────────
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const thresholds = sub.is_premium ? DDAY_THRESHOLDS_PREMIUM : DDAY_THRESHOLDS

      // 이 구독자에게 오늘 이미 발송한 혜택 ID set
      const sentIds = await getSentBenefitIds(sub.docId, today)

      // 구독자 프로필 기반 필터링
      const matchedBenefits = allBenefits.filter(b => {
        // D-day 임계값 체크
        if (!thresholds.includes(b.dDay)) return false

        // 이미 발송됨 → 스킵
        if (sentIds.has(b.id)) {
          totalSkippedDedup++
          return false
        }

        // 카테고리 매칭 (관심 카테고리 있으면 필터, 없으면 전체)
        if (sub.categories && sub.categories.length > 0) {
          if (!sub.categories.includes(b.category)) return false
        }

        // 연령 매칭 (age_group 있으면 필터)
        if (sub.age_group) {
          const age = sub.age_group // 'youth' | 'middle-aged' | 'senior'
          const catMap: Record<string, string[]> = {
            youth: ['youth', 'education', 'employment', 'startup'],
            'middle-aged': ['employment', 'small-biz', 'housing', 'medical'],
            senior: ['senior', 'medical', 'basic-living', 'near-poverty'],
          }
          const targetCats = catMap[age]
          if (targetCats && !targetCats.includes(b.category)) {
            // 연령 카테고리에 없어도 구독 카테고리에서 허용
            if (!(sub.categories && sub.categories.includes(b.category))) {
              totalSkippedFilter++
              return false
            }
          }
        }

        return true
      })

      if (matchedBenefits.length === 0) return

      // 가장 긴급한 혜택 1개로 알림 (스팸 방지)
      const top = matchedBenefits.sort((a, b) => a.dDay - b.dDay)[0]
      const dDayLabel = top.dDay === 0 ? '오늘 마감' : top.dDay === 1 ? '내일 마감' : `D-${top.dDay}`

      const hasMore = matchedBenefits.length > 1
        ? ` 외 ${matchedBenefits.length - 1}건` : ''

      try {
        if (sub.fcmToken) {
          const message = {
            token: sub.fcmToken,
            notification: {
              title: `⏰ ${dDayLabel}! 혜택을 놓치지 마세요`,
              body: `${top.title}${hasMore} — 지금 바로 확인하세요`,
            },
            webpush: {
              fcmOptions: {
                link: `/detail/${top.id}`
              },
              notification: {
                icon: '/icons/icon-192x192.png',
                // badge is not fully supported in FCM webpush notification object directly, but we can pass data
              }
            },
            data: {
              url: `/detail/${top.id}`,
              type: 'deadline',
              benefitId: top.id,
              count: matchedBenefits.length.toString(),
            }
          }
          await messaging.send(message)
        } else {
          // Legacy VAPID 토큰인 경우 무시하고 삭제 대상으로 지정 (FCM으로 강제 전환)
          throw { code: 'messaging/registration-token-not-registered', legacy: true }
        }

        // 중복 방지: 발송된 혜택들 모두 기록
        await Promise.allSettled(
          matchedBenefits.map(b => markSent(sub.docId, b.id, today, { dDay: b.dDay, title: b.title }))
        )
        totalSent++
      } catch (err: any) {
        if (err.code === 'messaging/registration-token-not-registered' || err.code === 'messaging/invalid-registration-token') {
          // 만료된 구독 — 정리 대상
          toDelete.push(sub.docId)
        } else {
          console.error(`[cron-deadline] Push failed for ${sub.docId}:`, err)
        }
      }
    })
  )

  // ── 4. 만료 구독 정리 ────────────────────────────
  if (toDelete.length > 0) {
    await Promise.allSettled(
      toDelete.map(docId => db.collection('push_subscriptions').doc(docId).delete())
    )
    console.log(`[cron-deadline] Removed ${toDelete.length} expired subscriptions`)
  }

  console.log(`[cron-deadline] Done — sent: ${totalSent}, dedup-skipped: ${totalSkippedDedup}, filter-skipped: ${totalSkippedFilter}, expired-cleaned: ${toDelete.length}`)

  return NextResponse.json({
    ok: true,
    sent: totalSent,
    skippedDedup: totalSkippedDedup,
    skippedFilter: totalSkippedFilter,
    expiredCleaned: toDelete.length,
    urgentCount: allBenefits.length,
    date: today,
  })
}
