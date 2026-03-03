import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// Internal API secret — prevents direct external access
const ACTIVATE_SECRET = process.env.PREMIUM_ACTIVATE_SECRET || ''

export async function POST(req: Request) {
  try {
    const { kakaoId, nickname, secret } = await req.json()

    // ── Auth Guard ──────────────────────────────────────────
    // 1. Secret key check (blocks direct curl/Postman calls)
    if (!ACTIVATE_SECRET || secret !== ACTIVATE_SECRET) {
      return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 403 })
    }

    // 2. Required params
    if (!kakaoId) {
      return NextResponse.json({ error: 'kakaoId 필수' }, { status: 400 })
    }

    // 3. Rate limit: check if already premium (prevent duplicate claims)
    const db = getAdminFirestore()
    const userDoc = await db.collection('users').doc(String(kakaoId)).get()
    if (userDoc.exists && userDoc.data()?.is_premium) {
      return NextResponse.json({ success: true, message: '이미 프리미엄 회원입니다.' })
    }

    // 4. Log payment claim
    await db.collection('payment_logs').add({
      kakao_id: kakaoId,
      nickname: nickname || '',
      amount: 4900,
      method: 'kakaopay_transfer',
      status: 'claimed',
      created_at: FieldValue.serverTimestamp(),
    })

    // 5. Activate premium
    await db.collection('users').doc(String(kakaoId)).set(
      {
        kakao_id: kakaoId,
        nickname: nickname || '',
        is_premium: true,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return NextResponse.json({ success: true, message: '프리미엄이 활성화되었습니다!' })
  } catch (error) {
    console.error('Premium activate exception:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
