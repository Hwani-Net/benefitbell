import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 20px",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <p style={{ fontSize: 64, marginBottom: 16 }}>🔍</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        페이지를 찾을 수 없어요
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
        요청하신 페이지가 없거나 이동됐을 수 있어요.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "var(--gradient-coral)",
          color: "#fff",
          borderRadius: "var(--border-radius-full)",
          padding: "12px 28px",
          fontSize: 15,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
