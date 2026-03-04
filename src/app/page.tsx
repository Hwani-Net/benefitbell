'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText, CATEGORY_INFO, bText } from '@/data/benefits'
import { getPersonalizedBenefits, getAiPersonalizedBenefits } from '@/lib/recommendation'
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
  const { t, lang, toggleBookmark, isBookmarked, kakaoUser, userProfile, benefits, benefitsLoading: loading } = useApp()
  const [apiError, setApiError] = useState(false)
  const [sharedId, setSharedId] = useState<string | null>(null)
  const [aiScores, setAiScores] = useState<Map<string, { score: number; verdict: string; summary: string }>>(new Map())
  const [aiLoading, setAiLoading] = useState(false)
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
    if (!loading && benefits.length === 0) setApiError(true)
  }, [loading, benefits])

  // AI eligibility scoring (runs after benefits load, only for logged-in users)
  useEffect(() => {
    if (!kakaoUser || benefits.length === 0) return
    let cancelled = false
    setAiLoading(true)
    getAiPersonalizedBenefits(benefits, userProfile)
      .then(enriched => {
        if (cancelled) return
        const map = new Map<string, { score: number; verdict: string; summary: string }>()
        for (const b of enriched) {
          if (b.aiScore !== undefined) {
            map.set(b.id, { score: b.aiScore, verdict: b.aiVerdict || 'partial', summary: b.aiSummary || '' })
          }
        }
        setAiScores(map)
      })
      .catch(() => { /* fallback: no AI scores */ })
      .finally(() => { if (!cancelled) setAiLoading(false) })
    return () => { cancelled = true }
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

  // 맞춤 혜택 = userProfile 기반으로 추천 점수 매긴 전체 목록
  const allPersonalizedBenefits = kakaoUser ? getPersonalizedBenefits(benefits, userProfile) : []
  const personalizedBenefits = allPersonalizedBenefits.slice(0, 5)

  // 신규 혜택 = new 플래그 있는 것 우선, 없으면 목록 마지막 5건 (가장 최근 추가)
  const newBenefits = benefits.filter(b => b.new).length > 0
    ? benefits.filter(b => b.new).slice(0, 6)
    : benefits.slice(-6).reverse()

  const categories = Object.entries(CATEGORY_INFO).map(([key, info]) => ({ key, ...info }))

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
                ? (lang === 'ko' ? '혜택 정보를 불러오는 중...' : 'Loading benefits...')
                : t.urgentSubtitle(urgentBenefits.filter(b => b.dDay <= 14).length)
              }
            </p>
            {!loading && benefits.length > 0 && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                {lang === 'ko' ? `📊 실시간 복지서비스 ${benefits.length}건 연동` : `📊 ${benefits.length} welfare services synced`}
              </p>
            )}
            {!loading && apiError && (
              <p style={{ fontSize: 11, color: 'rgba(255,200,100,0.9)', marginTop: 4 }}>
                {lang === 'ko' ? '⚠️ 데이터 업데이트 실패 — 잠시 후 다시 시도해주세요' : '⚠️ Data update failed — please try again later'}
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
                {apiError
                  ? (lang === 'ko' ? '⚠️ 데이터를 불러오지 못했습니다. 새로고침 해주세요.' : '⚠️ Failed to load data. Please refresh.')
                  : (lang === 'ko' ? '현재 마감 임박 혜택이 없습니다.' : 'No expiring benefits at the moment.')}
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
                  <h3 className={styles.urgentTitle}>{bText(benefit, 'title', lang)}</h3>
                  <p className={styles.urgentAmount}>{bText(benefit, 'amount', lang)}</p>
                  <div className={styles.urgentCategoryChip}>
                    <span>{bText(benefit, 'categoryLabel', lang)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* 📝 프로필 완성도 배너 (로그인 + 프로필 미입력 시) */}
        {kakaoUser && !userProfile?.name && !loading && (
          <section className="section" style={{ padding: '0 16px', marginBottom: 8 }}>
            <Link href="/profile" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  📝
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
                    {lang === 'ko' ? '프로필을 입력하면 AI 추천이 더 정확해져요' : 'Complete your profile for better AI recommendations'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                    {lang === 'ko' ? '나이·지역·소득 정보를 입력하세요 →' : 'Enter age, region, and income →'}
                  </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>→</span>
              </div>
            </Link>
          </section>
        )}

        {/* 🚀 맞춤 추천 혜택 (로그인 유저 전용) */}
        {kakaoUser && personalizedBenefits.length > 0 && (
          <section className="section" style={{ background: 'var(--bg-secondary)', padding: '24px 16px', borderRadius: 20, margin: '16px' }}>
            <div className="section-header">
              <h2 className="section-title">
                {lang === 'ko' ? `✨ ${kakaoUser.nickname}님 맞춤 추천` : `✨ Personalized for ${kakaoUser.nickname}`}
                {allPersonalizedBenefits.length > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-coral)', background: 'var(--color-coral-light)', padding: '2px 8px', borderRadius: 99, marginLeft: 8, verticalAlign: 'middle' }}>
                    {lang === 'ko' ? `총 ${allPersonalizedBenefits.length}건` : `${allPersonalizedBenefits.length} total`}
                  </span>
                )}
              </h2>
              {allPersonalizedBenefits.length > 5 && (
                <Link href="/search?custom=true" className="section-link">{lang === 'ko' ? '전체보기' : 'View All'}</Link>
              )}
            </div>
            <div className={styles.benefitList}>
              {personalizedBenefits.map((benefit, i) => {
              const ai = aiScores.get(benefit.id)
              return (
                <Link key={benefit.id} href={`/detail/${benefit.id}`} className={`${styles.benefitItem} animate-fade-in stagger-${Math.min(i+1,5)}`} style={{ background: 'var(--bg-primary)' }}>
                  <div className={styles.benefitInfo}>
                    <p className={styles.benefitTitle}>{bText(benefit, 'title', lang)}</p>
                    <p className={styles.benefitAmount}>{bText(benefit, 'amount', lang)}</p>
                    <div className={styles.benefitMeta}>
                      {/* AI Score Badge */}
                      {ai ? (
                        <span
                          className="badge text-xs"
                          style={{
                            background: ai.verdict === 'likely' ? '#dcfce7' : ai.verdict === 'partial' ? '#fef3c7' : '#fee2e2',
                            color: ai.verdict === 'likely' ? '#15803d' : ai.verdict === 'partial' ? '#92400e' : '#dc2626',
                            fontWeight: 700,
                            minWidth: 44,
                            textAlign: 'center',
                          }}
                        >
                          🤖 {ai.score}%
                        </span>
                      ) : aiLoading ? (
                        <span className="badge badge-gray text-xs" style={{ opacity: 0.6 }}>🤖 ···</span>
                      ) : null}
                      <span className={`badge badge-coral text-xs`}>{bText(benefit, 'categoryLabel', lang)}</span>
                      {benefit.dDay <= 14 && benefit.dDay >= 0 && (
                        <span className={`badge ${getDDayColor(benefit.dDay)} text-xs`}>
                          {getDDayText(benefit.dDay, lang === 'ko' ? 'ko' : 'en')}
                        </span>
                      )}
                    </div>
                    {/* AI Summary (1 line) */}
                    {ai?.summary && (
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ai.summary}
                      </p>
                    )}
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
                      onClick={e => { e.preventDefault(); handleShare(benefit.id, bText(benefit, 'title', lang)) }}
                      aria-label={lang === 'ko' ? '공유' : 'Share'}
                    >
                      {sharedId === benefit.id ? '✅' : '📤'}
                    </button>
                  </div>
                </Link>
              )
            })}
            </div>
            {/* AI disclaimer */}
            {aiScores.size > 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8, padding: '0 16px' }}>
                {lang === 'ko' ? '⚠️ AI 분석 결과는 참고용이며 실제 자격은 담당 기관에 확인하세요' : '⚠️ AI results are for reference only. Verify eligibility with the relevant agency.'}
              </p>
            )}
          </section>
        )}

        {/* 🤖 비로그인 사용자용 AI 맞춤 CTA 배너 */}
        {!kakaoUser && !loading && benefits.length > 0 && (
          <section className="section" style={{ padding: '0 16px', marginBottom: 8 }}>
            <Link href="/profile" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: 'linear-gradient(135deg, #0EA5E9 0%, #6366F1 50%, #A855F7 100%)',
                borderRadius: 16,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)',
              }}>
                <span style={{ fontSize: 36, flexShrink: 0 }}>🤖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white', lineHeight: 1.4 }}>
                    {lang === 'ko' ? 'AI가 나에게 딱 맞는 혜택을 찾아드려요' : 'AI finds benefits tailored just for you'}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                    {lang === 'ko' ? '30초 프로필 입력 → 수령 가능성 % 즉시 확인' : 'Quick profile → See your eligibility % instantly'}
                  </div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 20, fontWeight: 700 }}>→</span>
              </div>
            </Link>
          </section>
        )}

        {/* 💎 프리미엄 업그레이드 배너 (비프리미엄 유저 — 로그인 무관) */}
        {!userProfile?.isPremium && !loading && (
          <section className="section" style={{ padding: '0 16px', marginBottom: 8 }}>
            <Link href="/premium" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)',
                borderRadius: 16,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.25)',
              }}>
                <span style={{ fontSize: 28, flexShrink: 0 }}>👑</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{lang === 'ko' ? '프리미엄으로 업그레이드' : 'Upgrade to Premium'}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{lang === 'ko' ? 'AI 무제한 + 광고 제거 + 14일 전 알림 — 월 4,900원' : 'Unlimited AI + No ads + 14-day alerts — ₩4,900/mo'}</div>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}>→</span>
              </div>
            </Link>
          </section>
        )}

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

        {/* 📊 인기 혜택 (사회적 증거 — 신규보다 먼저 배치) */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">{t.popularBenefits}</h2>
            <span className={styles.liveTag}>{t.now}</span>
          </div>
          <div className={styles.benefitList}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`${styles.benefitItem} shimmer`} style={{ height: 72 }} />
              ))
            ) : (
              popularBenefits.slice(0, 5).map((benefit, i) => (
                <Link key={benefit.id} href={`/detail/${benefit.id}`} className={`${styles.benefitItem} animate-fade-in stagger-${Math.min(i+1,5)}`}>
                  <span className={styles.rankNum}>{i + 1}</span>
                  <div className={styles.benefitInfo}>
                    <p className={styles.benefitTitle}>{bText(benefit, 'title', lang)}</p>
                    <p className={styles.benefitAmount}>{bText(benefit, 'amount', lang)}</p>
                    <div className={styles.benefitMeta}>
                      <span className={`badge badge-gray text-xs`}>{bText(benefit, 'categoryLabel', lang)}</span>
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
                      onClick={e => { e.preventDefault(); handleShare(benefit.id, bText(benefit, 'title', lang)) }}
                      aria-label={lang === 'ko' ? '공유' : 'Share'}
                    >
                      {sharedId === benefit.id ? '✅' : '📤'}
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* 🆕 신규 혜택 */}
        {!loading && newBenefits.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">
                {lang === 'ko' ? '🆕 신규 혜택' : '🆕 New Benefits'}
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-coral)', background: 'var(--color-coral-light)', padding: '2px 8px', borderRadius: 99, marginLeft: 8, verticalAlign: 'middle' }}>
                  NEW
                </span>
              </h2>
              <Link href="/search" className="section-link">{t.viewAll}</Link>
            </div>
            <div className={styles.benefitList}>
              {newBenefits.map((benefit, i) => (
                <Link
                  key={benefit.id}
                  href={`/detail/${benefit.id}`}
                  className={`${styles.benefitItem} animate-fade-in stagger-${Math.min(i+1,5)}`}
                >
                  <div className={styles.benefitInfo}>
                    <p className={styles.benefitTitle}>{bText(benefit, 'title', lang)}</p>
                    <p className={styles.benefitAmount}>{bText(benefit, 'amount', lang)}</p>
                    <div className={styles.benefitMeta}>
                      <span className="badge badge-coral-soft text-xs">{lang === 'ko' ? '🆕 신규' : '🆕 New'}</span>
                      <span className="badge badge-gray text-xs">{bText(benefit, 'categoryLabel', lang)}</span>
                      {benefit.dDay >= 0 && benefit.dDay <= 30 && (
                        <span className={`badge ${getDDayColor(benefit.dDay)} text-xs`}>
                          {getDDayText(benefit.dDay, lang === 'ko' ? 'ko' : 'en')}
                        </span>
                      )}
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
                      onClick={e => { e.preventDefault(); handleShare(benefit.id, bText(benefit, 'title', lang)) }}
                      aria-label={lang === 'ko' ? '공유' : 'Share'}
                    >
                      {sharedId === benefit.id ? '✅' : '📤'}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Google AdSense 광고 */}
        <section className="section">
          <AdBanner
            slot="5754258932"
            format="auto"
            style={{ minHeight: 100 }}
          />
        </section>
      </main>
      <BottomNav />
    </>
  )
}
