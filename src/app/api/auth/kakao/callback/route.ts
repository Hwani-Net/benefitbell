import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, host } = new URL(request.url)
  const code = searchParams.get('code')
  const isDev = host.includes('localhost')

  if (!code) {
    return NextResponse.redirect(new URL('/profile', request.url))
  }

  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || '2ea24765291ab5909d7c489615615b92'
  const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || 'LvPP6vSNsLX1FVIAxG9c3LSRMaMEYJWb'

  const REDIRECT_URI = isDev
    ? 'http://localhost:3001/api/auth/kakao/callback'
    : 'https://naedon-finder.vercel.app/api/auth/kakao/callback'

  try {
    // 1. Get Access Token
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code,
        client_secret: KAKAO_CLIENT_SECRET,
      }),
    })

    const tokenData = await tokenResponse.json()
    
    if (!tokenResponse.ok) {
      const errCode = tokenData.error || 'unknown'
      const errDesc = tokenData.error_description || JSON.stringify(tokenData)
      console.error('Kakao Token Error:', JSON.stringify(tokenData))
      return NextResponse.redirect(
        new URL(`/profile?error=token_failed&code=${errCode}&msg=${encodeURIComponent(errDesc)}`, request.url)
      )
    }


    // 2. Get User Profile Info
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    })

    const userData = await userResponse.json()
    
    if (!userResponse.ok) {
      console.error('Kakao User Info Error:', userData)
      return NextResponse.redirect(new URL('/profile?error=user_info_failed', request.url))
    }

    const nickname = userData.kakao_account?.profile?.nickname || '카카오 사용자'
    const profileImage = userData.kakao_account?.profile?.profile_image_url || null
    // Create response redirecting back to profile
    const response = NextResponse.redirect(new URL('/profile', request.url))
    
    // Set cookie with user data for the client to read
    const profileData = {
      id: userData.id,
      name: nickname,
      profile_image: profileImage,
      isKakaoLinked: true,
    }

    
    response.cookies.set('kakao_profile', JSON.stringify(profileData), {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Kakao Auth Exception:', error)
    return NextResponse.redirect(new URL('/profile?error=auth_exception', request.url))
  }
}
