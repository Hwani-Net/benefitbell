import type { Metadata, Viewport } from 'next'
import { AppProvider } from '@/lib/context'
import Script from 'next/script'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: '혜택알리미 - 나에게 맞는 지원금, 한눈에',
  description: '기초생활수급자, 차상위계층, 청년, 장년, 노인 등 모든 계층의 정부 지원금·복지 혜택 신청 일정을 맞춤형으로 알려드립니다.',
  keywords: '지원금, 혜택, 기초생활수급, 청년, 복지, 알림, 신청일정',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '혜택알리미',
  },
  icons: {
    apple: '/icons/icon-192.png',
    icon: '/icons/icon-512.png',
  },
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
      <head>
        <meta name="application-name" content="혜택알리미" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="혜택알리미" />
        <meta name="theme-color" content="#FF6B4A" />
        <meta name="msapplication-TileColor" content="#FF6B4A" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="mask-icon" href="/icons/icon-192.png" color="#FF6B4A" />
      </head>
      <body>
        <AppProvider>
          <div className="app-container">
            {children}
          </div>
        </AppProvider>
        {/* Service Worker 등록 */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('[SW] Registered:', reg.scope))
                  .catch(err => console.error('[SW] Registration failed:', err))
              })
            }
          `}
        </Script>
      </body>
    </html>
  )
}
