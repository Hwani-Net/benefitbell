import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, host } = new URL(request.url)
  const isDev = host.includes('localhost')

  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || '2ea24765291ab5909d7c489615615b92'
  const REDIRECT_URI = isDev
    ? 'http://localhost:3001/api/auth/kakao/callback'
    : 'https://naedon-finder.vercel.app/api/auth/kakao/callback'

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`

  return NextResponse.redirect(kakaoAuthUrl)
}
