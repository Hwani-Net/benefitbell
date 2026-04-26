import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminMessaging } from "@/lib/firebase-admin";
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

    if (!title || !body) {
      return NextResponse.json(
        { error: "title and body required" },
        { status: 400 },
      );
    }
    const safeTitle = String(title).slice(0, 255);
    const safeBody = String(body).slice(0, 255);

    // Firestore 기반 구독자 조회 (in-memory push-store는 cold start 시 항상 비어있어 사용 불가)
    const db = getAdminFirestore();
    const snapshot = await db.collection("push_subscriptions").get();
    const subs: { fcmToken?: string; docId: string }[] = [];
    snapshot.docs.forEach((d) => {
      const data = d.data();
      if (data.fcmToken) subs.push({ fcmToken: data.fcmToken, docId: d.id });
    });

    if (subs.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, total: 0 });
    }

    const messaging = getAdminMessaging();
    const toDelete: string[] = [];

    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        return messaging.send({
          token: sub.fcmToken!,
          notification: {
            title: safeTitle || "혜택알리미 🔔",
            body: safeBody || "마감 임박 혜택이 있습니다!",
          },
          data: { url: url || "/" },
        });
      }),
    );

    // Collect expired tokens for cleanup
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const code = (r.reason as { code?: string })?.code;
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        ) {
          toDelete.push(subs[i].docId);
        }
      }
    });

    // Remove expired subscriptions from Firestore
    if (toDelete.length > 0) {
      await Promise.allSettled(
        toDelete.map((docId) =>
          db.collection("push_subscriptions").doc(docId).delete(),
        ),
      );
    }

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
