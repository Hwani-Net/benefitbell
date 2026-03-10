import { NextResponse } from 'next/server'
import { getAdminFirestore, getAdminMessaging } from '@/lib/firebase-admin'
import { fetchAllWelfareSources, transformListItemToBenefit, calculateDDay } from '@/lib/welfare-api'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(req: Request) {
  if (CRON_SECRET) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const db = getAdminFirestore()
    const messaging = getAdminMessaging()

    // 1. Firestore에서 모든 활성 구독자 조회
    const snapshot = await db.collection('push_subscriptions').get()
    const subscribers: { fcmToken?: string; endpoint?: string; docId: string; categories?: string[] }[] = []
    snapshot.docs.forEach(d => {
      const data = d.data()
      if (data.fcmToken || data.endpoint) {
        subscribers.push({ ...data, docId: d.id })
      }
    })

    if (subscribers.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No subscribers' })
    }

    // 2. 마감 7일 이내 OR 오픈 예정 혜택 필터
    const apiItems = await fetchAllWelfareSources()
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
      const matched = subCategories.length === 0
        ? relevantBenefits
        : relevantBenefits.filter(b => subCategories.includes(b.category))

      if (matched.length === 0) continue

      const top = matched[0]

      const categoryMessages: Record<string, { title: (d: number, name: string) => string; body: (name: string, amount: string) => string }> = {
        'small-biz': {
          title: (d, name) => d <= 7 ? `🏪 사장님, 마감 D-${d}: ${name}` : `🏪 소상공인 지원금 소식`,
          body: (name, amount) => `${name} — ${amount ? amount + ' 지원' : '신청 자격 확인해보세요!'}`,
        },
        'youth': {
          title: (d, name) => d <= 7 ? `⏰ 청년 혜택 D-${d}일 남음` : `🎓 청년 혜택 안내`,
          body: (name, amount) => `${name}${amount ? ` (${amount})` : ''} 신청 기간 확인하세요`,
        },
        'senior': {
          title: (d, name) => d <= 7 ? `👴 복지 알림 D-${d}` : `👴 어르신 복지 소식`,
          body: (name, _amount) => `${name} — 상세 내용을 확인해보세요`,
        },
        'housing': {
          title: (d, name) => d <= 7 ? `🏠 주거지원 D-${d}` : `🏠 주거 지원 안내`,
          body: (name, amount) => `${name}${amount ? ` — ${amount}` : ''} 신청 기간 확인하세요`,
        },
        'employment': {
          title: (d, name) => d <= 7 ? `💼 취업지원 D-${d}` : `💼 취업·일자리 혜택 안내`,
          body: (name, amount) => `${name}${amount ? ` (${amount})` : ''} 놓치지 마세요!`,
        },
      }

      const firstCat = subCategories[0] ?? 'default'
      const msgTemplate = categoryMessages[firstCat]
      const dDay = top.dDay
      const notifTitle = msgTemplate
        ? msgTemplate.title(dDay, top.title)
        : (dDay >= 0 && dDay <= 7 ? `📢 마감 D-${dDay}: ${top.title}` : `🔔 새 혜택: ${top.title}`)
      const notifBody = msgTemplate
        ? msgTemplate.body(top.title, top.amount ?? '')
        : (top.amount || '내가 받을 수 있는지 확인해보세요')

      try {
        if (sub.fcmToken) {
          const message = {
            token: sub.fcmToken,
            notification: {
              title: notifTitle,
              body: notifBody,
            },
            webpush: {
              fcmOptions: {
                link: `/detail/${top.id}`
              },
              notification: {
                icon: '/icons/icon-192x192.png',
              }
            },
            data: {
               url: `/detail/${top.id}`,
            }
          }
          await messaging.send(message)
          sent++
        } else {
           throw { code: 'messaging/registration-token-not-registered' }
        }
      } catch (err: unknown) {
        const errCode = (err as { code?: string })?.code
        if (errCode === 'messaging/registration-token-not-registered' || errCode === 'messaging/invalid-registration-token') {
          await db.collection('push_subscriptions').doc(sub.docId).delete()
        }
        failed.push(sub.fcmToken || sub.endpoint || sub.docId)
      }
    }

    console.log(`[cron] Sent: ${sent}, Failed: ${failed.length}`)
    return NextResponse.json({ sent, failed: failed.length, benefits: relevantBenefits.length })
  } catch (err) {
    console.error('[cron] Error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
