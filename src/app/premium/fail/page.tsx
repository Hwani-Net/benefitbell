"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { useApp } from "@/lib/context";

function FailContent() {
  const { lang } = useApp();
  const isKo = lang === "ko";
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") ||
    (isKo
      ? "결제 중 오류가 발생했습니다."
      : "An error occurred during payment.");
  const code = searchParams.get("code");

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <h1 className="section-title mb-12">
        {isKo ? "결제 실패" : "Payment Failed"}
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 8 }}>
        {message}
      </p>
      {code && (
        <p style={{ fontSize: 12, color: "#ff3b3b", marginBottom: 24 }}>
          Error Code: {code}
        </p>
      )}
      <a
        href="/premium"
        className="btn btn-outline"
        style={{ display: "inline-block", textDecoration: "none" }}
      >
        {isKo ? "다시 시도하기" : "Try Again"}
      </a>
    </div>
  );
}

function FailContentWrapper() {
  const { lang } = useApp();
  const isKo = lang === "ko";
  return (
    <Suspense fallback={<div>{isKo ? "로딩 중..." : "Loading..."}</div>}>
      <FailContent />
    </Suspense>
  );
}

export default function PremiumFailPage() {
  return (
    <>
      <TopBar />
      <main
        className="page-content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          marginTop: -60,
        }}
      >
        <FailContentWrapper />
      </main>
      <BottomNav />
    </>
  );
}
