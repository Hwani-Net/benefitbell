'use client'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import AiEligibilityCheck from '@/components/ai/AiEligibilityCheck'
import Link from 'next/link'
import { use, useEffect, useState, useCallback, useRef, useMemo } from 'react'

// Floating CTA visibility hook — shows after scrolling down, hides when inline CTA is visible
function useFloatingCta(ctaRef: React.RefObject<HTMLDivElement | null>) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const scrollY = window.scrollY
        // Show after scrolling 400px
        if (scrollY < 400) { setShow(false); ticking = false; return }
        // Hide when inline CTA is visible
        if (ctaRef.current) {
          const rect = ctaRef.current.getBoundingClientRect()
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            setShow(false); ticking = false; return
          }
        }
        setShow(true)
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [ctaRef])
  return show
}
import { useRouter } from 'next/navigation'
import styles from './page.module.css'
import AdBanner from '@/components/ads/AdBanner'
import { shareKakaoBenefit } from '@/lib/kakao'
import { matchDocuments } from '@/data/document-urls'

// Extended detail from the public API
interface ApiDetail {
  title: string
  ministry: string
  phone: string
  year: string
  supportCycle: string
  supportType: string
  overview: string
  targetDetail: string
  selectionCriteria: string
  supportContent: string
  applyBgnDt?: string
  applyEndDt?: string
  lifeStages: string
  targetGroups: string
  themes: string
  applicationMethods: string[]
  applicationLinks: string[]
  contacts: { name: string; address: string }[]
  requiredDocs: Array<string | { name: string; link: string }>
  relatedLaws: string[]
  homepages: { name: string; url: string }[]
}

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { t, lang, toggleBookmark, isBookmarked, benefits: allBenefits } = useApp()
  const [enrichedBenefit, setEnrichedBenefit] = useState<Benefit | null>(null)
  const [apiDetail, setApiDetail] = useState<ApiDetail | null>(null)
  const [shared, setShared] = useState(false)
  const [kakaoShared, setKakaoShared] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)
  const showFloatingCta = useFloatingCta(ctaRef)

  // Derive initial benefit from global list (no effect needed)
  const foundBenefit = useMemo(() => allBenefits.find(b => b.id === id) ?? null, [allBenefits, id])
  // Final benefit: API-enriched version takes priority, then foundBenefit from list
  const benefit = enrichedBenefit ?? foundBenefit
  // Derive loading: still loading if allBenefits not loaded
  const loading = allBenefits.length === 0

  // Web Share API 공유
  const handleShare = useCallback(async () => {
    const url = window.location.href
    // Use native Web Share API (Samsung Browser, Chrome, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: `💡 ${benefit?.title ?? ''} — 혜택알리미에서 확인하세요!`,
          url,
        })
        setShared(true)
        setTimeout(() => setShared(false), 3000)
      } catch (err) {
        // AbortError = user cancelled — no-op
        if ((err as { name?: string })?.name !== 'AbortError') {
          // Fallback: copy to clipboard
          navigator.clipboard?.writeText(url).then(() => {
            setShared(true)
            setTimeout(() => setShared(false), 3000)
          })
        }
      }
    } else {
      // Desktop fallback: copy link
      await navigator.clipboard?.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 3000)
    }
  }, [benefit])

  // 카카오톡 공유
  const handleKakaoShare = useCallback(() => {
    if (!benefit) return
    // Kakao SDK가 로드된 경우
    if (typeof window !== 'undefined' && window.Kakao) {
      shareKakaoBenefit({
        title: benefit.title,
        amount: benefit.amount,
        categoryLabel: benefit.categoryLabel,
        dDay: benefit.dDay,
        benefitId: benefit.id,
      })
      setKakaoShared(true)
      setTimeout(() => setKakaoShared(false), 3000)
    } else {
      // Kakao SDK 미로드 시 Web Share API fallback
      handleShare()
    }
  }, [benefit, handleShare])

  useEffect(() => {
    // 비동기: API 상세 정보 보강 (백그라운드)
    async function fetchDetail(benefitId: string) {
      // 비중앙부처 혜택은 상세 API가 없으므로 스킵
      if (benefitId.startsWith('LG-') || benefitId.startsWith('SUB-') ||
          benefitId.startsWith('BIZ-') || benefitId.startsWith('KSU-') ||
          benefitId.startsWith('PW-')) {
        return
      }

      try {
        const res = await fetch(`/api/benefits/${benefitId}`)
        if (!res.ok) return
        const json = await res.json()
        if (json.success && json.data) {
          setApiDetail(json.data as ApiDetail)
          // Update benefit with precise dates if available
          if (foundBenefit && (json.data.applyBgnDt || json.data.applyEndDt)) {
            setEnrichedBenefit({
              ...foundBenefit,
              applicationStart: json.data.applyBgnDt ?? foundBenefit.applicationStart,
              applicationEnd: json.data.applyEndDt ?? foundBenefit.applicationEnd,
            })
          }
        }
      } catch { /* API 실패 — 기본 정보로 표시 */ }
    }

    if (allBenefits.length > 0) {
      fetchDetail(id)
    }
  }, [id, allBenefits, foundBenefit])

  if (loading) {
    return (
      <>
        <TopBar />
        <main className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div className="shimmer" style={{ width: 40, height: 40, borderRadius: '50%', margin: '0 auto 12px' }} />
            <p>혜택 정보를 불러오고 있습니다...</p>
          </div>
        </main>
        <BottomNav />
      </>
    )
  }

  if (!benefit) {
    return (
      <>
        <TopBar />
        <div className={styles.notFound}>
          <span style={{ fontSize: 48 }}>🔍</span>
          <p>혜택 정보를 찾을 수 없습니다</p>
          <Link href="/" className="btn btn-primary">홈으로</Link>
        </div>
        <BottomNav />
      </>
    )
  }

  const title = lang === 'ko' ? benefit.title : benefit.titleEn
  const amount = lang === 'ko' ? benefit.amount : benefit.amountEn
  const category = lang === 'ko' ? benefit.categoryLabel : benefit.categoryLabelEn
  const ministry = apiDetail?.ministry || (lang === 'ko' ? benefit.ministry : benefit.ministryEn)
  const steps = benefit.steps.map(s => lang === 'ko' ? { title: s.title, desc: s.desc } : { title: s.titleEn, desc: s.descEn })

  // 필요 서류: API 데이터 우선, 없으면 benefit 데이터, 둘 다 없으면 []
  const benefitDocs: Array<string | { name: string; link: string }> = lang === 'ko' ? (benefit.documents ?? []) : (benefit.documentsEn ?? [])
  const docs: Array<string | { name: string; link: string }> = apiDetail?.requiredDocs?.length ? apiDetail.requiredDocs : benefitDocs

  // 신청 방법: API applicationMethods 있으면 사용, 없으면 benefit.steps fallback
  const hasApiMethods = (apiDetail?.applicationMethods?.length ?? 0) > 0
  const hasSteps = steps.length > 0

  // 자격 조건: 빈 배열이면 섹션 숨김
  const checks = benefit.eligibilityChecks ?? []
  const hasChecks = checks.length > 0
  const fulfilled = checks.filter(c => c.pass).length

  // 신청 기간: list API는 항상 빈 문자열 → apiDetail 날짜 사용
  const formatDate = (d: string) => {
    if (!d) return ''
    const cleaned = d.replace(/[.\-/]/g, '')
    if (cleaned.length >= 8) {
      return `${cleaned.substring(0,4)}.${cleaned.substring(4,6)}.${cleaned.substring(6,8)}`
    }
    return d
  }
  const appStart = formatDate(benefit.applicationStart) || formatDate(apiDetail?.year ? `${apiDetail.year}0101` : '')
  const appEnd = formatDate(benefit.applicationEnd)
  const appPeriodText = appStart || appEnd
    ? `${appStart || ''} ~ ${appEnd || '상시'}`
    : '도움말에서 확인'


  // Helper: strip HTML tags from text (defense against cached data with HTML)
  const stripHtml = (html: string) =>
    html
      .replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))

  // Helper: render multi-line text as paragraphs (with HTML safety)
  const renderText = (text: string) => {
    if (!text) return null
    const clean = stripHtml(text)
    return clean.split('\n').filter(l => l.trim()).map((line, i) => (
      <p key={i} style={{ margin: '4px 0', lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: 14 }}>{line.trim()}</p>
    ))
  }

  return (
    <>
      <TopBar />
      <main className="page-content">
        {/* Header */}
        <div className={styles.detailHeader}>
          <button
            className={styles.backBtn}
            onClick={() => router.back()}
            aria-label="뒤로가기"
          >‹</button>
          <span className={styles.headerTitle}>{t.benefitDetail}</span>
          <button
            className={styles.bookmarkBtn}
            onClick={() => toggleBookmark(benefit.id)}
            aria-label="북마크"
          >
            {isBookmarked(benefit.id) ? '❤️' : '🤍'}
          </button>
        </div>

        {/* AI 자격 체크 인라인 카드 — 전략 정렬: 상단 즉시 노출 */}
        <AiEligibilityCheck
          benefitId={benefit.id}
          benefitTitle={title}
          variant="inline"
        />

        {/* Hero Card */}
        <div className={styles.heroCard}>

          <div className={styles.heroTop}>
            <span className="badge badge-purple-soft">{category}</span>
            {(benefit.dDay >= 0 && benefit.dDay <= 30) || benefit.dDay >= 365 ? (
              <span className={`badge ${getDDayColor(benefit.dDay)}`}>
                {getDDayText(benefit.dDay, lang === 'ko' ? 'ko' : 'en')}
              </span>
            ) : null}
            {apiDetail?.supportType && (
              <span className="badge badge-coral-soft">{apiDetail.supportType}</span>
            )}
          </div>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroAmount}>{amount}</p>
          <p className={styles.heroMinistry}>📌 {ministry}</p>
          {apiDetail?.phone && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              📞 {apiDetail.phone}
            </p>
          )}
          {/* Tags — Hero Card 내부 하단, 클릭 시 검색 이동 */}
          {(apiDetail?.lifeStages || apiDetail?.targetGroups || apiDetail?.themes) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {apiDetail?.lifeStages?.split(',').map((tag, i) => (
                <Link key={`life-${i}`} href={`/search?q=${encodeURIComponent(tag.trim())}`} className="badge badge-purple-soft" style={{ textDecoration: 'none', cursor: 'pointer' }}>{tag.trim()}</Link>
              ))}
              {apiDetail?.targetGroups?.split(',').map((tag, i) => (
                <Link key={`target-${i}`} href={`/search?q=${encodeURIComponent(tag.trim())}`} className="badge badge-coral-soft" style={{ textDecoration: 'none', cursor: 'pointer' }}>{tag.trim()}</Link>
              ))}
              {apiDetail?.themes?.split(',').map((tag, i) => (
                <Link key={`theme-${i}`} href={`/search?q=${encodeURIComponent(tag.trim())}`} className="badge badge-green-soft" style={{ textDecoration: 'none', cursor: 'pointer' }}>{tag.trim()}</Link>
              ))}
            </div>
          )}
        </div>

        {/* API Detailed Content Sections */}
        {apiDetail?.overview && (
          <section className="section">
            <h2 className="section-title mb-12">📋 서비스 개요</h2>
            <div className={styles.textBlock}>{renderText(apiDetail.overview)}</div>
          </section>
        )}

        {apiDetail?.targetDetail && (
          <section className="section">
            <h2 className="section-title mb-12">👤 지원 대상</h2>
            <div className={styles.textBlock}>{renderText(apiDetail.targetDetail)}</div>
          </section>
        )}

        {apiDetail?.selectionCriteria && (
          <section className="section">
            <h2 className="section-title mb-12">📊 선정 기준</h2>
            <div className={styles.textBlock}>{renderText(apiDetail.selectionCriteria)}</div>
          </section>
        )}

        {apiDetail?.supportContent && (
          <section className="section">
            <h2 className="section-title mb-12">💰 지원 내용</h2>
            <div className={styles.textBlock}>{renderText(apiDetail.supportContent)}</div>
          </section>
        )}

        {/* Key Information */}
        <section className="section">
          <h2 className="section-title mb-12">{t.mainInfo}</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon} style={{ background: '#EFF6FF' }}>📅</span>
              <div>
                <p className={styles.infoLabel}>{t.appPeriod}</p>
                <p className={styles.infoValue}>{appPeriodText}</p>
              </div>
            </div>
            {(benefit.targetAge || apiDetail?.lifeStages) && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon} style={{ background: '#FAF5FF' }}>👤</span>
                <div>
                  <p className={styles.infoLabel}>{t.targetPerson}</p>
                  <p className={styles.infoValue}>{benefit.targetAge || apiDetail?.lifeStages}</p>
                </div>
              </div>
            )}
            {(benefit.incomeLevel || apiDetail?.selectionCriteria) && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon} style={{ background: '#F0FDF4' }}>💰</span>
                <div>
                  <p className={styles.infoLabel}>{t.incomeLevel}</p>
                  <p className={styles.infoValue} style={{ fontSize: 13 }}>
                    {benefit.incomeLevel || (apiDetail?.selectionCriteria?.substring(0, 80) + '...')}
                  </p>
                </div>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.infoIcon} style={{ background: '#FFF0ED' }}>🏦</span>
              <div>
                <p className={styles.infoLabel}>{t.paymentMethod}</p>
                <p className={styles.infoValue}>{apiDetail?.supportType || t.monthlyTransfer}</p>
              </div>
            </div>
            {apiDetail?.supportCycle && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon} style={{ background: '#FFFBEB' }}>🔄</span>
                <div>
                  <p className={styles.infoLabel}>지원 주기</p>
                  <p className={styles.infoValue}>{apiDetail.supportCycle}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Eligibility Check — hasChecks 일 때만 표시 */}
        {hasChecks && (
          <section className="section">
            <div className={styles.eligCard}>
              <div className={styles.eligHeader}>
                <h2 className="section-title">{t.myEligibility}</h2>
                <span className={styles.eligCount}>{t.eligibilityCheck(fulfilled, checks.length)}</span>
              </div>
              <div className="progress-bar mb-12" style={{ marginBottom: 16 }}>
                <div
                  className="progress-fill green"
                  style={{ width: `${(fulfilled / checks.length) * 100}%` }}
                />
              </div>
              <div className={styles.checkList}>
                {checks.map((c, i) => (
                  <div key={i} className={styles.checkItem}>
                    <span className={c.pass ? styles.checkPass : styles.checkFail}>
                      {c.pass ? '✅' : '⚠️'}
                    </span>
                    <span className={styles.checkLabel}>{lang === 'ko' ? c.label : c.labelEn}</span>
                    <span className={`${styles.checkBadge} ${c.pass ? styles.passBadge : styles.failBadge}`}>
                      {c.pass ? t.pass : t.fail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}


        {/* Application Methods (from API) */}
        {hasApiMethods ? (
          <section className="section">
            <h2 className="section-title mb-12">📝 신청 방법</h2>
            <div className={styles.stepList}>
              {apiDetail!.applicationMethods.map((method, i) => (
                <div key={i} className={styles.stepItem}>
                  <div className={styles.stepNum}>{i + 1}</div>
                  <div className={styles.stepContent}>
                    <p className={styles.stepTitle}>{method}</p>
                    {apiDetail!.applicationLinks[i] && (
                      <a
                        href={apiDetail!.applicationLinks[i]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 13, color: 'var(--primary)' }}
                      >
                        바로가기 →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : hasSteps ? (
          <section className="section">
            <h2 className="section-title mb-12">{t.howToApply}</h2>
            <div className={styles.stepList}>
              {steps.map((step, i) => (
                <div key={i} className={styles.stepItem}>
                  <div className={styles.stepNum}>{i + 1}</div>
                  <div className={styles.stepContent}>
                    <p className={styles.stepTitle}>{step.title}</p>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          // 신청 방법 데이터 없음 — 복지로 도움말 링크 표시
          <section className="section">
            <h2 className="section-title mb-12">{t.howToApply}</h2>
            <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                신청 방법 상세 정보는 복지로에서 확인하세요
              </p>
              <a
                href={benefit.applyUrl || 'https://www.bokjiro.go.kr'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-block', fontSize: 14 }}
              >
                복지로에서 신청 하기 →
              </a>
            </div>
          </section>
        )}

        {/* Required Documents — Phase 6: 서류 원스톱 체크리스트 */}
        {docs.length > 0 && (
          <DocumentChecklist docs={docs} benefitId={benefit.id} />
        )}

        {/* 담당 기관 연락체 */}
        {apiDetail?.contacts && apiDetail.contacts.length > 0 && (
          <section className="section">
            <h2 className="section-title mb-12">📞 담당 기관 연락체</h2>
            <div className={styles.docList}>
              {apiDetail.contacts.map((contact, i) => (
                <div key={i} className={styles.docItem}>
                  <span className={styles.docIcon}>🏢</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{contact.name}</p>
                    {contact.address && (
                      <a href={`tel:${contact.address.replace(/[^0-9]/g, '')}`} style={{ fontSize: 13, color: 'var(--primary)', marginTop: 2, display: 'block' }}>
                        {contact.address}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Laws (API only) */}
        {apiDetail?.relatedLaws && apiDetail.relatedLaws.length > 0 && (
          <section className="section">
            <h2 className="section-title mb-12">⚖️ 관련 법령</h2>
            <div className={styles.docList}>
              {apiDetail.relatedLaws.map((law, i) => (
                <div key={i} className={styles.docItem}>
                  <span className={styles.docIcon}>📜</span>
                  <span className={styles.docName}>{law}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Inquiry Contacts (API only) */}
        {apiDetail?.homepages && apiDetail.homepages.length > 0 && (
          <section className="section">
            <h2 className="section-title mb-12">🔗 관련 홈페이지</h2>
            <div className={styles.docList}>
              {apiDetail.homepages.map((hp, i) => (
                <div key={i} className={styles.docItem}>
                  <span className={styles.docIcon}>🌐</span>
                  <a href={hp.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: 14 }}>
                    {hp.name || hp.url}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Google AdSense 광고 (인아티클) */}
        <section className="section">
          <AdBanner slot="3128095592" format="auto" style={{ minHeight: 90 }} />
        </section>

        {/* CTA Buttons */}
        <div ref={ctaRef} className={styles.ctaArea}>
          {/* 카카오톡 공유 버튼 */}
          <button
            className={`btn btn-kakao ${styles.kakaoBtn}`}
            onClick={handleKakaoShare}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.72 5.34 4.33 6.88L5.2 21l4.1-2.07c.88.22 1.8.34 2.7.34 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
            </svg>
            {kakaoShared ? '✅ 공유됨!' : '카카오톡으로 공유'}
          </button>
          {/* 링크 복사 버튼 */}
          <button
            className={`btn ${shared ? 'btn-success' : 'btn-outline'} ${styles.shareBtn}`}
            onClick={handleShare}
            style={{ flex: 1, minWidth: 0 }}
          >
            {shared ? '✅ 복사됨!' : '🔗 링크 복사'}
          </button>
          <a
            href={benefit.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-primary ${styles.applyBtn}`}
          >
            {t.applyNow} →
          </a>
        </div>
      </main>

      {/* 🚀 Floating CTA Bar — 스크롤 시 하단 고정 */}
      <div
        className={styles.floatingCta}
        style={{
          transform: showFloatingCta ? 'translateY(0)' : 'translateY(100%)',
          opacity: showFloatingCta ? 1 : 0,
        }}
      >
        <button
          className={styles.floatingShare}
          onClick={handleKakaoShare}
          aria-label="공유"
        >
          📤
        </button>
        <a
          href={benefit.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.floatingApplyBtn}
        >
          {t.applyNow} →
        </a>
      </div>

      <BottomNav />
    </>
   )
}

// ── Phase 6: 서류 원스톱 체크리스트 컴포넌트 ──────────────
const GOV24_HOME = 'https://www.gov.kr'

function DocumentChecklist({ docs, benefitId }: { docs: Array<string | { name: string; link: string }>; benefitId: string }) {
  // Normalize docs to { name, link } format (backward compat with string[])
  const normalizedDocs = docs.map(d => typeof d === 'string' ? { name: d, link: '' } : d)
  const enriched = matchDocuments(normalizedDocs.map(d => d.name))
  // Merge download links from API
  const docsWithLinks = enriched.map((doc, i) => ({
    ...doc,
    downloadLink: normalizedDocs[i]?.link || '',
  }))
  const storageKey = `doc_check_${benefitId}`

  const [checked, setChecked] = useState<Record<number, boolean>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })

  const toggle = useCallback((idx: number) => {
    setChecked(prev => {
      const next = { ...prev, [idx]: !prev[idx] }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [storageKey])

  const checkedCount = Object.values(checked).filter(Boolean).length
  const total = docsWithLinks.length
  const progressPct = total > 0 ? Math.round((checkedCount / total) * 100) : 0

  const borderColor = (doc: { freeOnline: boolean; issueUrl: string; downloadLink: string }) => {
    if (doc.downloadLink) return '#f59e0b'    // amber — downloadable file
    if (doc.freeOnline) return '#10b981'       // green — free
    if (doc.issueUrl) return '#3b82f6'         // blue — paid online
    return '#9ca3af'                            // gray — manual
  }

  return (
    <section className="section">
      <div style={{ marginBottom: 12 }}>
        <h2 className="section-title" style={{ marginBottom: 4 }}>📋 필요 서류</h2>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>
          정부24에서 바로 발급받으세요
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
          <span>서류 준비 현황</span>
          <span style={{ fontWeight: 600, color: checkedCount === total ? '#10b981' : 'var(--text-primary)' }}>
            {checkedCount}/{total} 완료
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--bg-tertiary, #e5e7eb)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: checkedCount === total ? '#10b981' : 'var(--primary, #7f13ec)',
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Document List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {docsWithLinks.map((doc, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: checked[i] ? 'var(--bg-secondary, #f9fafb)' : 'var(--bg-primary, #fff)',
              borderRadius: 10,
              borderLeft: `3px solid ${borderColor(doc)}`,
              opacity: checked[i] ? 0.7 : 1,
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onClick={() => toggle(i)}
          >
            {/* Checkbox */}
            <button
              onClick={(e) => { e.stopPropagation(); toggle(i) }}
              aria-label={checked[i] ? '서류 준비 완료 취소' : '서류 준비 완료 체크'}
              style={{
                width: 22, height: 22, borderRadius: 6, border: 'none', flexShrink: 0,
                background: checked[i] ? '#10b981' : '#e5e7eb',
                color: '#fff', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 0.2s ease',
              }}
            >
              {checked[i] ? '✓' : ''}
            </button>

            {/* Doc Name + Description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 14, fontWeight: 600, margin: 0,
                color: 'var(--text-primary)',
                textDecoration: checked[i] ? 'line-through' : 'none',
              }}>
                {doc.name}
              </p>
              {doc.description && (
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>{doc.description}</p>
              )}
            </div>

            {/* Action Button: Download / Issue / Manual */}
            {doc.downloadLink ? (
              <a
                href={doc.downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  flexShrink: 0, padding: '4px 10px', borderRadius: 6,
                  fontSize: 12, fontWeight: 600,
                  background: '#FEF3C7',
                  color: '#92400E',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                📥 다운로드
              </a>
            ) : doc.issueUrl ? (
              <a
                href={doc.issueUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  flexShrink: 0, padding: '4px 10px', borderRadius: 6,
                  fontSize: 12, fontWeight: 600,
                  background: doc.freeOnline ? '#ECFDF5' : '#EFF6FF',
                  color: doc.freeOnline ? '#059669' : '#2563EB',
                  textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                {doc.freeOnline ? '무료발급' : '발급하기'}
              </a>
            ) : (
              <span style={{
                flexShrink: 0, padding: '4px 10px', borderRadius: 6,
                fontSize: 12, color: '#9ca3af', background: '#f3f4f6', whiteSpace: 'nowrap',
              }}>
                본인 준비
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Quick Action Banner — 정부24 한 번에 발급 */}
      <a
        href={GOV24_HOME}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          marginTop: 16, padding: '12px 16px', borderRadius: 10,
          background: 'var(--primary, #7f13ec)', color: '#fff',
          fontSize: 14, fontWeight: 600, textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
      >
        🏛️ 정부24 한 번에 발급받기 →
      </a>

      {/* Info Tip */}
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8, margin: '8px 0 0 0' }}>
        대부분의 서류는 정부24에서 무료로 발급 가능합니다
      </p>
    </section>
  )
}
