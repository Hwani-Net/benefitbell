import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // TODO: verify if unsafe-eval can be removed - Firebase SDK dependency (signInWithCustomToken, FCM SW) and Next.js HMR both use eval; remove only after staging smoke test confirms no breakage
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.tosspayments.com https://t1.kakaocdn.net https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://firestore.googleapis.com https://fcm.googleapis.com https://www.google-analytics.com https://kapi.kakao.com https://kauth.kakao.com wss://*.firebaseio.com",
              "font-src 'self'",
              "frame-src 'self' https://js.tosspayments.com https://pay.kakaopay.com",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
