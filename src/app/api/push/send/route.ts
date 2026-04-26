import { NextResponse } from "next/server";
import { getAdminMessaging } from "@/lib/firebase-admin";
import { getSubscriptions, removeSubscription } from "@/lib/push-store";
import { verifyCron } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

/**
 * P0 (security): Bearer 인증 가드.
 * 이 endpoint는 internal-only — /api/cron/notify 또는 외부 Cloud Scheduler가
 * Authorization: Bearer ${CRON_SECRET} 헤더로만 호출 가능.
 *
 * 미인증 시 401 반환. 프로덕션에 CRON_SECRET 미설정 시도 401 (fail-closed).
 * dev 모드(NODE_ENV=development)는 secret 없을 때 통과 허용.
 */
export async function POST(req: Request) {
  const authError = verifyCron(req);
  if (authError) return authError;

  try {
    const { title, body, url } = await req.json();
    const subs = await getSubscriptions();

    const messaging = getAdminMessaging();
    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        if (sub.fcmToken) {
          return messaging.send({
            token: sub.fcmToken,
            notification: {
              title: title || "혜택알리미 🔔",
              body: body || "마감 임박 혜택이 있습니다!",
            },
            data: { url: url || "/" },
          });
        }
        throw { code: "messaging/registration-token-not-registered" };
      }),
    );

    // Remove expired subscriptions
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const code = (r.reason as { code?: string })?.code;
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        ) {
          removeSubscription(subs[i].fcmToken || subs[i].endpoint).catch(
            () => {},
          );
        }
      }
    });

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ sent, failed, total: subs.length });
  } catch (err) {
    console.error("[Push Send]", err);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 },
    );
  }
}
