'use client'
import { useApp } from '@/lib/context'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import styles from './page.module.css'

const KAKAOPAY_LINK = process.env.NEXT_PUBLIC_KAKAOPAY_PREMIUM_LINK || ''

export default function PremiumPage() {
  const { t, userProfile, kakaoUser } = useApp()
  const isPremium = userProfile?.isPremium

  return (
    <>
      <TopBar />
      <main className="page-content">
        {isPremium ? (
          /* ===== 이미 프리미엄 유저 ===== */
          <section className={styles.hero}>
            <span className="badge badge-purple-soft mb-12">Premium ✓</span>
            <h1 className={styles.title}>프리미엄 이용 중 🎉</h1>
            <p className={styles.subtitle}>
              {kakaoUser?.nickname || '회원'}님, 프리미엄 혜택을 마음껏 이용하세요!
            </p>
            <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--color-purple-light)', borderRadius: 16 }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-primary)' }}>✅ 무제한 AI 혜택 분석</li>
                <li style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-primary)' }}>✅ 마감 14일 전 얼리버드 알림</li>
                <li style={{ fontSize: 14, marginBottom: 8, color: 'var(--text-primary)' }}>✅ 광고 없는 쾌적한 환경</li>
                <li style={{ fontSize: 14, color: 'var(--text-primary)' }}>✅ 카카오톡 1:1 맞춤 상담 우선</li>
              </ul>
            </div>
          </section>
        ) : (
          /* ===== 프리미엄 가입 유도 ===== */
          <>
            <section className={styles.hero}>
              <span className="badge badge-purple-soft mb-12">Premium</span>
              <h1 className={styles.title}>나에게 딱 맞는 혜택<br/>놓치지 마세요</h1>
              <p className={styles.subtitle}>
                AI가 더 똑똑하게 분석하고, 광고 없이 쾌적하게,<br/>
                마감 전 미리 알려드립니다.
              </p>
            </section>

            {/* 기능 카드 */}
            <section className="section">
              <div className={styles.featureCard}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                  🚀 프리미엄 혜택
                </h2>
                <ul className={styles.featureList}>
                  <li>✨ 무제한 AI 혜택 분석 (무료: 1일 3회)</li>
                  <li>⏰ 마감 14일 전 얼리버드 알림</li>
                  <li>🚫 서비스 내 모든 광고 제거</li>
                  <li>💬 카카오톡 1:1 맞춤 상담 우선 지원</li>
                </ul>
                <div className={styles.priceContainer}>
                  <div>
                    <span className={styles.price}>월 4,900원</span>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', marginLeft: 6 }}>커피 한 잔 가격</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 결제 버튼 */}
            <section className="section" style={{ padding: '0 16px' }}>
              {KAKAOPAY_LINK ? (
                <a
                  href={KAKAOPAY_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-full btn-lg"
                  style={{
                    background: '#FFE812',
                    color: '#3C1E1E',
                    fontWeight: 800,
                    fontSize: 16,
                    borderRadius: 14,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '16px 0',
                    boxShadow: '0 4px 12px rgba(255, 232, 18, 0.35)',
                  }}
                >
                  💳 카카오페이로 결제하기
                </a>
              ) : (
                <button
                  className="btn btn-full btn-lg"
                  disabled
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-tertiary)',
                    fontWeight: 700,
                    fontSize: 16,
                    borderRadius: 14,
                    padding: '16px 0',
                    cursor: 'not-allowed',
                    border: '1px dashed var(--border-color)',
                  }}
                >
                  💳 결제 시스템 준비 중...
                </button>
              )}

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10, lineHeight: 1.5 }}>
                카카오페이 송금 후 프리미엄이 활성화됩니다.<br/>
                문의: 카카오톡 채널 @hyetack-alimi
              </p>
            </section>

            {/* 비교 테이블 */}
            <section className="section">
              <div style={{ margin: '0 16px', overflow: 'hidden', borderRadius: 16, border: '1px solid var(--border-color)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)' }}>기능</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>무료</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#6E56CF' }}>프리미엄</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: '혜택 검색/조회', free: '✅', premium: '✅' },
                      { feature: '맞춤 추천', free: '✅', premium: '✅' },
                      { feature: 'AI 분석', free: '3회/일', premium: '무제한' },
                      { feature: '마감 알림', free: '3일 전', premium: '14일 전' },
                      { feature: '광고', free: '있음', premium: '없음' },
                      { feature: '1:1 상담', free: '—', premium: '우선 지원' },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>{row.feature}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>{row.free}</td>
                        <td style={{ padding: '10px 16px', textAlign: 'center', color: '#6E56CF', fontWeight: 600 }}>{row.premium}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* 커피 후원 */}
        <section className="section">
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 16,
            padding: '24px 20px',
            textAlign: 'center',
            margin: '0 16px',
          }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>☕</span>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              혜택알리미가 도움이 되셨나요?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              커피 한 잔 값으로 혜택알리미를 응원해주세요!<br/>
              여러분의 후원이 서비스 운영에 큰 힘이 됩니다. 🙏
            </p>
            <a
              href="https://www.buymeacoffee.com/stayicond"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-full btn-lg"
              style={{
                background: '#FFDD00',
                color: '#000',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(255, 221, 0, 0.3)',
                textDecoration: 'none',
                display: 'block',
                textAlign: 'center',
                lineHeight: '48px',
                borderRadius: 14,
              }}
            >
              ☕ Buy Me a Coffee
            </a>
          </div>
        </section>

        <div style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            결제 관련 문의는 카카오톡 채널로 연락주세요 💬
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
