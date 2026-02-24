'use client'
import { useApp } from '@/lib/context'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import styles from './page.module.css'

export default function PremiumPage() {
  const { t } = useApp()

  return (
    <>
      <TopBar />
      <main className="page-content">
        <section className={styles.hero}>
          <span className="badge badge-purple-soft mb-12">Premium</span>
          <h1 className={styles.title}>프리미엄 서비스<br/>준비 중입니다</h1>
          <p className={styles.subtitle}>
            더 똑똑한 AI 분석, 광고 없는 쾌적한 환경,<br/>
            그리고 맞춤형 얼리버드 알림까지.<br/>
            곧 만나보실 수 있습니다!
          </p>
        </section>

        <section className="section">
          <div className={styles.featureCard}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
              🚀 준비 중인 기능
            </h2>
            <ul className={styles.featureList}>
              <li>✨ 무제한 AI 혜택 분석 (기존 1일 3회)</li>
              <li>⏰ 마감 14일 전 얼리버드 알림</li>
              <li>🚫 서비스 내 모든 광고 제거</li>
              <li>💬 카카오톡 1:1 맞춤 상담 우선 지원</li>
            </ul>
            <div className={styles.priceContainer}>
              <span className={styles.price} style={{ opacity: 0.5, textDecoration: 'line-through' }}>월 4,900원</span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 8 }}>출시 예정</span>
            </div>
          </div>
        </section>

        {/* 커피값 후원 */}
        <section className="section">
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 16,
            padding: '24px 20px',
            textAlign: 'center',
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
              className="btn btn-primary btn-full btn-lg"
              style={{
                background: '#FFDD00',
                color: '#000',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(255, 221, 0, 0.3)',
              }}
            >
              ☕ 커피 한 잔 후원하기
            </a>
          </div>
        </section>

        <div style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            프리미엄 서비스 출시 시 알림을 받고 싶으시면<br/>
            푸시 알림을 활성화해주세요! 🔔
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
