"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getFirebaseAuth } from "@/lib/firebase";
import { useApp } from "@/lib/context";

function ConsentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/";
  const ALLOWED_REDIRECTS = [
    "/",
    "/profile",
    "/search",
    "/calendar",
    "/premium",
    "/ai",
  ];
  const redirectTo = ALLOWED_REDIRECTS.includes(rawRedirect)
    ? rawRedirect
    : "/";
  const { lang } = useApp();
  const isKo = lang === "ko";

  const [generalConsent, setGeneralConsent] = useState(false);
  const [sensitiveConsent, setSensitiveConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allChecked = generalConsent && sensitiveConsent;

  const handleSubmit = async () => {
    if (!allChecked || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      if (!auth?.currentUser) {
        setError(
          isKo
            ? "로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요."
            : "Unable to verify login. Please sign in again.",
        );
        setSubmitting(false);
        return;
      }

      // 쿠키에서 kakaoId 확인
      const cookieVal = document.cookie
        .split("; ")
        .find((r) => r.startsWith("kakao_profile="))
        ?.split("=")
        .slice(1)
        .join("=");

      let kakaoId: string | null = null;
      if (cookieVal) {
        try {
          const profile = JSON.parse(decodeURIComponent(cookieVal));
          kakaoId = String(profile.id);
        } catch {
          // cookie parse 실패 시 Firebase uid에서 추출
        }
      }

      if (!kakaoId) {
        const uid = auth.currentUser.uid;
        kakaoId = uid.startsWith("kakao_") ? uid.slice(6) : uid;
      }

      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch("/api/user/consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ kakaoId }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(
          json.error ||
            (isKo ? "동의 저장에 실패했습니다." : "Failed to save consent."),
        );
      }

      router.replace(redirectTo);
    } catch (err) {
      console.error("[consent] submit failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : isKo
            ? "오류가 발생했습니다. 다시 시도해 주세요."
            : "An error occurred. Please try again.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0 0 40px",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
          padding: "20px 20px 16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 24 }}>🔔</span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "var(--color-coral)",
            }}
          >
            혜택알리미
          </span>
        </div>
        <h1
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.4,
          }}
        >
          {isKo
            ? "서비스 이용을 위한 개인정보 동의"
            : "Personal Information Consent"}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginTop: 4,
          }}
        >
          {isKo
            ? "맞춤 혜택 추천을 위해 아래 동의가 필요합니다."
            : "The following consent is required for personalized benefit recommendations."}
        </p>
      </div>

      {/* 본문 */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* ── 일반 개인정보 동의 ── */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--border-radius-lg)",
            border: `2px solid ${generalConsent ? "var(--color-coral)" : "var(--border-color)"}`,
            padding: "20px 18px",
            transition: "border-color 0.2s ease",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ paddingTop: 2 }}>
              <input
                type="checkbox"
                checked={generalConsent}
                onChange={(e) => setGeneralConsent(e.target.checked)}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 1,
                  height: 1,
                  margin: 0,
                }}
                aria-label={
                  isKo
                    ? "일반 개인정보 수집·이용 동의"
                    : "General Personal Information Consent"
                }
              />
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: `2px solid ${generalConsent ? "var(--color-coral)" : "var(--text-tertiary)"}`,
                  background: generalConsent
                    ? "var(--color-coral)"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {generalConsent && (
                  <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                    <path
                      d="M1.5 5L5 8.5L11.5 1.5"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--color-coral)",
                    background: "var(--color-coral-light)",
                    padding: "2px 7px",
                    borderRadius: 99,
                  }}
                >
                  {isKo ? "필수" : "Required"}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {isKo
                    ? "일반 개인정보 수집·이용 동의"
                    : "General Personal Information Consent"}
                </span>
              </div>
              <table
                style={{
                  width: "100%",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  borderCollapse: "collapse",
                  lineHeight: 1.7,
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: 72,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        verticalAlign: "top",
                        paddingBottom: 4,
                      }}
                    >
                      {isKo ? "수집 항목" : "Data Collected"}
                    </td>
                    <td style={{ paddingBottom: 4 }}>
                      {isKo
                        ? "카카오 ID, 이름, 거주 지역, 소득분위, 고용상태, 주거형태, 가구원 수"
                        : "Kakao ID, name, region, income level, employment status, housing type, household size"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        verticalAlign: "top",
                        paddingBottom: 4,
                      }}
                    >
                      {isKo ? "목적" : "Purpose"}
                    </td>
                    <td style={{ paddingBottom: 4 }}>
                      {isKo
                        ? "맞춤 혜택 추천 및 알림 발송"
                        : "Personalized benefit recommendations and notifications"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        verticalAlign: "top",
                      }}
                    >
                      {isKo ? "보유기간" : "Retention Period"}
                    </td>
                    <td>
                      {isKo ? "회원 탈퇴 시까지" : "Until account deletion"}
                    </td>
                  </tr>
                </tbody>
              </table>
              <Link
                href="/privacy"
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--color-coral)",
                  textDecoration: "underline",
                }}
              >
                {isKo ? "개인정보처리방침 전문 보기" : "View Privacy Policy"}
              </Link>
            </div>
          </label>
        </div>

        {/* ── 민감정보 동의 (물리적 분리 — 별도 카드) ── */}
        <div
          style={{
            background: "var(--bg-card)",
            borderRadius: "var(--border-radius-lg)",
            border: `2px solid ${sensitiveConsent ? "#8B5CF6" : "var(--border-color)"}`,
            padding: "20px 18px",
            transition: "border-color 0.2s ease",
          }}
        >
          {/* 민감정보 경고 배너 */}
          <div
            style={{
              background: "rgba(139, 92, 246, 0.08)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 14,
              fontSize: 12,
              color: "#7C3AED",
              lineHeight: 1.5,
            }}
          >
            {isKo ? (
              <>
                ⚠️ 아래는 <strong>민감정보</strong>입니다. 일반 동의와 별도로
                수집됩니다.
              </>
            ) : (
              <>
                ⚠️ The following is <strong>sensitive data</strong> collected
                separately.
              </>
            )}
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ paddingTop: 2 }}>
              <input
                type="checkbox"
                checked={sensitiveConsent}
                onChange={(e) => setSensitiveConsent(e.target.checked)}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 1,
                  height: 1,
                  margin: 0,
                }}
                aria-label={
                  isKo
                    ? "민감정보 수집·이용 동의"
                    : "Sensitive Information Consent"
                }
              />
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  border: `2px solid ${sensitiveConsent ? "#8B5CF6" : "var(--text-tertiary)"}`,
                  background: sensitiveConsent ? "#8B5CF6" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                }}
              >
                {sensitiveConsent && (
                  <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                    <path
                      d="M1.5 5L5 8.5L11.5 1.5"
                      stroke="white"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#7C3AED",
                    background: "rgba(139, 92, 246, 0.1)",
                    padding: "2px 7px",
                    borderRadius: 99,
                  }}
                >
                  {isKo ? "필수" : "Required"}
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {isKo
                    ? "민감정보 수집·이용 동의"
                    : "Sensitive Information Consent"}
                </span>
              </div>
              <table
                style={{
                  width: "100%",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  borderCollapse: "collapse",
                  lineHeight: 1.7,
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: 72,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        verticalAlign: "top",
                        paddingBottom: 4,
                      }}
                    >
                      {isKo ? "수집 항목" : "Data Collected"}
                    </td>
                    <td style={{ paddingBottom: 4 }}>
                      {isKo
                        ? "임신 여부, 장애 여부, 의료급여 수급 여부"
                        : "Pregnancy status, disability status, medical aid status"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        verticalAlign: "top",
                        paddingBottom: 4,
                      }}
                    >
                      {isKo ? "목적" : "Purpose"}
                    </td>
                    <td style={{ paddingBottom: 4 }}>
                      {isKo
                        ? "복지 혜택 자격 매칭 및 추천"
                        : "Welfare benefit eligibility matching and recommendations"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        verticalAlign: "top",
                        paddingBottom: 4,
                      }}
                    >
                      {isKo ? "보유기간" : "Retention Period"}
                    </td>
                    <td style={{ paddingBottom: 4 }}>
                      {isKo ? "회원 탈퇴 시까지" : "Until account deletion"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        verticalAlign: "top",
                      }}
                    >
                      {isKo ? "거부 시" : "If refused"}
                    </td>
                    <td>
                      {isKo
                        ? "임신·장애·의료급여 관련 혜택 추천이 제한됩니다."
                        : "Recommendations for pregnancy, disability, and medical aid benefits will be limited."}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </label>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              background: "var(--color-red-light)",
              border: "1px solid var(--color-red)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "var(--color-red)",
            }}
          >
            {error}
          </div>
        )}

        {/* 동의 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!allChecked || submitting}
          style={{
            width: "100%",
            padding: "16px 0",
            borderRadius: "var(--border-radius-lg)",
            border: "none",
            background: allChecked
              ? "var(--gradient-coral)"
              : "var(--bg-secondary)",
            color: allChecked ? "#fff" : "var(--text-tertiary)",
            fontSize: 16,
            fontWeight: 700,
            cursor: allChecked ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow: allChecked ? "var(--shadow-coral)" : "none",
          }}
        >
          {submitting
            ? isKo
              ? "저장 중..."
              : "Saving..."
            : isKo
              ? "동의하고 시작하기"
              : "Agree and Continue"}
        </button>

        <p
          style={{
            fontSize: 12,
            color: "var(--text-tertiary)",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {isKo
            ? "위 항목에 모두 동의해야 서비스를 이용할 수 있습니다."
            : "You must agree to all items above to use the service."}
          <br />
          {isKo ? (
            <>
              동의 내용은 언제든지{" "}
              <Link
                href="/privacy"
                style={{
                  color: "var(--color-coral)",
                  textDecoration: "underline",
                }}
              >
                개인정보처리방침
              </Link>
              에서 확인 가능합니다.
            </>
          ) : (
            <>
              You can review our{" "}
              <Link
                href="/privacy"
                style={{
                  color: "var(--color-coral)",
                  textDecoration: "underline",
                }}
              >
                Privacy Policy
              </Link>
              .
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense>
      <ConsentContent />
    </Suspense>
  );
}
