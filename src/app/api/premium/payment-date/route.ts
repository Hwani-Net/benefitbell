import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

// 프리미엄 결제일 조회 (Firestore payment_logs 컬렉션)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const kakaoId = searchParams.get('kakaoId')
    if (!kakaoId) {
      return NextResponse.json({ date: null })
    }

    const db = getAdminFirestore()
    const snapshot = await db
      .collection('payment_logs')
      .where('kakao_id', '==', kakaoId)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ date: null })
    }

    const doc = snapshot.docs[0].data()
    const createdAt = doc.created_at?.toDate?.()?.toISOString() ?? null
    return NextResponse.json({ date: createdAt })
  } catch (err) {
    console.error('[premium/payment-date] Error:', err)
    return NextResponse.json({ date: null })
  }
}
