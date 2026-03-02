'use client'
/**
 * PushMessageReceiver
 *
 * Listens for Service Worker postMessage events (type: 'PUSH_RECEIVED')
 * and increments the push_unread_count in localStorage,
 * then dispatches a custom event so BottomNav updates without page reload.
 */
import { useEffect } from 'react'

export default function PushMessageReceiver() {
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'PUSH_RECEIVED') {
        try {
          const current = parseInt(localStorage.getItem('push_unread_count') || '0', 10)
          localStorage.setItem('push_unread_count', String(current + 1))
          window.dispatchEvent(new Event('push_unread_changed'))
        } catch { /* ignore */ }
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleMessage)
    return () => navigator.serviceWorker?.removeEventListener('message', handleMessage)
  }, [])

  return null // no UI
}
