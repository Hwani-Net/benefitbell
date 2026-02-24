import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { kakaoId, nickname } = await req.json()

    if (!kakaoId) {
      return NextResponse.json({ error: 'kakaoId 필수' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // 1. Record the payment claim
    const { error: logError } = await supabase
      .from('premium_payments')
      .insert({
        kakao_id: kakaoId,
        nickname: nickname || '',
        amount: 4900,
        method: 'kakaopay_transfer',
        status: 'claimed',
      })

    if (logError) {
      console.error('Payment log error:', logError)
      // If it's a duplicate key or table issue, still proceed
    }

    // 2. Activate premium on user_profiles
    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert(
        {
          kakao_id: kakaoId,
          nickname: nickname || '',
          is_premium: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'kakao_id' }
      )

    if (updateError) {
      console.error('Premium activation error:', updateError)
      return NextResponse.json({ error: '프리미엄 활성화 실패' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: '프리미엄이 활성화되었습니다!' })
  } catch (error: any) {
    console.error('Premium activate exception:', error)
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
