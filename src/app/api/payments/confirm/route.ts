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
      const userMessage = getTossErrorMessage(body.code, body.message)
      return NextResponse.json({
        error: userMessage,
        code: body.code,
        retryable: isRetryableError(body.code),
      }, { status: response.status })
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

// ── Toss Error Helpers ──────────────────────────────────
const TOSS_ERROR_MESSAGES: Record<string, string> = {
  ALREADY_PROCESSED_PAYMENT: '이미 처리된 결제입니다.',
  PROVIDER_ERROR: '결제 서비스에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  EXCEED_MAX_CARD_INSTALLMENT_PLAN: '할부 개월 수가 초과되었습니다.',
  INVALID_CARD_EXPIRATION: '카드 유효기간이 올바르지 않습니다.',
  INVALID_STOPPED_CARD: '정지된 카드입니다. 카드사에 문의해주세요.',
  EXCEED_MAX_DAILY_PAYMENT_COUNT: '일일 결제 한도를 초과했습니다. 내일 다시 시도해주세요.',
  NOT_ALLOWED_POINT_USE: '포인트 사용이 불가한 결제입니다.',
  INVALID_API_KEY: '결제 설정에 문제가 있습니다. 관리자에게 문의해주세요.',
  INVALID_REJECT_CARD: '카드가 거절되었습니다. 카드사에 문의해주세요.',
  BELOW_MINIMUM_AMOUNT: '결제 금액이 최소 금액 미만입니다.',
  INVALID_CARD_LOST_OR_STOLEN: '분실/도난 신고된 카드입니다.',
  RESTRICTED_TRANSFER_ACCOUNT: '이체가 제한된 계좌입니다.',
  EXCEED_MAX_AMOUNT: '결제 한도를 초과했습니다.',
  INVALID_CARD_NUMBER: '카드 번호가 올바르지 않습니다.',
  NOT_FOUND_PAYMENT: '결제 정보를 찾을 수 없습니다.',
  NOT_FOUND_PAYMENT_SESSION: '결제 세션이 만료되었습니다. 처음부터 다시 시도해주세요.',
  UNAUTHORIZED_KEY: '결제 인증에 실패했습니다. 관리자에게 문의해주세요.',
  REJECT_CARD_PAYMENT: '카드 결제가 거절되었습니다. 다른 카드를 사용해주세요.',
}

const RETRYABLE_ERRORS = new Set([
  'PROVIDER_ERROR',
  'EXCEED_MAX_DAILY_PAYMENT_COUNT',
  'NOT_FOUND_PAYMENT_SESSION',
])

function getTossErrorMessage(code: string, fallback: string): string {
  return TOSS_ERROR_MESSAGES[code] || fallback || '결제 승인에 실패했습니다.'
}

function isRetryableError(code: string): boolean {
  return RETRYABLE_ERRORS.has(code)
}
