'use client'
import { useApp } from '@/lib/context'
import { getBenefitById, getDDayColor, getDDayText } from '@/data/benefits'
import { shareKakaoBenefit } from '@/lib/kakao'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { use } from 'react'
import styles from './page.module.css'

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { t, lang, toggleBookmark, isBookmarked } = useApp()
  const benefit = getBenefitById(id)

  if (!benefit) {
    return (
      <div className={styles.notFound}>
        <span style={{ fontSize: 48 }}>🔍</span>
        <p>혜택 정보를 찾을 수 없습니다</p>
        <Link href="/" className="btn btn-primary">홈으로</Link>
      </div>
    )
  }

  const title = lang === 'ko' ? benefit.title : benefit.titleEn
  const amount = lang === 'ko' ? benefit.amount : benefit.amountEn
  const category = lang === 'ko' ? benefit.categoryLabel : benefit.categoryLabelEn
  const ministry = lang === 'ko' ? benefit.ministry : benefit.ministryEn
  const steps = benefit.steps.map(s => lang === 'ko' ? { title: s.title, desc: s.desc } : { title: s.titleEn, desc: s.descEn })
  const docs = lang === 'ko' ? benefit.documents : benefit.documentsEn
  const checks = benefit.eligibilityChecks
  const fulfilled = checks.filter(c => c.pass).length

  return (
    <>
      <TopBar />
      <main className="page-content">
        {/* 헤더 */}
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

        {/* 히어로 카드 */}
        <div className={styles.heroCard}>
          <div className={styles.heroTop}>
            <span className="badge badge-purple-soft">{category}</span>
            <span className={`badge ${getDDayColor(benefit.dDay)}`}>
              {getDDayText(benefit.dDay, lang === 'ko' ? 'ko' : 'en')} 마감 임박!
            </span>
          </div>
          <h1 className={styles.heroTitle}>{title}</h1>
          <p className={styles.heroAmount}>{amount}</p>
          <p className={styles.heroMinistry}>📌 {ministry}</p>
        </div>

        {/* 핵심 정보 */}
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
            {benefit.targetAge && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon} style={{ background: '#FAF5FF' }}>👤</span>
                <div>
                  <p className={styles.infoLabel}>{t.targetPerson}</p>
                  <p className={styles.infoValue}>{benefit.targetAge}</p>
                </div>
              </div>
            )}
            {benefit.incomeLevel && (
              <div className={styles.infoItem}>
                <span className={styles.infoIcon} style={{ background: '#F0FDF4' }}>💰</span>
                <div>
                  <p className={styles.infoLabel}>{t.incomeLevel}</p>
                  <p className={styles.infoValue}>{benefit.incomeLevel}</p>
                </div>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.infoIcon} style={{ background: '#FFF0ED' }}>🏦</span>
              <div>
                <p className={styles.infoLabel}>{t.paymentMethod}</p>
                <p className={styles.infoValue}>{t.monthlyTransfer}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 자격 확인 */}
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

        {/* 신청 방법 */}
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

        {/* 필요 서류 */}
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

        {/* 하단 버튼 */}
        <div className={styles.ctaArea}>
          <button
            className={`btn btn-kakao ${styles.kakaoBtn}`}
            onClick={() => shareKakaoBenefit({
              title,
              amount,
              categoryLabel: category,
              dDay: benefit.dDay,
              benefitId: benefit.id,
            })}
          >
            💬 {t.kakaoAlert}
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
