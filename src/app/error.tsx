"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <p style={{ fontSize: 48, marginBottom: 16 }}>😵</p>
      <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
        오류가 발생했습니다
      </p>
      <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        style={{
          background: "var(--gradient-coral)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--border-radius-full)",
          padding: "12px 28px",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        다시 시도
      </button>
    </div>
  );
}
