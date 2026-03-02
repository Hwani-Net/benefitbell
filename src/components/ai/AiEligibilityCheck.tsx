'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import styles from './AiEligibilityCheck.module.css'

interface Props {
  benefitId: string
  benefitTitle: string
  /** 'modal' (기본): 버튼 클릭 시 모달 열림 (기존 동작)
   *  'inline': 마운트 즉시 AI 3줄 요약+배지 자동 로드, 상단 카드 표시 */
  variant?: 'modal' | 'inline'
}

type Verdict = 'likely' | 'partial' | 'unlikely'

interface CheckResult {
  verdict: Verdict
  reason: string
  tips?: string
}

interface AiCheckResponse {
  questions: string[]
  summary?: string[]
  quickVerdict?: Verdict
  error?: string
  code?: string
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

  // ── Modal variant state ────────────────────────────
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'loading-q' | 'questions' | 'loading-v' | 'result'>('idle')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<boolean[]>([])
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rateLimited, setRateLimited] = useState(false)

  // ── Inline variant state ───────────────────────────
  const [inlineSummary, setInlineSummary] = useState<string[]>([])
  const [inlineVerdict, setInlineVerdict] = useState<Verdict | null>(null)
  const [inlineLoading, setInlineLoading] = useState(false)
  const [inlineExpanded, setInlineExpanded] = useState(false)
  const [inlineQuestions, setInlineQuestions] = useState<string[]>([])

  // ── Auto-load for inline variant ──────────────────
  useEffect(() => {
    if (variant !== 'inline') return
    setInlineLoading(true)
    fetch('/api/ai-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ benefitId, lang, isPremium }),
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
        setInlineQuestions(data.questions ?? [])
      })
      .catch(() => setInlineVerdict('partial'))
      .finally(() => setInlineLoading(false))
  }, [variant, benefitId, lang, isPremium])

  // ── Shared helpers ────────────────────────────────
  async function loadQuestions(fromInline = false) {
    if (fromInline && inlineQuestions.length > 0) {
      // Reuse already-fetched questions
      setQuestions(inlineQuestions)
      setAnswers(new Array(inlineQuestions.length).fill(null))
      setPhase('questions')
      return
    }
    setPhase('loading-q')
    setError(null)
    setRateLimited(false)
    try {
      const res = await fetch('/api/ai-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benefitId, lang, isPremium }),
      })
      const data: AiCheckResponse = await res.json()
      if (!res.ok) {
        if (data.code === 'RATE_LIMIT_EXCEEDED') setRateLimited(true)
        throw new Error(data.error || 'Error')
      }
      setQuestions(data.questions)
      setAnswers(new Array(data.questions.length).fill(null))
      setPhase('questions')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
      setPhase('idle')
    }
  }

  async function submitAnswers() {
    setPhase('loading-v')
    setError(null)
    try {
      const res = await fetch('/api/ai-check', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benefitId, questions, answers, lang }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      const data: CheckResult = await res.json()
      setResult(data)
      setPhase('result')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
      setPhase('questions')
    }
  }

  function reset() {
    setPhase('idle')
    setQuestions([])
    setAnswers([])
    setResult(null)
    setError(null)
  }

  const allAnswered = answers.length > 0 && answers.every(a => a !== null)

  // ══════════════════════════════════════════════════
  // INLINE VARIANT RENDER
  // ══════════════════════════════════════════════════
  if (variant === 'inline') {
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
              ) : (
                <button
                  className={styles.inlineDetailBtn}
                  onClick={() => { setInlineExpanded(true); setOpen(true); loadQuestions(true) }}
                  id={`ai-check-inline-btn-${benefitId}`}
                >
                  {isKo ? '🔍 내가 해당되는지 자세히 확인하기' : '🔍 Check My Eligibility in Detail'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal for inline detail */}
        {inlineExpanded && open && (
          <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) { setOpen(false); setInlineExpanded(false); reset() } }}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.modalSub}>🤖 AI 자격 체크</p>
                  <h2 className={styles.modalTitle}>{benefitTitle}</h2>
                </div>
                <button className={styles.closeBtn} onClick={() => { setOpen(false); setInlineExpanded(false); reset() }}>✕</button>
              </div>
              {renderModalBody()}
            </div>
          </div>
        )}
      </>
    )
  }

  // ══════════════════════════════════════════════════
  // MODAL VARIANT RENDER (기존 동작 유지)
  // ══════════════════════════════════════════════════
  if (!open) {
    return (
      <button
        className={styles.trigger}
        onClick={() => { setOpen(true); loadQuestions() }}
        id={`ai-check-btn-${benefitId}`}
      >
        🤖 {isKo ? '내가 해당되나요? AI 자격 체크' : 'Am I Eligible? AI Check'}
      </button>
    )
  }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalSub}>🤖 AI 자격 체크</p>
            <h2 className={styles.modalTitle}>{benefitTitle}</h2>
          </div>
          <button className={styles.closeBtn} onClick={() => { setOpen(false); reset() }}>✕</button>
        </div>
        {renderModalBody()}
      </div>
    </div>
  )

  // ── Shared modal body renderer ────────────────────
  function renderModalBody() {
    const vInfo = result ? verdictInfo[result.verdict] : null
    return (
      <>
        {phase === 'loading-q' && (
          <div className={styles.centerState}>
            <div className={styles.spinner} />
            <p>{isKo ? 'AI가 자격 조건을 분석 중...' : 'AI analyzing eligibility conditions...'}</p>
          </div>
        )}
        {phase === 'questions' && (
          <div className={styles.questions}>
            <p className={styles.qIntro}>
              {isKo ? '아래 질문에 답하시면 자격 여부를 AI가 분석합니다.' : 'Answer the questions below and AI will analyze your eligibility.'}
            </p>
            {questions.map((q, i) => (
              <div key={i} className={styles.questionItem}>
                <p className={styles.questionText}>
                  <span className={styles.qNum}>{i + 1}</span> {q}
                </p>
                <div className={styles.yesNo}>
                  <button
                    className={`${styles.yesNoBtn} ${answers[i] === true ? styles.yes : ''}`}
                    onClick={() => { const next = [...answers]; next[i] = true; setAnswers(next) }}
                  >
                    {isKo ? '예 ✓' : 'Yes ✓'}
                  </button>
                  <button
                    className={`${styles.yesNoBtn} ${answers[i] === false ? styles.no : ''}`}
                    onClick={() => { const next = [...answers]; next[i] = false; setAnswers(next) }}
                  >
                    {isKo ? '아니오 ✗' : 'No ✗'}
                  </button>
                </div>
              </div>
            ))}
            {allAnswered && (
              <button className={styles.analyzeBtn} onClick={submitAnswers}>
                {isKo ? '🔍 AI 분석 시작' : '🔍 Analyze'}
              </button>
            )}
          </div>
        )}
        {phase === 'loading-v' && (
          <div className={styles.centerState}>
            <div className={styles.spinner} />
            <p>{isKo ? 'AI가 결과를 분석 중...' : 'AI analyzing result...'}</p>
          </div>
        )}
        {phase === 'result' && result && vInfo && (
          <div className={styles.result}>
            <div className={styles.verdictBadge} style={{ borderColor: vInfo.color, color: vInfo.color }}>
              <span className={styles.verdictIcon}>{vInfo.icon}</span>
              <span className={styles.verdictLabel}>{isKo ? vInfo.label.ko : vInfo.label.en}</span>
            </div>
            <p className={styles.reasonText}>{result.reason}</p>
            {result.tips && (
              <div className={styles.tipsBox}>
                <p className={styles.tipsLabel}>{isKo ? '💡 다음 단계' : '💡 Next Steps'}</p>
                <p>{result.tips}</p>
              </div>
            )}
            <div className={styles.disclaimer}>
              {isKo ? '⚠️ AI 분석 결과는 참고용이며 법적 효력이 없습니다.' : '⚠️ AI results are for reference only and have no legal effect.'}
            </div>
            <button className={styles.resetBtn} onClick={reset}>
              {isKo ? '다시 체크하기' : 'Check Again'}
            </button>
          </div>
        )}
        {error && (
          rateLimited ? (
            <div className={styles.upgradeBox}>
              <p className={styles.upgradeTitle}>
                {isKo ? '⏰ 오늘의 AI 분석 횟수를 모두 사용했어요' : '⏰ Daily AI Analysis Limit Reached'}
              </p>
              <p className={styles.upgradeDesc}>
                {isKo
                  ? '무료 플랜은 하루 3회 AI 분석을 제공합니다. 프리미엄으로 업그레이드하면 무제한으로 사용할 수 있어요.'
                  : 'Free plan allows 3 AI analyses per day. Upgrade to Premium for unlimited access.'}
              </p>
              <a href="/premium" className={styles.upgradeBtn}>
                {isKo ? '⭐ 프리미엄 업그레이드 — 월 4,900원' : '⭐ Upgrade to Premium'}
              </a>
            </div>
          ) : (
            <div className={styles.errorBox}><p>⚠️ {error}</p></div>
          )
        )}
      </>
    )
  }
}
