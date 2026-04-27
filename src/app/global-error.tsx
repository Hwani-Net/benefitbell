"use client";
import { useEffect } from "react";

/**
 * global-error.tsx — catches errors in the root layout itself.
 * Must include its own <html>/<body> since layout is bypassed.
 * https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error-boundary]", error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          fontFamily: "sans-serif",
          textAlign: "center",
          padding: "80px 20px",
          background: "#fff",
        }}
      >
        <p style={{ fontSize: 48, marginBottom: 16 }}>💥</p>
        <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          예기치 않은 오류가 발생했습니다
        </p>
        <p style={{ color: "#888", marginBottom: 32 }}>
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#FF6B4A",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "12px 28px",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          다시 시도
        </button>
      </body>
    </html>
  );
}
