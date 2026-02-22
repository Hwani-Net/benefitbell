'use client'

import { useState, useEffect } from 'react'
import styles from './PushToggle.module.css'

export default function PushToggle() {
  const [status, setStatus] = useState<'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('unsubscribed')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    // Check if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? 'subscribed' : 'unsubscribed')
      })
    })
  }, [])

  const subscribe = async () => {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setStatus('subscribed')
    } catch (err) {
      console.error('[Push subscribe]', err)
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      setStatus('unsubscribed')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unsupported') return null

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.icon}>🔔</span>
        <div>
          <p className={styles.label}>마감 임박 알림</p>
          <p className={styles.desc}>
            {status === 'denied'
              ? '브라우저 설정에서 알림을 허용해주세요'
              : status === 'subscribed'
              ? '알림이 활성화되어 있습니다'
              : '신청 마감 전 푸시 알림을 받으세요'}
          </p>
        </div>
      </div>
      {status !== 'denied' && (
        <button
          id="push-toggle-btn"
          className={`${styles.toggle} ${status === 'subscribed' ? styles.on : ''} ${loading ? styles.loading : ''}`}
          onClick={status === 'subscribed' ? unsubscribe : subscribe}
          disabled={loading}
          aria-label={status === 'subscribed' ? '알림 끄기' : '알림 켜기'}
        >
          <span className={styles.knob} />
        </button>
      )}
    </div>
  )
}

// utility
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}
