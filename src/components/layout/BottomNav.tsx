'use client'
import { useApp } from '@/lib/context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './BottomNav.module.css'

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const ProfileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const AiIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
    <path d="M12 2v1"/>
    <path d="M12 7a4 4 0 014 4c0 1.5-.8 2.8-2 3.4V16H10v-1.6A4 4 0 018 11a4 4 0 014-4z"/>
    <path d="M20 6l-1 1"/>
    <path d="M4 6l1 1"/>
  </svg>
)

/**
 * Unread notification badge.
 * SW push event stores a flag in localStorage: 'push_unread_count'
 * Cleared when user visits /profile or /ai page.
 */
function useUnreadBadge(pathname: string) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    function syncUnread() {
      try {
        const count = parseInt(localStorage.getItem('push_unread_count') || '0', 10)
        setUnread(isNaN(count) ? 0 : count)
      } catch { /* ignore */ }
    }
    syncUnread()
    window.addEventListener('push_unread_changed', syncUnread)
    return () => window.removeEventListener('push_unread_changed', syncUnread)
  }, [])

  // Clear badge when visiting home or profile
  useEffect(() => {
    if (pathname === '/' || pathname === '/profile') {
      try {
        localStorage.setItem('push_unread_count', '0')
        setUnread(0)
      } catch { /* ignore */ }
    }
  }, [pathname])

  return unread
}

export default function BottomNav() {
  const { t } = useApp()
  const pathname = usePathname()
  const unread = useUnreadBadge(pathname)

  const tabs = [
    { href: '/', label: t.home, Icon: HomeIcon, badge: unread },
    { href: '/search', label: t.search, Icon: SearchIcon, badge: 0 },
    { href: '/ai', label: t.aiRecommend, Icon: AiIcon, badge: 0 },
    { href: '/calendar', label: t.calendar, Icon: CalendarIcon, badge: 0 },
    { href: '/profile', label: t.myPage, Icon: ProfileIcon, badge: 0 },
  ]

  return (
    <nav className={styles.nav}>
      {tabs.map(({ href, label, Icon, badge }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} className={`${styles.tab} ${active ? styles.active : ''}`}>
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon />
              {badge > 0 && (
                <span
                  aria-label={`${badge}개 알림`}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -6,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    lineHeight: 1,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            <span className={styles.label}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
