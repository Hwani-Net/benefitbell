import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";

// 프리미엄 결제일 조회 (Firestore payment_logs 컬렉션)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kakaoId = searchParams.get("kakaoId");
    if (!kakaoId) {
      return NextResponse.json({ date: null });
    }

    // PP-E01: Firebase idToken 검증 (IDOR 방지)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }
    const idToken = authHeader.slice(7);
    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      return NextResponse.json(
        { error: "Auth service unavailable" },
        { status: 503 },
      );
    }
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      const tokenKakaoId = decoded.uid.startsWith("kakao_")
        ? decoded.uid.slice(6)
        : decoded.uid;
      if (String(tokenKakaoId) !== String(kakaoId)) {
        return NextResponse.json(
          { error: "다른 사용자의 결제 정보에 접근할 수 없습니다." },
          { status: 403 },
        );
      }
    } catch (err) {
      console.error("[premium/payment-date] verifyIdToken failed:", err);
      return NextResponse.json(
        { error: "유효하지 않은 인증 토큰입니다." },
        { status: 401 },
      );
    }

    const db = getAdminFirestore();
    const snapshot = await db
      .collection("payment_logs")
      .where("kakao_id", "==", kakaoId)
      .orderBy("created_at", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ date: null });
    }

    const doc = snapshot.docs[0].data();
    const createdAt = doc.created_at?.toDate?.()?.toISOString() ?? null;
    return NextResponse.json({ date: createdAt });
  } catch (err) {
    console.error("[premium/payment-date] Error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
