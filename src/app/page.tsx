'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText, CATEGORY_INFO } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import styles from './page.module.css'
import AdBanner from '@/components/ads/AdBanner'

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
  const [apiError, setApiError] = useState(false)
  const [sharedId, setSharedId] = useState<string | null>(null)
  const dragScrollRef = useDragScroll()

  // Web Share API (web-share 스킬 준수)
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

  useEffect(() => {
    async function loadBenefits() {
      try {
        const res = await fetch('/api/benefits')
        const json = await res.json()
        if (json.success && json.data?.length > 0) {
          setBenefits(json.data)
        } else {
          setApiError(true)
        }
      } catch (err) {
        console.error('Failed to load benefits', err)
        setApiError(true)
      } finally {
        setLoading(false)
      }
    }
    loadBenefits()
  }, [])

  // 마감 임박 = dDay 있는 것 우선, 없으면 전체에서 상위 5건
  const urgentBenefits = benefits
    .filter(b => b.dDay >= 0 && b.dDay <= 30 && b.status === 'open')
    .sort((a, b) => a.dDay - b.dDay)
  const urgentDisplay = urgentBenefits.length > 0
    ? urgentBenefits
    : benefits.slice(0, 10) // 마감일 데이터 없을 경우 최신 10건 표시

  // 인기 혜택 = popular 플래그 있으면 우선, 없으면 전체 상위 5건
  const popularBenefits = benefits.filter(b => b.popular).length > 0
    ? benefits.filter(b => b.popular)
    : benefits.slice(0, 5)

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
            {!loading && apiError && (
              <p style={{ fontSize: 11, color: 'rgba(255,200,100,0.9)', marginTop: 4 }}>
                ⚠️ 데이터 없데이트 실패 — 잠시 후 다시 시도해주세요
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
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.urgentCard} style={{ background: 'var(--bg-secondary)', opacity: 0.5, minWidth: 200, height: 120, borderRadius: 16 }} />
              ))
            ) : urgentDisplay.length === 0 ? (
              <div style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center', width: '100%' }}>
                {apiError ? '⚠️ 데이터를 불러오지 못했습니다. 새로고침 해주세요.' : '현재 마감 임박 혜택이 없습니다.'}
              </div>
            ) : (
              urgentDisplay.slice(0, 5).map((benefit, i) => (
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
              ))
            )}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                  <button
                    className={`${styles.bookmarkBtn} ${isBookmarked(benefit.id) ? styles.bookmarked : ''}`}
                    onClick={e => { e.preventDefault(); toggleBookmark(benefit.id) }}
                    aria-label="북마크"
                  >
                    {isBookmarked(benefit.id) ? '❤️' : '🤍'}
                  </button>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: sharedId === benefit.id ? '#10b981' : 'var(--text-tertiary)', padding: '2px 4px', borderRadius: 6, transition: 'color 0.2s' }}
                    onClick={e => { e.preventDefault(); handleShare(benefit.id, lang === 'ko' ? benefit.title : benefit.titleEn) }}
                    aria-label={lang === 'ko' ? '공유' : 'Share'}
                  >
                    {sharedId === benefit.id ? '✅' : '📤'}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Google AdSense 광고 */}
        <section className="section">
          <AdBanner
            format="auto"
            style={{ minHeight: 100 }}
          />
        </section>
      </main>
      <BottomNav />
    </>
  )
}
