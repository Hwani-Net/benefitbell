'use client'
import { useEffect, useState } from 'react'
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk'
import { useApp } from '@/lib/context'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import styles from './page.module.css'

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm'

export default function PremiumPage() {
  const { kakaoUser, userProfile } = useApp()
  const [paymentWidget, setPaymentWidget] = useState<PaymentWidgetInstance | null>(null)
  
  useEffect(() => {
    // 1. 위젯 초기화 (고객 키는 유니크해야 함. 로그인 안됐으면 ANONYMOUS)
    const initWidget = async () => {
      const customerKey = kakaoUser?.id ? String(kakaoUser.id) : 'ANONYMOUS'
      const widget = await loadPaymentWidget(clientKey, customerKey)
      setPaymentWidget(widget)
    }
    initWidget()
  }, [kakaoUser])

  useEffect(() => {
    // 2. 결제 UI 렌더링
    if (paymentWidget) {
      paymentWidget.renderPaymentMethods('#payment-method', { value: 4900 })
      paymentWidget.renderAgreement('#agreement')
    }
  }, [paymentWidget])

  const handlePayment = async () => {
    if (!kakaoUser) {
      alert('결제 전 카카오 로그인이 필요합니다.')
      return
    }

    try {
      await paymentWidget?.requestPayment({
        orderId: `order_${Date.now()}_${kakaoUser.id}`,
        orderName: '혜택알리미 프리미엄 정기구독 1개월',
        successUrl: `${window.location.origin}/premium/success`,
        failUrl: `${window.location.origin}/premium/fail`,
        customerEmail: 'customer@email.com',
        customerName: kakaoUser.nickname,
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <TopBar />
      <main className="page-content">
        <section className={styles.hero}>
          <span className="badge badge-purple-soft mb-12">Premium</span>
          <h1 className={styles.title}>내게 꼭 맞는 혜택,<br/>더 똑똑하게 찾아보세요</h1>
          <p className={styles.subtitle}>
            제한 없는 AI 분석과 광고 없는 쾌적한 환경,<br/>
            그리고 14일 전 미리 알려주는 맞춤형 알림까지.
          </p>
        </section>

        <section className="section">
          <div className={styles.featureCard}>
            <ul className={styles.featureList}>
              <li>✨ 무제한 AI 혜택 분석 (기존 1일 3회)</li>
              <li>⏰ 마감 14일 전 얼리버드 알림</li>
              <li>🚫 서비스 내 모든 광고 제거</li>
              <li>💬 카카오톡 1:1 맞춤 상담 우선 지원</li>
            </ul>
            <div className={styles.priceContainer}>
              <span className={styles.price}>월 4,900원</span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className={styles.paymentContainer}>
             <h2 className="section-title mb-12" style={{marginLeft: 16}}>결제하기</h2>
            {/* 결제 UI */}
            <div id="payment-method" />
            {/* 이용약관 UI */}
            <div id="agreement" />
          </div>
        </section>

        <div style={{ padding: '24px 16px' }}>
          {!kakaoUser && (
            <p style={{ textAlign: 'center', color: '#ff3b3b', fontSize: 13, marginBottom: 12 }}>
              카카오 로그인이 필요합니다.
            </p>
          )}
          {userProfile.isPremium ? (
             <div className="btn btn-primary btn-full btn-lg" style={{ background: '#4CAF50', opacity: 1 }}>
               🌟 이미 프리미엄 회원이십니다
             </div>
          ) : (
            <button
              className="btn btn-primary btn-full btn-lg"
              disabled={!paymentWidget || !kakaoUser}
              onClick={handlePayment}
              style={{
                boxShadow: '0 8px 16px rgba(110, 86, 207, 0.2)'
              }}
            >
              4,900원 결제하고 혜택받기
            </button>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
