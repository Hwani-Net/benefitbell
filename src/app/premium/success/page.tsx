"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/context";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { lang, userProfile, setUserProfile } = useApp();
  const isKo = lang === "ko";
  const [status, setStatus] = useState<"loading" | "success" | "checking">(
    "checking",
  );
  // Prevent double-invocation of confirm (React.StrictMode / deps change)
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) return;
    confirmedRef.current = true;

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");
    const kakaoIdStr = orderId?.split("_")[2];

    if (!paymentKey || !orderId || !amount) {
      window.location.href = "/premium/fail?message=invalid_request";
      return;
    }

    async function confirm() {
      setStatus("loading");
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
            kakaoId: kakaoIdStr,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          const msg = data.error || "결제 승인 실패";
          const code = data.code || "";
          window.location.href = `/premium/fail?message=${encodeURIComponent(msg)}&code=${code}`;
          return;
        }

        // Update client-side premium state
        if (userProfile) {
          setUserProfile({ ...userProfile, isPremium: true });
        }
        setStatus("success");
      } catch (err) {
        console.error("[premium/success] payment approval error:", err);
        window.location.href =
          "/premium/fail?message=" +
          encodeURIComponent(
            isKo
              ? "서버 승인 중 오류가 발생했습니다."
              : "An error occurred during payment approval.",
          );
      }
    }

    confirm();
    // Only run once on mount — searchParams is stable from useSearchParams()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div style={{ textAlign: "center" }}>
      {status === "success" ? (
        <>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            {isKo ? "결제가 완료되었습니다" : "Payment Complete"}
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
            {isKo
              ? "이제 프리미엄 혜택을 마음껏 누려보세요!"
              : "Enjoy your Premium benefits!"}
          </p>
          <Link
            href="/"
            className="btn btn-primary btn-lg"
            style={{
              minWidth: 200,
              display: "inline-block",
              textDecoration: "none",
            }}
          >
            {isKo ? "홈으로 돌아가기" : "Back to Home"}
          </Link>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
            {isKo ? "승인 중입니다..." : "Approving payment..."}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {isKo
              ? "창을 닫지 말고 잠시 기다려주세요."
              : "Please do not close this window."}
          </p>
        </>
      )}
    </div>
  );
}

export default function PremiumSuccessPage() {
  return (
    <>
      <TopBar />
      <main
        className="page-content"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          marginTop: -60,
        }}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
