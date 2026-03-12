import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  // Firebase App Hosting runs behind a reverse proxy — request.url returns
  // internal address (0.0.0.0:8080). Use x-forwarded-host for the real domain.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const host = forwardedHost || request.headers.get('host') || requestUrl.host
  const isDev = host.includes('localhost')

  // .trim() — GCP Secret Manager trailing newline 방어 (PITFALLS #15)
  const KAKAO_CLIENT_ID = (process.env.KAKAO_CLIENT_ID || '').trim()
  const origin = isDev
    ? `${requestUrl.protocol}//${host}`
    : `${forwardedProto}://${host}`
  const REDIRECT_URI = `${origin}/api/auth/kakao/callback`

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`

  return NextResponse.redirect(kakaoAuthUrl)
}
