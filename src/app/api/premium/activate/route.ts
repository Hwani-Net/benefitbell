import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

/**
 * POST /api/premium/activate
 *
 * 결제 클레임 접수 엔드포인트.
 *
 * 보안 모델:
 * - 일반 호출: Firebase idToken으로 사용자 인증 → 결제 클레임을 "pending_review"로 로그만 기록.
 *   is_premium은 서버가 자동 설정하지 않음. 어드민이 입금 확인 후 Firestore Console 또는
 *   ADMIN_ACTIVATION_SECRET을 사용한 별도 호출로 수동 활성화.
 * - 어드민 활성화: X-Admin-Secret 헤더가 ADMIN_ACTIVATION_SECRET과 일치하면 즉시 is_premium=true로 활성화.
 *
 * 어드민이 입금 확인 후 활성화하는 예시:
 *   curl -X POST https://benefitbell-web--ai-project-ce41f.asia-east1.hosted.app/api/premium/activate \
 *     -H "Authorization: Bearer <USER_ID_TOKEN>" \
 *     -H "X-Admin-Secret: <ADMIN_ACTIVATION_SECRET>" \
 *     -H "Content-Type: application/json" \
 *     -d '{"nickname":"홍길동"}'
 */
export async function POST(req: Request) {
  try {
    // ── Auth Guard: Firebase idToken 검증 ──────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const idToken = authHeader.slice(7);
    const adminAuth = getAdminAuth();

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (err) {
      console.error("[premium/activate] verifyIdToken failed:", err);
      return NextResponse.json(
        { error: "유효하지 않은 인증 토큰입니다." },
        { status: 403 },
      );
    }

    // Firebase UID에서 kakaoId 추출 (uid 형식: "kakao_1234567890")
    const firebaseUid = decodedToken.uid;
    const kakaoId = firebaseUid.startsWith("kakao_")
      ? firebaseUid.replace("kakao_", "")
      : firebaseUid;

    // ── 어드민 시크릿 검증 ─────────────────────────────────
    const adminSecret = (process.env.ADMIN_ACTIVATION_SECRET || "").trim();
    const adminHeader = req.headers.get("X-Admin-Secret");
    const isAdminActivate = Boolean(
      adminSecret && adminHeader && adminHeader === adminSecret,
    );

    // ── Body 파싱 (nickname 선택적) ──────────────────────────
    let nickname = "";
    try {
      const body = await req.json();
      nickname = body?.nickname || "";
    } catch (err) {
      console.warn("[premium/activate] body parse failed:", err);
    }

    // ── 중복 프리미엄 체크 ───────────────────────────────────
    const db = getAdminFirestore();
    const userDoc = await db.collection("users").doc(String(kakaoId)).get();
    if (userDoc.exists && userDoc.data()?.is_premium) {
      return NextResponse.json({
        success: true,
        status: "already_active",
        message: "이미 프리미엄 회원입니다.",
      });
    }

    // ── 결제 클레임 로그 (어드민 모드에 따라 상태 분기) ──────
    await db.collection("payment_logs").add({
      kakao_id: kakaoId,
      firebase_uid: firebaseUid,
      nickname: nickname || decodedToken.name || "",
      amount: 4900,
      method: "kakaopay_transfer",
      status: isAdminActivate ? "verified" : "pending_review",
      created_at: FieldValue.serverTimestamp(),
    });

    // ── 사용자 문서 업데이트 ─────────────────────────────────
    // 일반 호출: nickname/uid 만 기록, is_premium은 손대지 않음 (어드민 검증 후 활성화).
    // 어드민 호출: is_premium=true로 즉시 활성화.
    await db
      .collection("users")
      .doc(String(kakaoId))
      .set(
        {
          kakao_id: kakaoId,
          firebase_uid: firebaseUid,
          nickname: nickname || decodedToken.name || "",
          ...(isAdminActivate ? { is_premium: true } : {}),
          updated_at: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

    if (isAdminActivate) {
      return NextResponse.json({
        success: true,
        status: "activated",
        message: "프리미엄이 활성화되었습니다!",
      });
    }

    return NextResponse.json({
      success: true,
      status: "pending_review",
      message: "결제 확인 중입니다. 입금 확인 후 1~24시간 내 활성화됩니다.",
    });
  } catch (error) {
    console.error("Premium activate exception:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
