'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import styles from './page.module.css'

const KAKAOPAY_LINK = process.env.NEXT_PUBLIC_KAKAOPAY_PREMIUM_LINK || ''

export default function PremiumPage() {
  const { t, userProfile, kakaoUser, setUserProfile } = useApp()
  const isPremium = userProfile?.isPremium
  const [step, setStep] = useState<'idle' | 'paying' | 'activating' | 'done'>('idle')
  const [error, setError] = useState('')

  const handlePayClick = () => {
    if (!KAKAOPAY_LINK) return
    // Open KakaoPay in new tab
    window.open(KAKAOPAY_LINK, '_blank')
    // Show "I've paid" button
    setStep('paying')
  }

  const handleActivate = async () => {
    if (!kakaoUser) {
      setError('로그인이 필요합니다.')
      return
    }

    setStep('activating')
    setError('')

    try {
      const res = await fetch('/api/premium/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kakaoId: String(kakaoUser.id),
          nickname: kakaoUser.nickname,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '활성화에 실패했습니다.')
        setStep('paying')
        return
      }

      // Update local state
      if (userProfile && setUserProfile) {
        setUserProfile({ ...userProfile, isPremium: true })
      }
      setStep('done')
    } catch (err) {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
      setStep('paying')
    }
  }

  return (
    <>
      <TopBar />
      <main className="page-content">
        {(isPremium || step === 'done') ? (
          /* ===== 프리미엄 유저 ===== */
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
            {step === 'done' && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--color-green-light)', borderRadius: 12, textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'var(--color-green)', fontWeight: 600 }}>
                  🎊 프리미엄이 활성화되었습니다!
                </p>
              </div>
            )}
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

            {/* 결제 플로우 */}
            <section className="section" style={{ padding: '0 16px' }}>
              {step === 'idle' && (
                <>
                  {kakaoUser ? (
                    <button
                      onClick={handlePayClick}
                      className="btn btn-full btn-lg"
                      style={{
                        background: '#FFE812',
                        color: '#3C1E1E',
                        fontWeight: 800,
                        fontSize: 16,
                        borderRadius: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '16px 0',
                        boxShadow: '0 4px 12px rgba(255, 232, 18, 0.35)',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      💳 카카오페이로 결제하기
                    </button>
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
                        width: '100%',
                      }}
                    >
                      🔒 로그인 후 결제할 수 있어요
                    </button>
                  )}
                </>
              )}

              {step === 'paying' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: 'var(--color-blue-light)',
                    borderRadius: 16,
                    padding: '20px',
                    marginBottom: 16,
                  }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                      💳 카카오페이로 송금하셨나요?
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      송금이 완료되면 아래 버튼을 눌러<br/>프리미엄을 활성화해주세요!
                    </p>
                  </div>

                  <button
                    onClick={handleActivate}
                    className="btn btn-full btn-lg"
                    style={{
                      background: 'var(--gradient-purple)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: 16,
                      borderRadius: 14,
                      padding: '16px 0',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
                    }}
                  >
                    ✅ 결제 완료! 프리미엄 활성화
                  </button>

                  <button
                    onClick={() => { window.open(KAKAOPAY_LINK, '_blank') }}
                    style={{
                      marginTop: 12,
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    카카오페이 다시 열기
                  </button>
                </div>
              )}

              {step === 'activating' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: 32, marginBottom: 12, animation: 'spin 1s linear infinite' }}>⏳</div>
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>프리미엄 활성화 중...</p>
                </div>
              )}

              {error && (
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-red)', textAlign: 'center' }}>
                  ⚠️ {error}
                </p>
              )}

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12, lineHeight: 1.5 }}>
                결제 관련 문의: 카카오톡 채널 @hyetack-alimi
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

        {/* 약관 / 환불 정책 / 문의 */}
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 8 }}>
            <a href="/terms" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'underline' }}>
              이용약관
            </a>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>|</span>
            <a href="/refund-policy" style={{ fontSize: 13, color: 'var(--text-tertiary)', textDecoration: 'underline' }}>
              환불 정책
            </a>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            결제 관련 문의는 카카오톡 채널로 연락주세요 💬
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
