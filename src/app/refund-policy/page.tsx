"use client";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { useApp } from "@/lib/context";

export default function RefundPolicyPage() {
  const { lang } = useApp();
  const isKo = lang === "ko";

  return (
    <>
      <TopBar />
      <main className="page-content" style={{ padding: "20px 16px 100px" }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 24,
            color: "var(--text-primary)",
          }}
        >
          {isKo ? "💰 환불 정책" : "💰 Refund Policy"}
        </h1>

        <div
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.8,
          }}
        >
          {/* 핵심 요약 카드 */}
          <div
            style={{
              background: "var(--color-blue-light)",
              borderRadius: 16,
              padding: "20px",
              marginBottom: 24,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              {isKo ? "📌 핵심 요약" : "📌 Summary"}
            </h2>
            <ul style={{ paddingLeft: 20, listStyleType: "disc", margin: 0 }}>
              {isKo ? (
                <>
                  <li>
                    <strong>결제 후 7일 이내</strong>: 전액 환불 가능
                  </li>
                  <li>
                    <strong>결제 후 7일 초과</strong>: 잔여 기간 일할 계산 환불
                  </li>
                  <li>
                    <strong>환불 요청 방법</strong>: 카카오톡 채널
                    @hyetack-alimi
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <strong>Within 7 days of payment</strong>: Full refund
                    available
                  </li>
                  <li>
                    <strong>After 7 days of payment</strong>: Pro-rated refund
                    for remaining period
                  </li>
                  <li>
                    <strong>How to request</strong>: KakaoTalk channel
                    @hyetack-alimi
                  </li>
                </>
              )}
            </ul>
          </div>

          <section style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              {isKo ? "1. 환불 조건" : "1. Refund Conditions"}
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                marginTop: 8,
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-secondary)" }}>
                  <th
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      fontWeight: 600,
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {isKo ? "기간" : "Period"}
                  </th>
                  <th
                    style={{
                      padding: "10px 12px",
                      textAlign: "left",
                      fontWeight: 600,
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {isKo ? "환불 금액" : "Refund Amount"}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {isKo ? "결제 후 7일 이내" : "Within 7 days of payment"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border-color)",
                      color: "var(--color-green)",
                      fontWeight: 600,
                    }}
                  >
                    {isKo ? "전액 환불" : "Full refund"}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {isKo ? "결제 후 7일 초과" : "After 7 days of payment"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {isKo
                      ? "잔여 기간 일할 계산"
                      : "Pro-rated for remaining days"}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {isKo
                      ? "서비스 장애 (24시간 이상)"
                      : "Service outage (24+ hours)"}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--border-color)",
                      color: "var(--color-green)",
                      fontWeight: 600,
                    }}
                  >
                    {isKo ? "전액 환불" : "Full refund"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              {isKo ? "2. 환불 불가 사유" : "2. Non-Refundable Cases"}
            </h2>
            <ul style={{ paddingLeft: 20, listStyleType: "disc" }}>
              {isKo ? (
                <>
                  <li>
                    프리미엄 혜택을 상당 부분 이용한 경우 (AI 분석 50회 이상
                    사용)
                  </li>
                  <li>이용약관 위반으로 인한 서비스 정지의 경우</li>
                  <li>
                    프로모션 또는 무료 체험 기간 중 결제한 경우 (별도 안내)
                  </li>
                </>
              ) : (
                <>
                  <li>
                    Substantial use of premium benefits (50+ AI analyses used)
                  </li>
                  <li>
                    Service suspension due to violation of Terms of Service
                  </li>
                  <li>
                    Payments made during promotional or free trial periods (see
                    separate notice)
                  </li>
                </>
              )}
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              {isKo ? "3. 환불 절차" : "3. Refund Process"}
            </h2>
            <div
              style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: "16px",
                marginTop: 8,
              }}
            >
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {isKo ? (
                  <>
                    <li style={{ marginBottom: 8 }}>
                      <strong>카카오톡 채널</strong> @hyetack-alimi 으로 환불
                      요청
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      <strong>필요 정보 전달</strong>: 카카오 닉네임, 결제일,
                      환불 사유
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      <strong>확인 후 처리</strong>: 영업일 기준 3일 이내 환불
                      완료
                    </li>
                    <li>
                      <strong>환불 완료 안내</strong>: 카카오톡으로 환불 완료
                      알림
                    </li>
                  </>
                ) : (
                  <>
                    <li style={{ marginBottom: 8 }}>
                      <strong>Contact</strong> KakaoTalk channel @hyetack-alimi
                      with a refund request
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      <strong>Provide required info</strong>: KakaoTalk
                      nickname, payment date, reason for refund
                    </li>
                    <li style={{ marginBottom: 8 }}>
                      <strong>Processing</strong>: Refund completed within 3
                      business days after review
                    </li>
                    <li>
                      <strong>Confirmation</strong>: Refund completion notice
                      sent via KakaoTalk
                    </li>
                  </>
                )}
              </ol>
            </div>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              {isKo ? "4. 일할 계산 방식" : "4. Pro-Rated Calculation"}
            </h2>
            <p>
              {isKo
                ? "환불 금액 = 결제 금액 × (잔여일 ÷ 30일)"
                : "Refund Amount = Payment Amount × (Remaining Days ÷ 30)"}
            </p>
            <div
              style={{
                background: "var(--bg-secondary)",
                borderRadius: 12,
                padding: "12px 16px",
                marginTop: 8,
                fontSize: 13,
              }}
            >
              {isKo ? (
                <p style={{ margin: 0 }}>
                  <strong>예시:</strong> 4,900원 결제 후 20일 이용 → 잔여 10일
                  <br />
                  환불 금액 = 4,900 × (10 ÷ 30) = <strong>약 1,633원</strong>
                </p>
              ) : (
                <p style={{ margin: 0 }}>
                  <strong>Example:</strong> ₩4,900 paid, 20 days used → 10 days
                  remaining
                  <br />
                  Refund = 4,900 × (10 ÷ 30) = <strong>approx. ₩1,633</strong>
                </p>
              )}
            </div>
          </section>

          <section>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
              }}
            >
              {isKo ? "5. 문의" : "5. Contact"}
            </h2>
            {isKo ? (
              <p>
                환불 관련 문의는 카카오톡 채널 <strong>@hyetack-alimi</strong>로
                연락해주세요. 영업시간: 평일 10:00 ~ 18:00 (주말·공휴일 제외)
              </p>
            ) : (
              <p>
                For refund inquiries, please contact KakaoTalk channel{" "}
                <strong>@hyetack-alimi</strong>. Business hours: Weekdays 10:00
                – 18:00 KST (excluding weekends and public holidays)
              </p>
            )}
          </section>

          <p
            style={{
              marginTop: 32,
              fontSize: 12,
              color: "var(--text-tertiary)",
            }}
          >
            {isKo ? "시행일: 2026년 3월 3일" : "Effective Date: March 3, 2026"}
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
