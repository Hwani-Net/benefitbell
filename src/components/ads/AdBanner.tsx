'use client'
import { useEffect, useRef } from 'react'
import { useApp } from '@/lib/context'

interface AdBannerProps {
  slot?: string          // AdSense ad unit slot ID (optional — uses auto ads if empty)
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  style?: React.CSSProperties
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

/**
 * Google AdSense banner component.
 * Publisher: ca-pub-9200560771587224
 * Automatically hidden for premium users.
 *
 * Usage:
 *   <AdBanner slot="1234567890" format="auto" />
 */
export default function AdBanner({ slot, format = 'auto', style, className }: AdBannerProps) {
  const { userProfile } = useApp()
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    // Don't push ad if premium user
    if (userProfile?.isPremium) return
    if (pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch (e) {
      console.error('[AdBanner] adsbygoogle push error:', e)
    }
  }, [userProfile?.isPremium])

  // Premium users see no ads
  if (userProfile?.isPremium) return null

  return (
    <div className={className} style={{ overflow: 'hidden', textAlign: 'center', ...style }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-9200560771587224"
        {...(slot ? { 'data-ad-slot': slot } : {})}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
