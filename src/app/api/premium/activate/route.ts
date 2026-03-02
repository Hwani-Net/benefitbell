import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: Request) {
  try {
    const { kakaoId, nickname } = await req.json()

    if (!kakaoId) {
      return NextResponse.json({ error: 'kakaoId 필수' }, { status: 400 })
    }

    const db = getAdminFirestore()

    // 1. 결제 청구 기록 (payment_logs 컬렉션)
    await db.collection('payment_logs').add({
      kakao_id: kakaoId,
      nickname: nickname || '',
      amount: 4900,
      method: 'kakaopay_transfer',
      status: 'claimed',
      created_at: FieldValue.serverTimestamp(),
    })

    // 2. 유저 프리미엄 활성화 (users 컬렉션)
    await db.collection('users').doc(kakaoId).set(
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
