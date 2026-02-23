'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

function FailContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || '결제 중 오류가 발생했습니다.'
  const code = searchParams.get('code')

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <h1 className="section-title mb-12">결제 실패</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{message}</p>
      {code && <p style={{ fontSize: 12, color: '#ff3b3b', marginBottom: 24 }}>Error Code: {code}</p>}
      <a href="/premium" className="btn btn-outline" style={{ display: 'inline-block', textDecoration: 'none' }}>
        다시 시도하기
      </a>
    </div>
  )
}

export default function PremiumFailPage() {
  return (
    <>
      <TopBar />
      <main className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', marginTop: -60 }}>
        <Suspense fallback={<div>Loading...</div>}>
          <FailContent />
        </Suspense>
      </main>
      <BottomNav />
    </>
  )
}
