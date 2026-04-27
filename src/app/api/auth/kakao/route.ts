import { randomBytes } from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  // Firebase App Hosting runs behind a reverse proxy — request.url returns
  // internal address (0.0.0.0:8080). Use x-forwarded-host for the real domain.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const isDev = host.includes("localhost");

  // .trim() — GCP Secret Manager trailing newline 방어 (PITFALLS #15)
  const KAKAO_CLIENT_ID = (process.env.KAKAO_CLIENT_ID || "").trim();
  const origin = isDev
    ? `${requestUrl.protocol}//${host}`
    : `${forwardedProto}://${host}`;
  const REDIRECT_URI = `${origin}/api/auth/kakao/callback`;

  // CSRF 방어: 무작위 state 생성 후 httpOnly 쿠키에 저장
  const state = randomBytes(16).toString("hex");

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${state}`;

  const response = NextResponse.redirect(kakaoAuthUrl);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 300, // 5분
    secure: !isDev,
    path: "/",
  });

  return response;
}
