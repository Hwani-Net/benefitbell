'use client'

import { useState, useEffect } from 'react'
import styles from './InstallBanner.module.css'
import { useApp } from '@/lib/context'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<'android' | 'ios' | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const { lang } = useApp()

  useEffect(() => {
    // Already in standalone mode (already installed)
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Already dismissed
    if (localStorage.getItem('pwa-banner-dismissed') === 'true') return

    // iOS detection
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    if (isIOS && isSafari) {
      // Defer setState to setTimeout callback to avoid synchronous setState in effect
      setTimeout(() => {
        setPlatform('ios')
        setShow(true)
      }, 3000)
      return
    }

    // Android / Chrome: listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setPlatform('android')
      // Show banner after 3 seconds
      setTimeout(() => setShow(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('pwa-banner-dismissed', 'true')
  }

  if (!show || dismissed) return null

  return (
    <div className={`${styles.banner} ${show ? styles.visible : ''}`} role="dialog" aria-label={lang === 'ko' ? '앱 설치 안내' : 'Install App'}>
      <div className={styles.icon}>📲</div>
      <div className={styles.content}>
        <p className={styles.title}>{lang === 'ko' ? '홈 화면에 추가하기' : 'Add to Home Screen'}</p>
        {platform === 'ios' ? (
          <p className={styles.desc}>
            {lang === 'ko'
              ? <> Safari 하단 <strong>공유 버튼 →</strong> <strong>홈 화면에 추가</strong></>
              : <> Tap <strong>Share →</strong> <strong>Add to Home Screen</strong></>}
          </p>
        ) : (
          <p className={styles.desc}>{lang === 'ko' ? '앱처럼 빠르게 · 알림 받기 · 오프라인 지원' : 'Fast like an app · Push alerts · Offline support'}</p>
        )}
      </div>
      <div className={styles.actions}>
        {platform === 'android' && (
          <button id="pwa-install-btn" className={styles.installBtn} onClick={handleInstall}>
            {lang === 'ko' ? '설치' : 'Install'}
          </button>
        )}
        <button id="pwa-dismiss-btn" className={styles.dismissBtn} onClick={handleDismiss} aria-label={lang === 'ko' ? '닫기' : 'Close'}>
          ✕
        </button>
      </div>
    </div>
  )
}
