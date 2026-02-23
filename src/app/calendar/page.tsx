'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import styles from './page.module.css'

export default function CalendarPage() {
  const { t, lang } = useApp()
  const now = new Date()
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(now.getDate())
  const [allBenefits, setAllBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBenefits() {
      try {
        const res = await fetch('/api/benefits')
        if (res.ok) {
          const json = await res.json()
          setAllBenefits(json.data || [])
        }
      } catch (err) {
        console.error('Failed to load benefits for calendar', err)
      } finally {
        setLoading(false)
      }
    }
    loadBenefits()
  }, [])

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
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

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
                <strong>{urgentBenefits.length}개 혜택 마감 임박!</strong>
                <span>{urgentBenefits[0].title} 외 {urgentBenefits.length - 1}건 — 놓치지 마세요</span>
              </div>
              <span className={`badge badge-red`}>D-{urgentBenefits[0].dDay}</span>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>
              캘린더 데이터를 불러오는 중...
            </div>
          )}

          {/* Calendar Header */}
          <div className={styles.calHeader}>
            <button className={styles.navBtn} onClick={prevMonth}>‹</button>
            <div className={styles.calTitle}>
              <span className={styles.calYear}>{year}년 {monthNames[month]}</span>
              <span className={styles.calHint}>마감일 기준으로 표시됩니다</span>
            </div>
            <button className={styles.navBtn} onClick={nextMonth}>›</button>
          </div>

          {/* Day Header */}
          <div className={styles.dayHeader}>
            {dayNames.map(d => (
              <span key={d} className={`${styles.dayName} ${d === '일' ? styles.sunday : ''}`}>{d}</span>
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
                {t.benefitsOnDate(`${month + 1}월 ${selectedDay}일`)}
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
                        <span className={`badge badge-coral-soft`}>{lang === 'ko' ? b.categoryLabel : b.categoryLabelEn}</span>
                        <span className={`badge ${getDDayColor(b.dDay)}`}>{getDDayText(b.dDay, lang === 'ko' ? 'ko' : 'en')}</span>
                      </div>
                      <h3 className={styles.calCardTitle}>{lang === 'ko' ? b.title : b.titleEn}</h3>
                      <p className={styles.calCardAmount}>{lang === 'ko' ? b.amount : b.amountEn}</p>
                    </div>
                    <span className={styles.calCardArrow}>›</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Deadline Benefits */}
          <div className={styles.monthSummary}>
            <h2 className="section-title mb-12">📋 {month + 1}월 마감 혜택 ({monthlyDeadlines.length}건)</h2>
            {monthlyDeadlines.length > 0 ? (
              <div className={styles.benefitCards}>
                {monthlyDeadlines.map(b => (
                  <Link key={b.id} href={`/detail/${b.id}`} className={styles.calCard}>
                    <div className={styles.calCardLeft}>
                      <div className={styles.calCardMeta}>
                        <span className={`badge badge-coral-soft`}>{lang === 'ko' ? b.categoryLabel : b.categoryLabelEn}</span>
                        <span className={`badge ${getDDayColor(b.dDay)}`}>{getDDayText(b.dDay, lang === 'ko' ? 'ko' : 'en')}</span>
                      </div>
                      <h3 className={styles.calCardTitle}>{lang === 'ko' ? b.title : b.titleEn}</h3>
                      <p className={styles.calCardDate}>마감: {b.applicationEnd}</p>
                    </div>
                    <span className={styles.calCardArrow}>›</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: 16 }}>
                이번 달 마감 혜택이 없습니다
              </p>
            )}
          </div>

          {/* Always Open Benefits */}
          {alwaysOpenBenefits.length > 0 && (
            <div className={styles.monthSummary}>
              <h2 className="section-title mb-12">🟢 상시 신청 가능 ({alwaysOpenBenefits.length}건)</h2>
              <div className={styles.benefitCards}>
                {alwaysOpenBenefits.slice(0, 10).map(b => (
                  <Link key={b.id} href={`/detail/${b.id}`} className={styles.calCard}>
                    <div className={styles.calCardLeft}>
                      <div className={styles.calCardMeta}>
                        <span className="badge badge-green-soft">{lang === 'ko' ? b.categoryLabel : b.categoryLabelEn}</span>
                        <span className="badge badge-purple-soft">상시</span>
                      </div>
                      <h3 className={styles.calCardTitle}>{lang === 'ko' ? b.title : b.titleEn}</h3>
                      <p className={styles.calCardAmount}>{lang === 'ko' ? b.amount : b.amountEn}</p>
                    </div>
                    <span className={styles.calCardArrow}>›</span>
                  </Link>
                ))}
                {alwaysOpenBenefits.length > 10 && (
                  <Link href="/search" className={styles.showMore}>
                    +{alwaysOpenBenefits.length - 10}건 더 보기 →
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
