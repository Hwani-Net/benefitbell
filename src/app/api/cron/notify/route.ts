import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminMessaging } from "@/lib/firebase-admin";
import {
  calculateDDay,
  fetchAllWelfareSources,
  transformListItemToBenefit,
} from "@/lib/welfare-api";
import { verifyCron } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

// PP-005: Bearer 검사를 메서드 가드보다 먼저 수행하기 위해 POST/GET 모두 동일 핸들러로 라우팅
async function handleCron(req: Request) {
  const authError = verifyCron(req);
  if (authError) return authError;

  try {
    // Firestore 기반 구독자 조회 (in-memory push-store는 cold start 시 항상 비어있어 사용 불가)
    const db = getAdminFirestore();
    const snapshot = await db.collection("push_subscriptions").get();
    const subs: { fcmToken?: string; docId: string }[] = [];
    snapshot.docs.forEach((d) => {
      const data = d.data();
      if (data.fcmToken) subs.push({ fcmToken: data.fcmToken, docId: d.id });
    });

    if (subs.length === 0) {
      return NextResponse.json({ message: "No subscriptions", sent: 0 });
    }

    // Find urgent benefits (D-Day <= 3) from real API
    const apiItems = await fetchAllWelfareSources();
    const allBenefits = apiItems.map((item, i) =>
      transformListItemToBenefit(item, i),
    );
    const urgentBenefits = allBenefits
      .map((b) => ({ ...b, dDay: calculateDDay(b.applicationEnd) }))
      .filter((b) => b.dDay >= 0 && b.dDay <= 3)
      .sort((a, b) => a.dDay - b.dDay);

    if (urgentBenefits.length === 0) {
      return NextResponse.json({
        message: "No urgent benefits today",
        sent: 0,
      });
    }

    const topBenefit = urgentBenefits[0];
    const dDayText =
      topBenefit.dDay === 0 ? "오늘 마감!" : `D-${topBenefit.dDay}`;
    const amountText = topBenefit.amount ? ` — ${topBenefit.amount}` : "";

    const messaging = getAdminMessaging();
    const toDelete: string[] = [];

    const results = await Promise.allSettled(
      subs.map(async (sub) => {
        return messaging.send({
          token: sub.fcmToken!,
          notification: {
            title: `🔔 마감 임박! ${urgentBenefits.length}건의 혜택`,
            body: `${topBenefit.title} - ${dDayText}${amountText}`,
          },
          webpush: {
            fcmOptions: { link: `/detail/${topBenefit.id}` },
            notification: { icon: "/icons/icon-192.png" },
          },
          data: { url: `/detail/${topBenefit.id}` },
        });
      }),
    );

    // Cleanup expired tokens
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

    if (toDelete.length > 0) {
      await Promise.allSettled(
        toDelete.map((docId) =>
          db.collection("push_subscriptions").doc(docId).delete(),
        ),
      );
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `[cron/notify] sent: ${sent}, failed: ${failed}, urgent: ${urgentBenefits.length}, expired-cleaned: ${toDelete.length}`,
    );

    return NextResponse.json({
      sent,
      failed,
      urgentBenefits: urgentBenefits.map((b) => ({
        title: b.title,
        dDay: b.dDay,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[cron/notify] Fatal error:", err);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}

// PP-005: GET/POST 모두 동일 핸들러로 라우팅 (Bearer 검사 메서드 가드보다 우선)
export const GET = handleCron;
export const POST = handleCron;
