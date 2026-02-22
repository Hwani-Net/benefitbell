'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { BENEFITS, getDDayColor, getDDayText } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import styles from './page.module.css'

export default function CalendarPage() {
  const { t, lang } = useApp()
  const now = new Date(2026, 1, 22) // 2026년 2월
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(now.getDate())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // 해당 날짜에 마감되는 혜택
  const getBenefitsForDay = (day: number) => {
    const dateStr = `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`
    return BENEFITS.filter(b => b.applicationEnd === dateStr)
  }

  // 마감 혜택 있는 날 표시
  const hasBenefits = (day: number) => {
    const dateStr = `${year}.${String(month + 1).padStart(2, '0')}.${String(day).padStart(2, '0')}`
    return BENEFITS.some(b => b.applicationEnd === dateStr)
  }

  const selectedBenefits = getBenefitsForDay(selectedDay)
  const isToday = (d: number) => year === 2026 && month === 1 && d === 22
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <>
      <TopBar />
      <main className="page-content">
        <section className="section" style={{ paddingTop: 8 }}>
          <h1 className="section-title mb-12">{t.benefitCalendar}</h1>

          {/* 캘린더 헤더 */}
          <div className={styles.calHeader}>
            <button className={styles.navBtn} onClick={prevMonth}>‹</button>
            <div className={styles.calTitle}>
              <span className={styles.calYear}>{year}년 {monthNames[month]}</span>
              <span className={styles.calHint}>마감일 기준으로 표시됩니다</span>
            </div>
            <button className={styles.navBtn} onClick={nextMonth}>›</button>
          </div>

          {/* 요일 헤더 */}
          <div className={styles.dayHeader}>
            {dayNames.map(d => (
              <span key={d} className={`${styles.dayName} ${d === '일' ? styles.sunday : ''}`}>{d}</span>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className={styles.dayGrid}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1
              const hasB = hasBenefits(day)
              const isSelected = day === selectedDay
              const isTd = isToday(day)
              return (
                <button
                  key={day}
                  className={`
                    ${styles.dayCell}
                    ${isSelected ? styles.selected : ''}
                    ${isTd ? styles.today : ''}
                  `}
                  onClick={() => setSelectedDay(day)}
                >
                  {day}
                  {hasB && <span className={styles.dot} />}
                </button>
              )
            })}
          </div>

          {/* 선택된 날 혜택 목록 */}
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

          {/* 이번달 마감 혜택 전체 */}
          <div className={styles.monthSummary}>
            <h2 className="section-title mb-12">📋 {month + 1}월 마감 혜택 전체</h2>
            <div className={styles.benefitCards}>
              {BENEFITS.filter(b => {
                const endMonth = parseInt(b.applicationEnd.split('.')[1])
                const endYear = parseInt(b.applicationEnd.split('.')[0])
                return endYear === year && endMonth === month + 1
              }).map(b => (
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
              {BENEFITS.filter(b => {
                const endMonth = parseInt(b.applicationEnd.split('.')[1])
                const endYear = parseInt(b.applicationEnd.split('.')[0])
                return endYear === year && endMonth === month + 1
              }).length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: 16 }}>
                  이번 달 마감 혜택이 없습니다
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  )
}
