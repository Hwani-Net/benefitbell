'use client'
import { useState, useCallback } from 'react'
import { useApp } from '@/lib/context'
import { getDDayColor, getDDayText, bText } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import styles from './page.module.css'

export default function CalendarPage() {
  const { t, lang, toggleBookmark, isBookmarked, benefits: allBenefits, benefitsLoading: loading } = useApp()
  const now = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(now.getDate())
  const [sharedId, setSharedId] = useState<string | null>(null)

  // Web Share API
  const handleShare = useCallback(async (benefitId: string, title: string) => {
    const url = `${window.location.origin}/detail/${benefitId}`
    const text = lang === 'ko'
      ? `💡 ${title} — 혜택알리미에서 확인하세요!`
      : `💡 ${title} — Check on BenefitBell!`
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        setSharedId(benefitId)
        setTimeout(() => setSharedId(null), 2500)
      } catch (err) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          await navigator.clipboard?.writeText(url)
          setSharedId(benefitId)
          setTimeout(() => setSharedId(null), 2500)
        }
      }
    } else {
      await navigator.clipboard?.writeText(url)
      setSharedId(benefitId)
      setTimeout(() => setSharedId(null), 2500)
    }
  }, [lang])


  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Benefits that have a deadline on a specific day
  const getBenefitsForDay = (day: number) => {
    const dateStr = `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`
    return allBenefits.filter(b => b.applicationEnd === dateStr)
  }

  // Get the minimum dDay for a specific calendar day (to determine urgency level)
  const getMinDDayForDay = (day: number) => {
    const dateStr = `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`
    const benefits = allBenefits.filter(b => b.applicationEnd === dateStr)
    if (benefits.length === 0) return null
    return Math.min(...benefits.map(b => b.dDay))
  }

  const hasBenefits = (day: number) => {
    const dateStr = `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`
    return allBenefits.some(b => b.applicationEnd === dateStr)
  }

  // Benefits that are always open (상시)
  const alwaysOpenBenefits = allBenefits.filter(b =>
    b.applicationEnd === '상시' || b.applicationStart === '상시'
  )

  // Benefits with deadlines this month
  const monthlyDeadlines = allBenefits.filter(b => {
    if (b.applicationEnd === '상시') return false
    const parts = b.applicationEnd.split('.')
    if (parts.length < 2) return false
    const endYear = parseInt(parts[0])
    const endMonth = parseInt(parts[1])
    return endYear === year && endMonth === month + 1
  })

  // D-7 이하 임박 혜택 (오늘 기준)
  const urgentBenefits = allBenefits.filter(b => b.dDay >= 0 && b.dDay <= 7 && b.status === 'open')
    .sort((a, b) => a.dDay - b.dDay)

  const selectedBenefits = getBenefitsForDay(selectedDay)
  const isToday = (d: number) => {
    const today = new Date()
    return year === today.getFullYear() && month === today.getMonth() && d === today.getDate()
  }
  const _monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = t.calDayNames

  return (
    <>
      <TopBar />
      <main className="page-content">
        <section className="section" style={{ paddingTop: 8 }}>
          <h1 className="section-title mb-12">{t.benefitCalendar}</h1>

          {/* D-7 이하 임박 알림 배너 */}
          {!loading && urgentBenefits.length > 0 && (
            <div className={styles.urgentBanner}>
              <span className={styles.urgentIcon}>⏰</span>
              <div className={styles.urgentText}>
                <strong>{t.urgentBannerTitle(urgentBenefits.length)}</strong>
                <span>{t.urgentBannerSub(lang === 'ko' ? urgentBenefits[0].title : urgentBenefits[0].titleEn, urgentBenefits.length - 1)}</span>
              </div>
              <span className={`badge badge-red`}>D-{urgentBenefits[0].dDay}</span>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>
              {t.calLoading}
            </div>
          )}

          {/* Calendar Header */}
          <div className={styles.calHeader}>
            <button className={styles.navBtn} onClick={prevMonth}>‹</button>
            <div className={styles.calTitle}>
              <span className={styles.calYear}>{t.calMonthTitle(year, month + 1)}</span>
              <span className={styles.calHint}>{t.calHint}</span>
            </div>
            <button className={styles.navBtn} onClick={nextMonth}>›</button>
          </div>

          {/* Day Header */}
          <div className={styles.dayHeader}>
            {dayNames.map((d: string, idx: number) => (
              <span key={d} className={`${styles.dayName} ${idx === 0 ? styles.sunday : ''}`}>{d}</span>
            ))}
          </div>

          {/* Date Grid */}
          <div className={styles.dayGrid}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1
              const hasB = hasBenefits(day)
              const minDDay = getMinDDayForDay(day)
              const isSelected = day === selectedDay
              const isTd = isToday(day)
              const isUrgent = minDDay !== null && minDDay <= 3
              const isSoon = minDDay !== null && minDDay > 3 && minDDay <= 7
              return (
                <button
                  key={day}
                  className={`
                    ${styles.dayCell}
                    ${isSelected ? styles.selected : ''}
                    ${isTd ? styles.today : ''}
                    ${isUrgent && !isSelected ? styles.urgentDay : ''}
                    ${isSoon && !isSelected ? styles.soonDay : ''}
                  `}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                  {hasB && <span className={styles.dot} />}
                </button>
              )
            })}
          </div>

          {/* Selected Day Benefits */}
          <div className={styles.dayBenefits}>
            <div className="section-header" style={{ marginBottom: 12 }}>
              <h2 className="section-title" style={{ fontSize: 15 }}>
                {t.benefitsOnDate(lang === 'ko' ? `${month + 1}월 ${selectedDay}일` : `${month + 1}/${selectedDay}`)}
              </h2>
            </div>

            {selectedBenefits.length === 0 ? (
              <div className={styles.emptyDay}>
                <span>📅</span>
                <p>{t.noBenefits}</p>
              </div>
            ) : (
              <div className={styles.benefitCards}>
                {selectedBenefits.map(b => (
                  <Link key={b.id} href={`/detail/${b.id}`} className={styles.calCard}>
                    <div className={styles.calCardLeft}>
                      <div className={styles.calCardMeta}>
                        <span className={`badge badge-coral-soft`}>{bText(b, 'categoryLabel', lang)}</span>
                        <span className={`badge ${getDDayColor(b.dDay)}`}>{getDDayText(b.dDay, lang === 'ko' ? 'ko' : 'en')}</span>
                      </div>
                      <h3 className={styles.calCardTitle}>{bText(b, 'title', lang)}</h3>
                      <p className={styles.calCardAmount}>{bText(b, 'amount', lang)}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#ef4444', padding: '4px' }}
                        onClick={e => { e.preventDefault(); toggleBookmark(b.id) }}
                        aria-label={lang === 'ko' ? '북마크' : 'Bookmark'}
                      >
                        {isBookmarked(b.id) ? '❤️' : '🤍'}
                      </button>
                      <button
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                          color: sharedId === b.id ? '#10b981' : 'var(--text-tertiary)',
                          padding: '2px 4px', borderRadius: 6, transition: 'color 0.2s',
                        }}
                        onClick={e => { e.preventDefault(); handleShare(b.id, bText(b, 'title', lang)) }}
                        aria-label={lang === 'ko' ? '공유' : 'Share'}
                      >
                        {sharedId === b.id ? '✅' : '📤'}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Deadline Benefits */}
          <div className={styles.monthSummary}>
            <h2 className="section-title mb-12">{t.monthlyDeadlineTitle(month + 1, monthlyDeadlines.length)}</h2>
            {monthlyDeadlines.length > 0 ? (
              <div className={styles.benefitCards}>
                {monthlyDeadlines.map(b => (
                  <Link key={b.id} href={`/detail/${b.id}`} className={styles.calCard}>
                    <div className={styles.calCardLeft}>
                      <div className={styles.calCardMeta}>
                        <span className={`badge badge-coral-soft`}>{bText(b, 'categoryLabel', lang)}</span>
                        <span className={`badge ${getDDayColor(b.dDay)}`}>{getDDayText(b.dDay, lang === 'ko' ? 'ko' : 'en')}</span>
                      </div>
                      <h3 className={styles.calCardTitle}>{bText(b, 'title', lang)}</h3>
                      <p className={styles.calCardDate}>{t.deadlineLabel}: {b.applicationEnd}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#ef4444', padding: '4px' }}
                        onClick={e => { e.preventDefault(); toggleBookmark(b.id) }}
                        aria-label={lang === 'ko' ? '북마크' : 'Bookmark'}
                      >
                        {isBookmarked(b.id) ? '❤️' : '🤍'}
                      </button>
                      <button
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                          color: sharedId === b.id ? '#10b981' : 'var(--text-tertiary)',
                          padding: '2px 4px', borderRadius: 6, transition: 'color 0.2s',
                        }}
                        onClick={e => { e.preventDefault(); handleShare(b.id, bText(b, 'title', lang)) }}
                        aria-label={lang === 'ko' ? '공유' : 'Share'}
                      >
                        {sharedId === b.id ? '✅' : '📤'}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: 16 }}>
                {t.noMonthlyDeadline}
              </p>
            )}
          </div>

          {/* Always Open Benefits */}
          {alwaysOpenBenefits.length > 0 && (
            <div className={styles.monthSummary}>
              <h2 className="section-title mb-12">{t.alwaysOpenTitle(alwaysOpenBenefits.length)}</h2>
              <div className={styles.benefitCards}>
                {alwaysOpenBenefits.slice(0, 10).map(b => (
                  <Link key={b.id} href={`/detail/${b.id}`} className={styles.calCard}>
                    <div className={styles.calCardLeft}>
                      <div className={styles.calCardMeta}>
                        <span className="badge badge-green-soft">{bText(b, 'categoryLabel', lang)}</span>
                        <span className="badge badge-purple-soft">{t.alwaysOpenBadge}</span>
                      </div>
                      <h3 className={styles.calCardTitle}>{bText(b, 'title', lang)}</h3>
                      <p className={styles.calCardAmount}>{bText(b, 'amount', lang)}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#ef4444', padding: '4px' }}
                        onClick={e => { e.preventDefault(); toggleBookmark(b.id) }}
                        aria-label={lang === 'ko' ? '북마크' : 'Bookmark'}
                      >
                        {isBookmarked(b.id) ? '❤️' : '🤍'}
                      </button>
                      <button
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
                          color: sharedId === b.id ? '#10b981' : 'var(--text-tertiary)',
                          padding: '2px 4px', borderRadius: 6, transition: 'color 0.2s',
                        }}
                        onClick={e => { e.preventDefault(); handleShare(b.id, bText(b, 'title', lang)) }}
                        aria-label={lang === 'ko' ? '공유' : 'Share'}
                      >
                        {sharedId === b.id ? '✅' : '📤'}
                      </button>
                    </div>
                  </Link>
                ))}
                {alwaysOpenBenefits.length > 10 && (
                  <Link href="/search" className={styles.showMore}>
                    {t.showMoreBenefits(alwaysOpenBenefits.length - 10)}
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </>
  )
}
