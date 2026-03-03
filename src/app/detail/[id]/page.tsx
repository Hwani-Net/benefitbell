'use client'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import AiEligibilityCheck from '@/components/ai/AiEligibilityCheck'
import Link from 'next/link'
import { use, useEffect, useState, useCallback, useRef } from 'react'

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
  requiredDocs: string[]
  relatedLaws: string[]
  homepages: { name: string; url: string }[]
}

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { t, lang, toggleBookmark, isBookmarked } = useApp()
  const [benefit, setBenefit] = useState<Benefit | null>(null)
  const [apiDetail, setApiDetail] = useState<ApiDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [shared, setShared] = useState(false)
  const [kakaoShared, setKakaoShared] = useState(false)
  const ctaRef = useRef<HTMLDivElement>(null)
  const showFloatingCta = useFloatingCta(ctaRef)

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
  }, [benefit])

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

  useEffect(() => {
    async function fetchDetail(benefitId: string, retry = false): Promise<ApiDetail | null> {
      try {
        const detailRes = await fetch(`/api/benefits/${benefitId}`)
        if (detailRes.ok) {
          const detailJson = await detailRes.json()
          if (detailJson.success && detailJson.source === 'api') {
            return detailJson.data as ApiDetail
          }
        }
        // 첫 시도 실패 시 1.5초 후 재시도 (data.go.kr 간헐 오류)
        if (!retry) {
          await new Promise(r => setTimeout(r, 1500))
          return fetchDetail(benefitId, true)
        }
      } catch { /* ignore */ }
      return null
    }

    async function loadData() {
      try {
        // 1. 목록 API와 상세 API 병렬 시작
        const [listRes, detail] = await Promise.all([
          fetch('/api/benefits'),
          fetchDetail(id),
        ])

        if (listRes.ok) {
          const listJson = await listRes.json()
          const found = (listJson.data as Benefit[]).find(b => b.id === id)
          if (found) {
            // 상세 API에 날짜 있으면 업데이트
            if (detail?.applyBgnDt || detail?.applyEndDt) {
              setBenefit({
                ...found,
                applicationStart: detail.applyBgnDt ?? found.applicationStart,
                applicationEnd: detail.applyEndDt ?? found.applicationEnd,
              })
            } else {
              setBenefit(found)
            }
          }
        }

        if (detail) setApiDetail(detail)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

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
  const benefitDocs = lang === 'ko' ? (benefit.documents ?? []) : (benefit.documentsEn ?? [])
  const docs: string[] = apiDetail?.requiredDocs?.length ? apiDetail.requiredDocs : benefitDocs

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


  // Helper: render multi-line text as paragraphs
  const renderText = (text: string) => {
    if (!text) return null
    return text.split('\n').filter(l => l.trim()).map((line, i) => (
      <p key={i} style={{ margin: '4px 0', lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: 14 }}>{line}</p>
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
            {benefit.dDay >= 0 && benefit.dDay <= 30 && (
              <span className={`badge ${getDDayColor(benefit.dDay)}`}>
                {getDDayText(benefit.dDay, lang === 'ko' ? 'ko' : 'en')}
              </span>
            )}
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

        {/* Tags */}
        {(apiDetail?.lifeStages || apiDetail?.targetGroups || apiDetail?.themes) && (
          <section className="section">
            <h2 className="section-title mb-12">🏷️ 관련 태그</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {apiDetail?.lifeStages?.split(',').map((tag, i) => (
                <span key={`life-${i}`} className="badge badge-purple-soft">{tag.trim()}</span>
              ))}
              {apiDetail?.targetGroups?.split(',').map((tag, i) => (
                <span key={`target-${i}`} className="badge badge-coral-soft">{tag.trim()}</span>
              ))}
              {apiDetail?.themes?.split(',').map((tag, i) => (
                <span key={`theme-${i}`} className="badge badge-green-soft">{tag.trim()}</span>
              ))}
            </div>
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
const GOV24_HOME = 'https://www.gov.kr/mw/AA020InfoCappView.do'

function DocumentChecklist({ docs, benefitId }: { docs: string[]; benefitId: string }) {
  const enriched = matchDocuments(docs)
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
  const total = enriched.length
  const progressPct = total > 0 ? Math.round((checkedCount / total) * 100) : 0

  const borderColor = (doc: { freeOnline: boolean; issueUrl: string }) => {
    if (doc.freeOnline) return '#10b981' // green — free
    if (doc.issueUrl) return '#3b82f6'   // blue — paid online
    return '#9ca3af'                      // gray — manual
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
        {enriched.map((doc, i) => (
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

            {/* Issue Button */}
            {doc.issueUrl ? (
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
