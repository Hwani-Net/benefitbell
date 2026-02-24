'use client'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import AiEligibilityCheck from '@/components/ai/AiEligibilityCheck'
import Link from 'next/link'
import { use, useEffect, useState, useCallback } from 'react'
import styles from './page.module.css'
import AdBanner from '@/components/ads/AdBanner'
import { shareKakaoBenefit } from '@/lib/kakao'

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
  const { t, lang, toggleBookmark, isBookmarked } = useApp()
  const [benefit, setBenefit] = useState<Benefit | null>(null)
  const [apiDetail, setApiDetail] = useState<ApiDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [shared, setShared] = useState(false)
  const [kakaoShared, setKakaoShared] = useState(false)

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
    async function loadData() {
      try {
        // 1. Load basic benefit from list API
        const listRes = await fetch('/api/benefits')
        if (listRes.ok) {
          const listJson = await listRes.json()
          const found = (listJson.data as Benefit[]).find(b => b.id === id)
          if (found) setBenefit(found)
        }

        // 2. Load detailed info from detail API
        const detailRes = await fetch(`/api/benefits/${id}`)
        if (detailRes.ok) {
          const detailJson = await detailRes.json()
          if (detailJson.success && detailJson.source === 'api') {
            setApiDetail(detailJson.data)
          } else if (detailJson.success && detailJson.source === 'mock') {
            // mock detail returned the Benefit directly
            setBenefit(detailJson.data)
          }
        }
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
  const docs = apiDetail?.requiredDocs?.length ? apiDetail.requiredDocs : (lang === 'ko' ? benefit.documents : benefit.documentsEn)
  const checks = benefit.eligibilityChecks
  const fulfilled = checks.filter(c => c.pass).length

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
          <Link href="/search" className={styles.backBtn}>‹</Link>
          <span className={styles.headerTitle}>{t.benefitDetail}</span>
          <button
            className={styles.bookmarkBtn}
            onClick={() => toggleBookmark(benefit.id)}
            aria-label="북마크"
          >
            {isBookmarked(benefit.id) ? '❤️' : '🤍'}
          </button>
        </div>

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
                <p className={styles.infoValue}>{benefit.applicationStart} ~ {benefit.applicationEnd}</p>
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

        {/* Eligibility Check */}
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

        {/* AI Eligibility Check */}
        <AiEligibilityCheck
          benefitId={benefit.id}
          benefitTitle={title}
        />

        {/* Application Methods (from API) */}
        {apiDetail?.applicationMethods && apiDetail.applicationMethods.length > 0 ? (
          <section className="section">
            <h2 className="section-title mb-12">📝 신청 방법</h2>
            <div className={styles.stepList}>
              {apiDetail.applicationMethods.map((method, i) => (
                <div key={i} className={styles.stepItem}>
                  <div className={styles.stepNum}>{i + 1}</div>
                  <div className={styles.stepContent}>
                    <p className={styles.stepTitle}>{method}</p>
                    {apiDetail.applicationLinks[i] && (
                      <a
                        href={apiDetail.applicationLinks[i]}
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
        ) : (
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
        )}

        {/* Required Documents */}
        <section className="section">
          <h2 className="section-title mb-12">{t.requiredDocuments}</h2>
          <div className={styles.docList}>
            {docs.map((doc, i) => (
              <div key={i} className={styles.docItem}>
                <span className={styles.docIcon}>📄</span>
                <span className={styles.docName}>{doc}</span>
              </div>
            ))}
          </div>
        </section>

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
        <div className={styles.ctaArea}>
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
      <BottomNav />
    </>
  )
}
