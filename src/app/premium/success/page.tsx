'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useApp } from '@/lib/context'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

function SuccessContent() {
  const searchParams = useSearchParams()
  const { userProfile, setUserProfile } = useApp()
  const [status, setStatus] = useState<'loading' | 'success' | 'checking'>('checking')

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey')
    const orderId = searchParams.get('orderId')
    const amount = searchParams.get('amount')
    const kakaoIdStr = orderId?.split('_')[2]

    if (!paymentKey || !orderId || !amount) {
      window.location.href = '/premium/fail?message=invalid_request'
      return
    }

    async function confirm() {
      setStatus('loading')
      try {
        const res = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount, kakaoId: kakaoIdStr }),
        })

        if (!res.ok) {
          throw new Error('결제 승인 실패')
        }

        // 성공 시 클라이언트 전역 상태 프리미엄으로 변경
        setUserProfile({ ...userProfile, isPremium: true })
        setStatus('success')
      } catch (err) {
        window.location.href = '/premium/fail?message=' + encodeURIComponent('서버 승인 중 오류가 발생했습니다.')
      }
    }

    confirm()
  }, [searchParams, userProfile, setUserProfile])

  return (
    <div style={{ textAlign: 'center' }}>
      {status === 'success' ? (
        <>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>결제가 완료되었습니다</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>이제 프리미엄 혜택을 마음껏 누려보세요!</p>
          <a href="/profile" className="btn btn-primary btn-lg" style={{ minWidth: 200, display: 'inline-block', textDecoration: 'none' }}>
            내 프로필로 돌아가기
          </a>
        </>
      ) : (
        <>
           <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
           <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>승인 중입니다...</h1>
           <p style={{ color: 'var(--text-secondary)' }}>창을 닫지 말고 잠시 기다려주세요.</p>
        </>
      )}
    </div>
  )
}

export default function PremiumSuccessPage() {
  return (
    <>
      <TopBar />
      <main className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', marginTop: -60 }}>
        <Suspense fallback={<div>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <BottomNav />
    </>
  )
}
