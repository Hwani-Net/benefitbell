import { NextResponse } from 'next/server'
import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * POST /api/premium/activate
 *
 * 보안 모델 (2026-03-10 BLOCK #1 수정):
 * - 구: NEXT_PUBLIC_PREMIUM_ACTIVATE_SECRET을 프론트에서 전송 → 브라우저 DevTools 노출 취약점
 * - 신: Firebase Auth idToken을 Authorization 헤더로 전송 → 서버에서 Admin SDK로 검증
 *
 * 클라이언트는 Authorization: Bearer <idToken> 헤더를 보내야 함.
 * idToken은 Firebase getIdToken()으로 얻으며, 서버단에서 verifyIdToken()으로 검증.
 */
export async function POST(req: Request) {
  try {
    // ── Auth Guard: Firebase idToken 검증 ──────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const idToken = authHeader.slice(7)
    const adminAuth = getAdminAuth()
    if (!adminAuth) {
      return NextResponse.json({ error: '서버 인증 초기화 실패' }, { status: 500 })
    }

    let decodedToken
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken)
    } catch {
      return NextResponse.json({ error: '유효하지 않은 인증 토큰입니다.' }, { status: 403 })
    }

    // Firebase UID에서 kakaoId 추출 (uid 형식: "kakao_1234567890")
    const firebaseUid = decodedToken.uid
    const kakaoId = firebaseUid.startsWith('kakao_')
      ? firebaseUid.replace('kakao_', '')
      : firebaseUid

    // ── Body 파싱 (nickname 선택적) ──────────────────────────
    let nickname = ''
    try {
      const body = await req.json()
      nickname = body?.nickname || ''
    } catch { /* nickname 없어도 허용 */ }

    // ── 중복 프리미엄 체크 ───────────────────────────────────
    const db = getAdminFirestore()
    const userDoc = await db.collection('users').doc(String(kakaoId)).get()
    if (userDoc.exists && userDoc.data()?.is_premium) {
      return NextResponse.json({ success: true, message: '이미 프리미엄 회원입니다.' })
    }

    // ── 결제 클레임 로그 ─────────────────────────────────────
    await db.collection('payment_logs').add({
      kakao_id: kakaoId,
      firebase_uid: firebaseUid,
      nickname: nickname || decodedToken.name || '',
      amount: 4900,
      method: 'kakaopay_transfer',
      status: 'claimed',
      created_at: FieldValue.serverTimestamp(),
    })

    // ── 프리미엄 활성화 ──────────────────────────────────────
    await db.collection('users').doc(String(kakaoId)).set(
      {
        kakao_id: kakaoId,
        firebase_uid: firebaseUid,
        nickname: nickname || decodedToken.name || '',
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
