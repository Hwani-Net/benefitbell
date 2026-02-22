'use client'
import { useApp } from '@/lib/context'
import styles from './TopBar.module.css'

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
)

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

export default function TopBar() {
  const { t, theme, toggleTheme, lang, setLang } = useApp()

  return (
    <header className={styles.topBar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <BellIcon />
        </div>
        <span className={styles.logoText}>{t.appName}</span>
      </div>
      <div className={styles.actions}>
        {/* 언어 토글 */}
        <button
          className={styles.actionBtn}
          onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
          aria-label="언어 전환"
        >
          <span className={styles.langText}>{lang === 'ko' ? 'EN' : '한'}</span>
        </button>
        {/* 테마 토글 */}
        <button
          className={styles.actionBtn}
          onClick={toggleTheme}
          aria-label="테마 전환"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
        {/* 프로필 아바타 */}
        <div className={styles.avatar}>
          <span>김</span>
        </div>
      </div>
    </header>
  )
}
