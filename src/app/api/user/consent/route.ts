import { NextResponse } from "next/server";
import { getAdminFirestore, getAdminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// POST /api/user/consent
// Body: { kakaoId: string }
// Header: Authorization: Bearer <firebase_id_token>
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kakaoId } = body;

    if (!kakaoId) {
      return NextResponse.json({ error: "kakaoId 필수" }, { status: 400 });
    }

    // 인증 토큰 검증
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }
    const idToken = authHeader.slice(7);

    const adminAuth = getAdminAuth();
    // PP-F01: getAdminAuth() null 가드
    if (!adminAuth) {
      return NextResponse.json(
        { error: "Auth service unavailable" },
        { status: 503 },
      );
    }
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch (err) {
      console.error("[user/consent] verifyIdToken failed:", err);
      return NextResponse.json(
        { error: "유효하지 않은 인증 토큰입니다." },
        { status: 403 },
      );
    }

    const tokenKakaoId = decoded.uid.startsWith("kakao_")
      ? decoded.uid.slice(6)
      : decoded.uid;

    if (String(tokenKakaoId) !== String(kakaoId)) {
      return NextResponse.json(
        { error: "다른 사용자의 동의 정보에 접근할 수 없습니다." },
        { status: 403 },
      );
    }

    // Firestore에 동의 정보 저장
    const db = getAdminFirestore();
    await db.collection("users").doc(String(kakaoId)).set(
      {
        consent_agreed_at: FieldValue.serverTimestamp(),
        sensitive_consent_agreed_at: FieldValue.serverTimestamp(),
        consent_version: "v1",
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[user/consent] Error:", err);
    return NextResponse.json({ error: "동의 저장 실패" }, { status: 500 });
  }
}
