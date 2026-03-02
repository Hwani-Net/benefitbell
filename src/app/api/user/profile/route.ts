import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

// 유저 프로필 저장 (Firestore users 컬렉션)
export async function POST(req: Request) {
  try {
    const { kakaoId, nickname, categories, age_group, region } = await req.json()
    if (!kakaoId) {
      return NextResponse.json({ error: 'kakaoId 필수' }, { status: 400 })
    }

    const db = getAdminFirestore()
    await db.collection('users').doc(String(kakaoId)).set(
      {
        kakao_id: kakaoId,
        nickname: nickname || '',
        categories: categories || [],
        age_group: age_group || null,
        region: region || null,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[user/profile] Error:', err)
    return NextResponse.json({ error: '저장 실패' }, { status: 500 })
  }
}
