'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import styles from './AiEligibilityCheck.module.css'

interface Props {
  benefitId: string
  benefitTitle: string
}

type Verdict = 'likely' | 'partial' | 'unlikely'

interface CheckResult {
  verdict: Verdict
  reason: string
  tips?: string
}

export default function AiEligibilityCheck({ benefitId, benefitTitle }: Props) {
  const { lang } = useApp()
  const isKo = lang === 'ko'

  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'loading-q' | 'questions' | 'loading-v' | 'result'>('idle')
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<boolean[]>([])
  const [result, setResult] = useState<CheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function loadQuestions() {
    setPhase('loading-q')
    setError(null)
    try {
      const res = await fetch('/api/ai-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ benefitId, lang }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Error')
      const data = await res.json()
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

  const verdictInfo = {
    likely: { icon: '✅', label: isKo ? '가능성 높음' : 'Likely Eligible', color: '#22c55e' },
    partial: { icon: '⚠️', label: isKo ? '일부 조건 확인 필요' : 'Partial Match', color: '#f59e0b' },
    unlikely: { icon: '❌', label: isKo ? '해당 가능성 낮음' : 'Unlikely Eligible', color: '#ef4444' },
  }

  const allAnswered = answers.length > 0 && answers.every(a => a !== null)

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

        {/* Loading questions */}
        {phase === 'loading-q' && (
          <div className={styles.centerState}>
            <div className={styles.spinner} />
            <p>{isKo ? 'AI가 자격 조건을 분석 중...' : 'AI analyzing eligibility conditions...'}</p>
          </div>
        )}

        {/* Questions */}
        {phase === 'questions' && (
          <div className={styles.questions}>
            <p className={styles.qIntro}>
              {isKo
                ? '아래 질문에 답하시면 자격 여부를 AI가 분석합니다.'
                : 'Answer the questions below and AI will analyze your eligibility.'}
            </p>
            {questions.map((q, i) => (
              <div key={i} className={styles.questionItem}>
                <p className={styles.questionText}>
                  <span className={styles.qNum}>{i + 1}</span> {q}
                </p>
                <div className={styles.yesNo}>
                  <button
                    className={`${styles.yesNoBtn} ${answers[i] === true ? styles.yes : ''}`}
                    onClick={() => {
                      const next = [...answers]
                      next[i] = true
                      setAnswers(next)
                    }}
                  >
                    {isKo ? '예 ✓' : 'Yes ✓'}
                  </button>
                  <button
                    className={`${styles.yesNoBtn} ${answers[i] === false ? styles.no : ''}`}
                    onClick={() => {
                      const next = [...answers]
                      next[i] = false
                      setAnswers(next)
                    }}
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

        {/* Loading verdict */}
        {phase === 'loading-v' && (
          <div className={styles.centerState}>
            <div className={styles.spinner} />
            <p>{isKo ? 'AI가 결과를 분석 중...' : 'AI analyzing result...'}</p>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && result && (
          <div className={styles.result}>
            <div
              className={styles.verdictBadge}
              style={{ borderColor: verdictInfo[result.verdict].color, color: verdictInfo[result.verdict].color }}
            >
              <span className={styles.verdictIcon}>{verdictInfo[result.verdict].icon}</span>
              <span className={styles.verdictLabel}>{verdictInfo[result.verdict].label}</span>
            </div>
            <p className={styles.reasonText}>{result.reason}</p>
            {result.tips && (
              <div className={styles.tipsBox}>
                <p className={styles.tipsLabel}>{isKo ? '💡 다음 단계' : '💡 Next Steps'}</p>
                <p>{result.tips}</p>
              </div>
            )}
            <div className={styles.disclaimer}>
              {isKo
                ? '⚠️ AI 분석 결과는 참고용이며 법적 효력이 없습니다.'
                : '⚠️ AI results are for reference only and have no legal effect.'}
            </div>
            <button className={styles.resetBtn} onClick={reset}>
              {isKo ? '다시 체크하기' : 'Check Again'}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={styles.errorBox}>
            <p>⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
