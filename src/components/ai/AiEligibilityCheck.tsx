'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import styles from './AiEligibilityCheck.module.css'

interface Props {
  benefitId: string
  benefitTitle: string
  /** 'modal' (기본): 버튼 클릭 시 모달 열림
   *  'inline': 마운트 즉시 AI 3줄 요약+배지 자동 로드, 상단 카드 표시 */
  variant?: 'modal' | 'inline'
}

type Verdict = 'likely' | 'partial' | 'unlikely'

interface AiCheckResponse {
  questions: string[]
  summary?: string[]
  quickVerdict?: Verdict
  error?: string
  code?: string
}

interface DetailedResult {
  verdict: Verdict
  reason: string
  tips?: string
  details?: string[]
}

const verdictInfo = {
  likely: { icon: '✅', label: { ko: '가능성 높음', en: 'Likely Eligible' }, color: '#16a34a' },
  partial: { icon: '⚠️', label: { ko: '조건 확인 필요', en: 'Partial Match' }, color: '#b45309' },
  unlikely: { icon: '❌', label: { ko: '가능성 낮음', en: 'Unlikely Eligible' }, color: '#dc2626' },
}

export default function AiEligibilityCheck({ benefitId, benefitTitle, variant = 'modal' }: Props) {
  const { lang, userProfile } = useApp()
  const isKo = lang === 'ko'
  const isPremium = !!userProfile?.isPremium
  const hasProfile = !!(userProfile?.birthYear && userProfile?.region)

  // ── Inline variant state ───────────────────────────
  const [inlineSummary, setInlineSummary] = useState<string[]>([])
  const [inlineVerdict, setInlineVerdict] = useState<Verdict | null>(null)
  const [inlineLoading, setInlineLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)

  // ── Detail modal state ─────────────────────────────
  const [open, setOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailResult, setDetailResult] = useState<DetailedResult | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)

  // ── Auto-load for inline variant (with sessionStorage cache) ──
  useEffect(() => {
    if (variant !== 'inline') return
    // C안: 프로필 없으면 API 호출 안 함 (과금 방지 + 정직한 UX)
    if (!hasProfile) return

    const cacheKey = `ai_check_${benefitId}_${lang}`
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        const data: AiCheckResponse = JSON.parse(cached)
        setInlineSummary(data.summary ?? [])
        setInlineVerdict(data.quickVerdict ?? 'partial')
        return
      }
    } catch { /* cache miss */ }

    const controller = new AbortController()
    setInlineLoading(true)
    fetch('/api/ai-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ benefitId, benefitTitle, lang, isPremium }),
      signal: controller.signal,
    })
      .then(async r => {
        const data: AiCheckResponse = await r.json()
        if (!r.ok) {
          if (data.code === 'RATE_LIMIT_EXCEEDED') setRateLimited(true)
          throw new Error(data.error || 'Error')
        }
        return data
      })
      .then(data => {
        setInlineSummary(data.summary ?? [])
        setInlineVerdict(data.quickVerdict ?? 'partial')
        try { sessionStorage.setItem(cacheKey, JSON.stringify(data)) } catch { /* storage full */ }
      })
      .catch(err => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setInlineVerdict('partial')
      })
      .finally(() => setInlineLoading(false))

    return () => controller.abort()
  }, [variant, benefitId, lang, isPremium, hasProfile])

  // ── Load detailed analysis (no questions!) ─────────
  async function loadDetailedAnalysis() {
    setDetailLoading(true)
    setDetailError(null)
    setDetailResult(null)
    try {
      const res = await fetch('/api/ai-check', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          benefitId,
          benefitTitle,
          lang,
          mode: 'detailed',
          // C안: 프로필 데이터 전달 → 맞춤 분석
          ...(hasProfile ? {
            profile: {
              age: new Date().getFullYear() - userProfile.birthYear,
              region: userProfile.region,
              employmentStatus: userProfile.employmentStatus,
              incomePercent: userProfile.incomePercent,
              specialStatus: userProfile.specialStatus,
            }
          } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setDetailResult({
        verdict: data.verdict ?? 'partial',
        reason: data.reason ?? '',
        tips: data.tips ?? '',
        details: data.details ?? [],
      })
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Error')
    } finally {
      setDetailLoading(false)
    }
  }

  function openDetail() {
    setOpen(true)
    loadDetailedAnalysis()
  }

  function closeDetail() {
    setOpen(false)
    setDetailResult(null)
    setDetailError(null)
  }

  // ══════════════════════════════════════════════════
  // INLINE VARIANT RENDER
  // ══════════════════════════════════════════════════
  if (variant === 'inline') {
    // 프로필 없으면 프로필 입력 CTA 표시
    if (!hasProfile) {
      return (
        <div className={styles.inlineCard}>
          <div className={styles.inlineHeader}>
            <div className={styles.inlineHeaderLeft}>
              <span>🤖</span>
              <span className={styles.inlineLabel}>AI 자격 체크</span>
            </div>
          </div>
          <div className={styles.inlineBody}>
            <p className={styles.inlineSummaryItem}>
              {isKo
                ? '프로필을 입력하면 이 혜택에 해당되는지 AI가 맞춤 분석해드립니다.'
                : 'Enter your profile to get personalized AI eligibility analysis.'}
            </p>
          </div>
          <div className={styles.inlineFooter}>
            <a href="/profile" className={styles.inlineDetailBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
              {isKo ? '📝 30초 프로필 입력하고 맞춤 분석 받기' : '📝 Enter Profile for AI Analysis'}
            </a>
          </div>
        </div>
      )
    }

    const v = inlineVerdict ?? 'partial'
    const vInfo = verdictInfo[v]

    return (
      <>
        <div className={styles.inlineCard}>
          {/* Header */}
          <div className={styles.inlineHeader}>
            <div className={styles.inlineHeaderLeft}>
              <span>🤖</span>
              <span className={styles.inlineLabel}>AI 자격 체크</span>
            </div>
            {!inlineLoading && inlineVerdict && (
              <span className={`${styles.inlineBadge} ${styles[v]}`}>
                {vInfo.icon} {isKo ? vInfo.label.ko : vInfo.label.en}
              </span>
            )}
          </div>

          {/* Body */}
          {inlineLoading ? (
            <div className={styles.inlineLoading}>
              <div className={styles.inlineSpinner} />
              <span>{isKo ? 'AI가 혜택을 분석하고 있어요…' : 'AI is analyzing the benefit…'}</span>
            </div>
          ) : (
            <div className={styles.inlineBody}>
              {inlineSummary.length > 0 ? (
                <ul className={styles.inlineSummaryList}>
                  {inlineSummary.map((line, i) => <li key={i}>{line}</li>)}
                </ul>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  {isKo ? '요약 정보를 불러올 수 없습니다.' : 'Could not load summary.'}
                </p>
              )}
            </div>
          )}

          {/* Footer CTA */}
          {!inlineLoading && (
            <div className={styles.inlineFooter}>
              {rateLimited ? (
                <a href="/premium" className={styles.upgradeBtn}>
                  {isKo ? '⭐ 프리미엄으로 무제한 AI 분석' : '⭐ Upgrade for Unlimited AI Checks'}
                </a>
              ) : hasProfile ? (
                <button
                  className={styles.inlineDetailBtn}
                  onClick={openDetail}
                  id={`ai-check-inline-btn-${benefitId}`}
                >
                  {isKo ? '🔍 내가 해당되는지 자세히 확인하기' : '🔍 Check My Eligibility in Detail'}
                </button>
              ) : (
                <a href="/profile" className={styles.inlineDetailBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
                  {isKo ? '📝 프로필 입력 후 맞춤 분석 받기' : '📝 Enter Profile for Personalized Check'}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Detail analysis modal */}
        {open && (
          <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) closeDetail() }}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.modalSub}>🤖 AI 상세 분석</p>
                  <h2 className={styles.modalTitle}>{benefitTitle}</h2>
                </div>
                <button className={styles.closeBtn} onClick={closeDetail}>✕</button>
              </div>
              {renderDetailBody()}
            </div>
          </div>
        )}
      </>
    )
  }

  // ══════════════════════════════════════════════════
  // MODAL VARIANT RENDER (버튼 → 바로 상세 분석)
  // ══════════════════════════════════════════════════
  if (!open) {
    // 프로필 없으면 프로필 입력 CTA 표시 (과금 방지 + 정직한 UX)
    if (!hasProfile) {
      return (
        <a
          href="/profile"
          className={styles.trigger}
          style={{ textDecoration: 'none', textAlign: 'center' }}
          id={`ai-check-btn-${benefitId}`}
        >
          📝 {isKo ? '프로필 입력 후 AI 맞춤 자격 체크' : 'Enter Profile for AI Eligibility Check'}
        </a>
      )
    }
    return (
      <button
        className={styles.trigger}
        onClick={openDetail}
        id={`ai-check-btn-${benefitId}`}
      >
        🤖 {isKo ? '내가 해당되나요? AI 자격 체크' : 'Am I Eligible? AI Check'}
      </button>
    )
  }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) closeDetail() }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalSub}>🤖 AI 상세 분석</p>
            <h2 className={styles.modalTitle}>{benefitTitle}</h2>
          </div>
          <button className={styles.closeBtn} onClick={closeDetail}>✕</button>
        </div>
        {renderDetailBody()}
      </div>
    </div>
  )

  function renderDetailBody() {
    if (detailLoading) {
      return (
        <div className={styles.centerState}>
          <div className={styles.spinner} />
          <p>{isKo ? 'AI가 자격 조건을 상세 분석 중...' : 'AI analyzing eligibility in detail...'}</p>
        </div>
      )
    }

    if (detailError) {
      return (
        <div className={styles.errorBox}>
          <p>⚠️ {detailError}</p>
          <button className={styles.resetBtn} onClick={loadDetailedAnalysis}>
            {isKo ? '다시 시도' : 'Retry'}
          </button>
        </div>
      )
    }

    if (detailResult) {
      const vInfo = verdictInfo[detailResult.verdict]
      return (
        <div className={styles.result}>
          <div className={styles.verdictBadge} style={{ borderColor: vInfo.color, color: vInfo.color }}>
            <span className={styles.verdictIcon}>{vInfo.icon}</span>
            <span className={styles.verdictLabel}>{isKo ? vInfo.label.ko : vInfo.label.en}</span>
          </div>
          <p className={styles.reasonText}>{detailResult.reason}</p>
          {detailResult.details && detailResult.details.length > 0 && (
            <ul className={styles.inlineSummaryList} style={{ marginTop: 12 }}>
              {detailResult.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
          {detailResult.tips && (
            <div className={styles.tipsBox}>
              <p className={styles.tipsLabel}>{isKo ? '💡 다음 단계' : '💡 Next Steps'}</p>
              <p>{detailResult.tips}</p>
            </div>
          )}
          <div className={styles.disclaimer}>
            {isKo ? '⚠️ AI 분석 결과는 참고용이며 법적 효력이 없습니다.' : '⚠️ AI results are for reference only.'}
          </div>
        </div>
      )
    }

    return null
  }
}
