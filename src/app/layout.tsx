import type { Metadata, Viewport } from 'next'
import { AppProvider } from '@/lib/context'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '혜택알리미 - 나에게 맞는 지원금, 한눈에',
  description: '기초생활수급자, 차상위계층, 청년, 장년, 노인 등 모든 계층의 정부 지원금·복지 혜택 신청 일정을 맞춤형으로 알려드립니다.',
  keywords: '지원금, 혜택, 기초생활수급, 청년, 복지, 알림, 신청일정',
  openGraph: {
    title: '혜택알리미',
    description: '나에게 맞는 지원금, 한눈에',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AppProvider>
          <div className="app-container">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  )
}
