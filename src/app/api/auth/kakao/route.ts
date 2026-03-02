import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { host } = requestUrl
  const isDev = host.includes('localhost')

  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID!
  // 개발: 실제 요청 origin(포트 포함) 사용 → 3001, 3004 등 어느 포트든 동작
  const REDIRECT_URI = isDev
    ? `${requestUrl.origin}/api/auth/kakao/callback`
    : `${requestUrl.protocol}//${requestUrl.host}/api/auth/kakao/callback`

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`

  return NextResponse.redirect(kakaoAuthUrl)
}
