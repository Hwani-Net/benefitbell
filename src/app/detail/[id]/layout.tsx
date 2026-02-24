import type { Metadata } from 'next'

const BASE_URL = 'https://naedon-finder.vercel.app'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Dynamically generate Open Graph / Twitter metadata for each benefit detail page.
 * This runs on the server — the `page.tsx` can stay 'use client'.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  // Default fallback metadata
  const defaultMeta: Metadata = {
    title: '정부 지원금 상세 정보 | 혜택알리미',
    description: '나에게 맞는 정부 지원금·복지 혜택을 혜택알리미에서 확인하세요.',
    openGraph: {
      title: '정부 지원금 상세 정보 | 혜택알리미',
      description: '나에게 맞는 정부 지원금·복지 혜택을 혜택알리미에서 확인하세요.',
      url: `${BASE_URL}/detail/${id}`,
      siteName: '혜택알리미 BenefitBell',
      type: 'article',
      images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
    },
  }

  try {
    // 1차: 상세 API에서 제목·설명 가져오기 (servNm, overview)
    const detailRes = await fetch(`${BASE_URL}/api/benefits/${id}`, {
      next: { revalidate: 86400 }, // 24시간 캐시
    })

    if (detailRes.ok) {
      const json = await detailRes.json()
      if (json.success && json.data) {
        const { title, ministry, overview, supportContent } = json.data

        const ogTitle = `${title} | 혜택알리미`
        const rawDesc = overview || supportContent || '나에게 맞는 정부 복지 혜택을 확인하세요.'
        // OG description은 160자 이하로
        const ogDesc = rawDesc.length > 155
          ? rawDesc.slice(0, 155) + '…'
          : rawDesc

        const ministryText = ministry ? ` (${ministry})` : ''

        return {
          title: ogTitle,
          description: ogDesc,
          openGraph: {
            title: ogTitle,
            description: ogDesc,
            url: `${BASE_URL}/detail/${id}`,
            siteName: '혜택알리미 BenefitBell',
            type: 'article',
            locale: 'ko_KR',
            images: [
              {
                url: `${BASE_URL}/opengraph-image`,
                width: 1200,
                height: 630,
                alt: `${title}${ministryText} — 혜택알리미`,
              },
            ],
          },
          twitter: {
            card: 'summary_large_image',
            title: ogTitle,
            description: ogDesc,
          },
          alternates: {
            canonical: `/detail/${id}`,
          },
        }
      }
    }

    // 2차: 목록 API fallback (상세 API 실패 시)
    const listRes = await fetch(`${BASE_URL}/api/benefits`, {
      next: { revalidate: 3600 },
    })
    if (listRes.ok) {
      const listJson = await listRes.json()
      const benefit = (listJson.data ?? []).find((b: { id: string }) => b.id === id)
      if (benefit) {
        const ogTitle = `${benefit.title} | 혜택알리미`
        const ogDesc = `${benefit.amount ? benefit.amount + ' · ' : ''}${benefit.description ?? '정부 지원금·복지 혜택 정보를 확인하세요.'}`
        return {
          title: ogTitle,
          description: ogDesc.slice(0, 155),
          openGraph: {
            title: ogTitle,
            description: ogDesc.slice(0, 155),
            url: `${BASE_URL}/detail/${id}`,
            siteName: '혜택알리미 BenefitBell',
            type: 'article',
            locale: 'ko_KR',
            images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
          },
          twitter: { card: 'summary_large_image', title: ogTitle, description: ogDesc.slice(0, 155) },
          alternates: { canonical: `/detail/${id}` },
        }
      }
    }
  } catch (e) {
    console.warn('[detail layout] generateMetadata failed:', e)
  }

  return defaultMeta
}

export default function DetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
