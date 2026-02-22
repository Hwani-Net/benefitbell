'use client'
import { useApp } from '@/lib/context'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

export default function BottomNav() {
  const { t } = useApp()
  const pathname = usePathname()

  const tabs = [
    { href: '/', label: t.home, Icon: HomeIcon },
    { href: '/search', label: t.search, Icon: SearchIcon },
    { href: '/calendar', label: t.calendar, Icon: CalendarIcon },
    { href: '/profile', label: t.myPage, Icon: ProfileIcon },
  ]

  return (
    <nav className={styles.nav}>
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} className={`${styles.tab} ${active ? styles.active : ''}`}>
            <Icon />
            <span className={styles.label}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
