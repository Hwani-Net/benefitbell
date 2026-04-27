/**
 * Global loading fallback for Next.js App Router.
 * Shown during page-level Suspense transitions (route segment loading).
 */
export default function GlobalLoading() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        background: "var(--color-bg, #fff)",
      }}
      aria-busy="true"
      aria-label="페이지 로딩 중"
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "3px solid var(--color-primary, #FF6B4A)",
          borderTopColor: "transparent",
          animation: "spin 0.75s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
