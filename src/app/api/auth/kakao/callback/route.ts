import { NextResponse } from "next/server";
import { createKakaoCustomToken } from "@/lib/firebase-admin";

/**
 * Get the public-facing origin from request headers.
 * Firebase App Hosting runs behind a reverse proxy, so request.url
 * returns internal container address (0.0.0.0:8080).
 */
function getPublicOrigin(request: Request): string {
  const requestUrl = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const isDev = host.includes("localhost");
  return isDev
    ? `${requestUrl.protocol}//${host}`
    : `${forwardedProto}://${host}`;
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = getPublicOrigin(request);
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/profile`);
  }

  // .trim() — GCP Secret Manager trailing newline 방어 (PITFALLS #15)
  const KAKAO_CLIENT_ID = (process.env.KAKAO_CLIENT_ID || "").trim();
  const KAKAO_CLIENT_SECRET = (process.env.KAKAO_CLIENT_SECRET || "").trim();
  const REDIRECT_URI = `${origin}/api/auth/kakao/callback`;

  try {
    // 1. Get Access Token
    const tokenBody: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code,
    };
    // Only include client_secret if it's actually set (non-empty)
    if (KAKAO_CLIENT_SECRET && KAKAO_CLIENT_SECRET !== "placeholder") {
      tokenBody.client_secret = KAKAO_CLIENT_SECRET;
    }

    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams(tokenBody),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      const errCode = tokenData.error || "unknown";
      const errDesc = tokenData.error_description || "unknown_error";
      console.error("[Kakao Token Error]", { code: errCode, desc: errDesc });
      return NextResponse.redirect(
        `${origin}/profile?error=token_failed&code=${encodeURIComponent(errCode)}&msg=${encodeURIComponent(errDesc)}`,
      );
    }

    // 2. Get User Profile Info
    const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const userData = await userResponse.json();
    if (!userResponse.ok) {
      console.error("[Kakao User Info Error]", {
        status: userResponse.status,
        code: userData?.code,
        msg: userData?.msg,
      });
      return NextResponse.redirect(`${origin}/profile?error=user_info_failed`);
    }

    const kakaoId = String(userData.id);
    const nickname = userData.kakao_account?.profile?.nickname || "Kakao User";
    const profileImage =
      userData.kakao_account?.profile?.profile_image_url || null;

    // 3. Firebase Custom Token 발급
    let firebaseCustomToken: string | null = null;
    try {
      firebaseCustomToken = await createKakaoCustomToken(kakaoId, { nickname });
    } catch (fbErr) {
      // Firebase Admin 미설정(개발 초기) 시 graceful fallback
      console.warn(
        "[firebase] createCustomToken failed (fallback to cookie-only):",
        fbErr,
      );
    }

    // 4. 개인정보 동의 여부 확인 → 미동의 시 /consent 로 리다이렉트
    let needsConsent = false;
    try {
      const { getAdminFirestore } = await import("@/lib/firebase-admin");
      const db = getAdminFirestore();
      const userDoc = await db.collection("users").doc(kakaoId).get();
      if (!userDoc.exists || !userDoc.data()?.consent_agreed_at) {
        needsConsent = true;
      }
    } catch (dbErr) {
      // Firestore 조회 실패 시 동의 화면으로 보내는 것이 안전 (미동의 간주)
      console.error(
        "[kakao/callback] Firestore consent check failed — treating as needs-consent:",
        dbErr,
      );
      needsConsent = true;
    }

    const redirectPath = needsConsent ? "/consent?redirect=/" : "/profile";
    const response = NextResponse.redirect(`${origin}${redirectPath}`);

    // 기존 kakao_profile 쿠키 (하위 호환 유지)
    const profileData = {
      id: userData.id,
      name: nickname,
      profile_image: profileImage,
      isKakaoLinked: true,
    };
    response.cookies.set("kakao_profile", JSON.stringify(profileData), {
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
    });

    // Firebase Custom Token 쿠키 (client에서 signInWithCustomToken 호출 후 즉시 삭제)
    if (firebaseCustomToken) {
      response.cookies.set("firebase_custom_token", firebaseCustomToken, {
        path: "/",
        maxAge: 60 * 5, // 5분 — 즉시 소비용 (Firebase custom token 자체 유효기간 1시간)
        sameSite: "lax",
        httpOnly: false, // intentional: client needs to read token for Firebase Auth (P3 — by design)
      });
    }

    return response;
  } catch (error) {
    console.error("Kakao Auth Exception:", error);
    return NextResponse.redirect(`${origin}/profile?error=auth_exception`);
  }
}
