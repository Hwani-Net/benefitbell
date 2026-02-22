import type { Metadata, Viewport } from 'next'
import { AppProvider } from '@/lib/context'
import Script from 'next/script'
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: '혜택알리미 - 나에게 맞는 정부 지원금·복지 혜택, 한눈에',
    template: '%s | 혜택알리미',
  },
  description: '기초생활수급자, 차상위계층, 청년, 장년, 노인 등 모든 계층의 정부 지원금·복지 혜택 108건 이상을 실시간으로 확인하고 신청하세요. 의료급여, 에너지바우처, 청년 월세 지원금 등 놓치면 안 되는 혜택을 알려드립니다.',
  keywords: '지원금, 혜택, 기초생활수급, 차상위, 청년지원금, 노인복지, 장애인지원, 의료급여, 에너지바우처, 복지, 알림, 신청일정, 보조금24, 복지로, 정부지원금',
  manifest: '/manifest.json',
  metadataBase: new URL('https://benefitbell.kr'),
  alternates: {
    canonical: '/',
  },
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
    title: '혜택알리미 - 나에게 맞는 정부 지원금, 한눈에',
    description: '108건 이상의 정부 복지서비스를 실시간으로 확인하세요. 기초생활, 청년, 노인, 의료, 주거 등 맞춤형 혜택 알림.',
    type: 'website',
    locale: 'ko_KR',
    siteName: '혜택알리미 BenefitBell',
  },
  twitter: {
    card: 'summary_large_image',
    title: '혜택알리미 - 정부 지원금 한눈에',
    description: '놓치면 안 되는 정부 지원금·복지 혜택을 실시간으로 확인하세요.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: 'sbGL5jjVIjXUVVD7jvAsJorfd5qxpcsxrxuGhuOUZ6o',
    other: {
      'naver-site-verification': ['a7b4dc9ca23e400c6c0caa02bfebabc2fa1b0055'],
    },
  },
  other: {
    'naver-site-verification': 'a7b4dc9ca23e400c6c0caa02bfebabc2fa1b0055',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: '혜택알리미',
              alternateName: 'BenefitBell',
              description: '정부 지원금·복지 혜택 실시간 알림 서비스',
              url: 'https://benefitbell.kr',
              applicationCategory: 'GovernmentService',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'KRW',
              },
              author: {
                '@type': 'Organization',
                name: 'BenefitBell',
              },
            }),
          }}
        />
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
      {/* Kakao SDK */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
        integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <body>
        <GoogleAnalytics />
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
