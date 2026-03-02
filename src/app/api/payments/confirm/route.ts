import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(req: Request) {
  try {
    const { paymentKey, orderId, amount, kakaoId } = await req.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })
    }

    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: '서버 결제 설정 오류 (Secret Key)' }, { status: 500 })
    }

    // 토스페이먼츠 승인 API 호출
    const basicToken = Buffer.from(`${secretKey}:`, 'utf-8').toString('base64')
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: { Authorization: `Basic ${basicToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
    })

    const body = await response.json()
    if (!response.ok) {
      console.error('Toss Payments Confirm Error:', body)
      return NextResponse.json({ error: body.message || '결제 승인 실패' }, { status: response.status })
    }

    // 승인 성공 시: Firestore에 프리미엄 권한 부여
    if (kakaoId) {
      const db = getAdminFirestore()
      try {
        await db.collection('users').doc(String(kakaoId)).set(
          { is_premium: true, updated_at: FieldValue.serverTimestamp() },
          { merge: true }
        )
        await db.collection('payment_logs').add({
          kakao_id: kakaoId,
          order_id: orderId,
          amount: Number(amount),
          method: 'toss',
          status: 'confirmed',
          created_at: FieldValue.serverTimestamp(),
        })
      } catch (dbErr) {
        console.error('Firestore Update Error:', dbErr)
        return NextResponse.json({ message: '결제는 성공했으나 DB 업데이트에 실패했습니다.', details: body }, { status: 200 })
      }
    }

    return NextResponse.json({ success: true, payment: body }, { status: 200 })
  } catch (error) {
    console.error('Payment API Exception:', error)
    return NextResponse.json({ error: '서버 내부 오류 발생' }, { status: 500 })
  }
}
