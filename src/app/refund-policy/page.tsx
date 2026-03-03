'use client'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function RefundPolicyPage() {
  return (
    <>
      <TopBar />
      <main className="page-content" style={{ padding: '20px 16px 100px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)' }}>
          💰 환불 정책
        </h1>

        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {/* 핵심 요약 카드 */}
          <div style={{
            background: 'var(--color-blue-light)',
            borderRadius: 16,
            padding: '20px',
            marginBottom: 24,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              📌 핵심 요약
            </h2>
            <ul style={{ paddingLeft: 20, listStyleType: 'disc', margin: 0 }}>
              <li><strong>결제 후 7일 이내</strong>: 전액 환불 가능</li>
              <li><strong>결제 후 7일 초과</strong>: 잔여 기간 일할 계산 환불</li>
              <li><strong>환불 요청 방법</strong>: 카카오톡 채널 @hyetack-alimi</li>
            </ul>
          </div>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>1. 환불 조건</h2>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 13,
              marginTop: 8,
            }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>기간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>환불 금액</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>결제 후 7일 이내</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--color-green)', fontWeight: 600 }}>전액 환불</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>결제 후 7일 초과</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>잔여 기간 일할 계산</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>서비스 장애 (24시간 이상)</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)', color: 'var(--color-green)', fontWeight: 600 }}>전액 환불</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>2. 환불 불가 사유</h2>
            <ul style={{ paddingLeft: 20, listStyleType: 'disc' }}>
              <li>프리미엄 혜택을 상당 부분 이용한 경우 (AI 분석 50회 이상 사용)</li>
              <li>이용약관 위반으로 인한 서비스 정지의 경우</li>
              <li>프로모션 또는 무료 체험 기간 중 결제한 경우 (별도 안내)</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>3. 환불 절차</h2>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: '16px',
              marginTop: 8,
            }}>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                <li style={{ marginBottom: 8 }}>
                  <strong>카카오톡 채널</strong> @hyetack-alimi 으로 환불 요청
                </li>
                <li style={{ marginBottom: 8 }}>
                  <strong>필요 정보 전달</strong>: 카카오 닉네임, 결제일, 환불 사유
                </li>
                <li style={{ marginBottom: 8 }}>
                  <strong>확인 후 처리</strong>: 영업일 기준 3일 이내 환불 완료
                </li>
                <li>
                  <strong>환불 완료 안내</strong>: 카카오톡으로 환불 완료 알림
                </li>
              </ol>
            </div>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>4. 일할 계산 방식</h2>
            <p>
              환불 금액 = 결제 금액 × (잔여일 ÷ 30일)
            </p>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 12,
              padding: '12px 16px',
              marginTop: 8,
              fontSize: 13,
            }}>
              <p style={{ margin: 0 }}>
                <strong>예시:</strong> 4,900원 결제 후 20일 이용 → 잔여 10일<br/>
                환불 금액 = 4,900 × (10 ÷ 30) = <strong>약 1,633원</strong>
              </p>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>5. 문의</h2>
            <p>
              환불 관련 문의는 카카오톡 채널 <strong>@hyetack-alimi</strong>로 연락해주세요.
              영업시간: 평일 10:00 ~ 18:00 (주말·공휴일 제외)
            </p>
          </section>

          <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-tertiary)' }}>
            시행일: 2026년 3월 3일
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
