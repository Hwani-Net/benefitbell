'use client'
import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText, CATEGORY_INFO } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import styles from './page.module.css'

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let isDown = false, startX = 0, scrollLeft = 0, moved = false

    const onDown = (e: MouseEvent) => {
      isDown = true
      moved = false
      el.style.userSelect = 'none'
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }
    const onUp = () => { isDown = false; el.style.userSelect = '' }
    const onMove = (e: MouseEvent) => {
      if (!isDown) return
      const dx = e.pageX - el.offsetLeft - startX
      if (Math.abs(dx) > 5) {
        moved = true
        e.preventDefault()
        el.scrollLeft = scrollLeft - dx
      }
    }
    // Block link clicks after drag
    const onClick = (e: MouseEvent) => { if (moved) { e.preventDefault(); e.stopPropagation() } }

    el.addEventListener('mousedown', onDown)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('click', onClick, true)
    return () => {
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mouseleave', onUp)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('click', onClick, true)
    }
  }, [])
  return ref
}

export default function HomePage() {
  const { t, lang, toggleBookmark, isBookmarked, kakaoUser } = useApp()
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)
  const dragScrollRef = useDragScroll()

  useEffect(() => {
    async function loadBenefits() {
      try {
        const res = await fetch('/api/benefits')
        if (!res.ok) throw new Error('API return not ok')
        const json = await res.json()
        setBenefits(json.data)
      } catch (err) {
        console.error('Failed to load benefits', err)
      } finally {
        setLoading(false)
      }
    }
    loadBenefits()
  }, [])

  const urgentBenefits = benefits.filter(b => b.dDay >= 0 && b.dDay <= 30 && b.status === 'open').sort((a, b) => a.dDay - b.dDay)
  const popularBenefits = benefits.filter(b => b.popular)

  const categories = [
    { key: 'basic-living', ...CATEGORY_INFO['basic-living'] },
    { key: 'near-poverty', ...CATEGORY_INFO['near-poverty'] },
    { key: 'youth', ...CATEGORY_INFO['youth'] },
    { key: 'middle-aged', ...CATEGORY_INFO['middle-aged'] },
    { key: 'senior', ...CATEGORY_INFO['senior'] },
    { key: 'housing', ...CATEGORY_INFO['housing'] },
    { key: 'medical', ...CATEGORY_INFO['medical'] },
    { key: 'education', ...CATEGORY_INFO['education'] },
    { key: 'employment', ...CATEGORY_INFO['employment'] },
  ]

  return (
    <>
      <TopBar />
      <main className="page-content">
        {/* 인사 배너 */}
        <div className={styles.greetingBanner}>
          <div className={styles.greetingText}>
            <p className={styles.greeting}>
              {kakaoUser ? t.greeting(kakaoUser.nickname) : t.guestGreeting}
            </p>
            <p className={styles.subGreeting}>
              {loading
                ? '혜택 정보를 불러오는 중...'
                : t.urgentSubtitle(urgentBenefits.filter(b => b.dDay <= 14).length)
              }
            </p>
            {!loading && benefits.length > 0 && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                📊 실시간 복지서비스 {benefits.length}건 연동
              </p>
            )}
          </div>
          <div className={styles.greetingEmoji}>
            {kakaoUser?.profile_image
              ? <img src={kakaoUser.profile_image} alt="프로필" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.4)' }} />
              : '🔔'
            }
          </div>
        </div>

        {/* 마감 임박 혜택 */}
        <section>
          <div className={`section-header section`}>
            <h2 className="section-title">{t.urgentBenefits}</h2>
            <Link href="/search" className="section-link">{t.viewAll}</Link>
          </div>
          <div ref={dragScrollRef} className={`scroll-x ${styles.urgentScroll}`}>
            {urgentBenefits.slice(0, 5).map((benefit, i) => (
              <Link
                key={benefit.id}
                href={`/detail/${benefit.id}`}
                className={`${styles.urgentCard} animate-fade-in stagger-${Math.min(i+1,5)}`}
                draggable={false}
                onDragStart={e => e.preventDefault()}
              >
                <div className={styles.urgentCardTop}>
                  <span className={`badge ${getDDayColor(benefit.dDay)}`}>
                    {getDDayText(benefit.dDay, lang === 'ko' ? 'ko' : 'en')}
                  </span>
                  <span className={styles.ministry}>{lang === 'ko' ? benefit.ministry : benefit.ministryEn}</span>
                </div>
                <h3 className={styles.urgentTitle}>{lang === 'ko' ? benefit.title : benefit.titleEn}</h3>
                <p className={styles.urgentAmount}>{lang === 'ko' ? benefit.amount : benefit.amountEn}</p>
                <div className={styles.urgentCategoryChip}>
                  <span>{lang === 'ko' ? benefit.categoryLabel : benefit.categoryLabelEn}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 카테고리 */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">{t.categories}</h2>
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((cat, i) => (
              <Link
                key={cat.key}
                href={`/search?cat=${cat.key}`}
                className={`${styles.categoryItem} animate-fade-in stagger-${Math.min(i+1,5)}`}
              >
                <div className={styles.categoryIcon} style={{ background: `${cat.color}18` }}>
                  <span className={styles.categoryEmoji}>{cat.icon}</span>
                </div>
                <span className={styles.categoryLabel}>{lang === 'ko' ? cat.label : cat.labelEn}</span>
              </Link>
            ))}
            <Link href="/search" className={styles.categoryItem}>
              <div className={styles.categoryIcon} style={{ background: 'var(--bg-secondary)' }}>
                <span className={styles.categoryEmoji}>🔗</span>
              </div>
              <span className={styles.categoryLabel}>{t.allCategories}</span>
            </Link>
          </div>
        </section>

        {/* 인기 혜택 TOP 5 */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">{t.popularBenefits}</h2>
            <span className={styles.liveTag}>{t.now}</span>
          </div>
          <div className={styles.benefitList}>
            {popularBenefits.slice(0, 5).map((benefit, i) => (
              <Link key={benefit.id} href={`/detail/${benefit.id}`} className={`${styles.benefitItem} animate-fade-in stagger-${Math.min(i+1,5)}`}>
                <span className={styles.rankNum}>{i + 1}</span>
                <div className={styles.benefitInfo}>
                  <p className={styles.benefitTitle}>{lang === 'ko' ? benefit.title : benefit.titleEn}</p>
                  <p className={styles.benefitAmount}>{lang === 'ko' ? benefit.amount : benefit.amountEn}</p>
                  <div className={styles.benefitMeta}>
                    <span className={`badge badge-gray text-xs`}>{lang === 'ko' ? benefit.categoryLabel : benefit.categoryLabelEn}</span>
                    {benefit.dDay <= 14 && benefit.dDay >= 0 && (
                      <span className={`badge ${getDDayColor(benefit.dDay)} text-xs`}>
                        {getDDayText(benefit.dDay, lang === 'ko' ? 'ko' : 'en')}
                      </span>
                    )}
                    {benefit.new && <span className={`badge badge-coral-soft text-xs`}>{t.newBadge}</span>}
                  </div>
                </div>
                <button
                  className={`${styles.bookmarkBtn} ${isBookmarked(benefit.id) ? styles.bookmarked : ''}`}
                  onClick={e => { e.preventDefault(); toggleBookmark(benefit.id) }}
                  aria-label="북마크"
                >
                  {isBookmarked(benefit.id) ? '❤️' : '🤍'}
                </button>
              </Link>
            ))}
          </div>
        </section>

        {/* AdSense 플레이스홀더 */}
        <section className="section">
          <div className={styles.adBanner}>
            <span className={styles.adLabel}>광고</span>
            <p className={styles.adText}>여기에 Google AdSense 광고가 표시됩니다</p>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  )
}
