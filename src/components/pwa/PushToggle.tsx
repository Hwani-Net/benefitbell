'use client'

import { useState, useEffect } from 'react'
import styles from './PushToggle.module.css'

import { getFirebaseMessaging } from '@/lib/firebase'
import { getToken, deleteToken } from 'firebase/messaging'

export default function PushToggle() {
  const [status, setStatus] = useState<'unsupported' | 'denied' | 'subscribed' | 'unsubscribed'>('unsubscribed')
  const [loading, setLoading] = useState(false)

  // FCM용 VAPID Key: Firebase 콘솔 > 프로젝트 설정 > 클라우드 메시징 > Web 영역
  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setStatus('denied')
      return
    }
    // Check if already subscribed via Service Worker
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

      const messaging = getFirebaseMessaging()
      if (!messaging) {
        throw new Error('Firebase Messaging not initialized')
      }

      const reg = await navigator.serviceWorker.ready

      // Get FCM token
      const currentToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: reg,
      })

      if (currentToken) {
        // 백엔드 API 포맷 변경: { fcmToken: "ey..." } 형태로 전송
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fcmToken: currentToken }),
        })
        setStatus('subscribed')
      } else {
        console.warn('No registration token available. Request permission to generate one.')
      }

    } catch (err) {
      console.error('[FCM Push subscribe]', err)
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const messaging = getFirebaseMessaging()
      if (messaging) {
        await deleteToken(messaging)
      }
      // 기존 네이티브 구독도 정리
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()

      // 서버에도 알림 (선택적) - 현재는 서버 API가 없으므로 생략
      setStatus('unsubscribed')
    } catch (err) {
      console.error('[FCM Push unsubscribe]', err)
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
