'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import styles from './page.module.css'

interface AiResult {
  benefitIds: string[]
  message: string
  reasons: Record<string, string>
}

const EXAMPLE_PROMPTS_KO = [
  '40대 소상공인인데 임대료가 너무 부담돼요',
  '창업을 준비 중인 30대 예비창업자입니다',
  '가게 문을 닫아야 할 것 같아요. 폐업 지원이 있나요?',
  '빚이 너무 많아서 개인회생을 알아보고 있어요',
  '청년 창업 자금을 받을 수 있는지 알고 싶어요',
]

const EXAMPLE_PROMPTS_EN = [
  'I\'m in my 40s running a small business, rent is overwhelming',
  'I\'m a 30-year-old preparing to start a business',
  'I need to close my store. Is there closure support?',
  'I have too much debt and looking into personal rehabilitation',
  'I want to know if I can get youth startup funding',
]

export default function AiPage() {
  const { t, lang, userProfile, benefits: allBenefits } = useApp()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AiResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usageCount, setUsageCount] = useState(0)
  const [sharedId, setSharedId] = useState<string | null>(null)

  const isKo = lang === 'ko'
  const examples = isKo ? EXAMPLE_PROMPTS_KO : EXAMPLE_PROMPTS_EN

  useEffect(() => {
    if (!userProfile?.isPremium) {
      const today = new Date().toDateString()
      const usageStr = localStorage.getItem('ai_usage_limit')
      let usage = usageStr ? JSON.parse(usageStr) : { date: today, count: 0 }
      if (usage.date !== today) usage = { date: today, count: 0 }
      setUsageCount(usage.count)
    }
  }, [userProfile?.isPremium])

  async function handleSubmit() {
    if (!input.trim() || loading) return

    if (!userProfile?.isPremium) {
      const today = new Date().toDateString()
      const usageStr = localStorage.getItem('ai_usage_limit')
      let usage = usageStr ? JSON.parse(usageStr) : { date: today, count: 0 }
      if (usage.date !== today) usage = { date: today, count: 0 }

      if (usage.count >= 3) {
        if (confirm(isKo ? '무료 제공량(일 3회)을 모두 소진했습니다.\n무제한 분석을 위해 프리미엄으로 업그레이드하시겠습니까?' : 'You have exhausted your free daily limit (3 times).\nWould you like to upgrade to Premium for unlimited analysis?')) {
          window.location.href = '/premium'
        }
        return
      }

      const nextCount = usage.count + 1
      localStorage.setItem('ai_usage_limit', JSON.stringify({ date: today, count: nextCount }))
      setUsageCount(nextCount)
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: input.trim(), lang }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'AI 서비스 오류')
      }
      const data: AiResult = await res.json()
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Web Share API (스킬 가이드 준수)
  const handleShare = async (benefitId: string, title: string) => {
    const url = `${window.location.origin}/detail/${benefitId}`
    const text = isKo
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
  }

  return (
    <div className={styles.page}>
      <TopBar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.aiIcon}>🤖</div>
          <h1 className={styles.title}>
            {isKo ? 'AI 맞춤 혜택 추천' : 'AI Benefit Recommender'}
          </h1>
          <p className={styles.subtitle}>
            {isKo
              ? '내 상황을 입력하면 AI가 딱 맞는 혜택을 찾아드려요'
              : 'Describe your situation and AI will find the best benefits for you'}
          </p>
        </div>

        <div className={styles.inputSection}>
          <textarea
            className={styles.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isKo
              ? '예: 40대 자영업자, 코로나 이후 매출이 절반으로 줄었어요. 운전자금이 필요한데 어떤 지원이 있나요?'
              : 'e.g. I\'m a self-employed person in my 40s. Revenue dropped by half since COVID. What support is available for operating capital?'}
            rows={4}
            maxLength={500}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
            }}
          />
          <div className={styles.inputFooter} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <span className={styles.charCount}>{input.length}/500</span>
            {!userProfile?.isPremium && (
              <span className="badge badge-coral-soft">
                {isKo ? `무료 ${3 - usageCount}회 남음` : `${3 - usageCount} free left`}
              </span>
            )}
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              id="ai-submit-btn"
            >
              {loading
                ? (isKo ? 'AI 분석 중...' : 'AI analyzing...')
                : (isKo ? '🔍 혜택 찾기' : '🔍 Find Benefits')}
            </button>
          </div>
        </div>

        {/* Example prompts */}
        {!result && !loading && (
          <div className={styles.examples}>
            <p className={styles.examplesTitle}>
              {isKo ? '💡 이렇게 물어보세요' : '💡 Try asking'}
            </p>
            <div className={styles.exampleList}>
              {examples.map((ex, i) => (
                <button
                  key={i}
                  className={styles.exampleChip}
                  onClick={() => setInput(ex)}
                  id={`ai-example-${i}`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>{isKo ? 'AI가 혜택 데이터베이스를 분석하고 있어요...' : 'AI is analyzing the benefits database...'}</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className={styles.errorBox}>
            {error === 'AI_KEY_INVALID' ? (
              <p>⚠️ {isKo ? 'AI 서비스 점검 중입니다. 잠시 후 다시 시도해주세요.' : 'AI service is under maintenance. Please try again later.'}</p>
            ) : error === 'AI_QUOTA' ? (
              <p>⚠️ {isKo ? 'AI 서비스 사용량이 일시적으로 초과되었습니다. 잠시 후 다시 시도해주세요.' : 'AI service is temporarily overloaded. Please try again shortly.'}</p>
            ) : (
              <p>⚠️ {isKo ? 'AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.' : 'AI analysis failed. Please try again later.'}</p>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={styles.results}>
            <div className={styles.aiMessage}>
              <span className={styles.aiAvatar}>🤖</span>
              <div className={styles.aiMessageBubble}>
                <p>{result.message}</p>
              </div>
            </div>

            <p className={styles.resultCount}>
              {isKo
                ? `${result.benefitIds.length}개의 맞춤 혜택을 찾았어요`
                : `Found ${result.benefitIds.length} matching benefits`}
            </p>

            <div className={styles.benefitList}>
              {result.benefitIds.map(id => {
                const benefit = allBenefits.find(b => b.id === id)
                const reason = result.reasons[id]
                return (
                  <div key={id} className={styles.benefitCard}>
                    {/* 카드 상단: 카테고리 + 공유 버튼 */}
                    <div className={styles.cardTop}>
                      <span className="badge badge-coral-soft" style={{ fontSize: 11 }}>
                        {benefit
                          ? (isKo ? benefit.categoryLabel : benefit.categoryLabelEn)
                          : '🔎 혜택'}
                      </span>
                      {benefit?.dDay !== undefined && benefit.dDay >= 0 && benefit.dDay <= 30 && (
                        <span className="badge" style={{ fontSize: 11, color: getDDayColor(benefit.dDay) }}>
                          {getDDayText(benefit.dDay, isKo ? 'ko' : 'en')}
                        </span>
                      )}
                      <button
                        style={{
                          marginLeft: 'auto',
                          background: sharedId === id ? 'rgba(16,185,129,0.12)' : 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 16,
                          padding: '2px 6px',
                          borderRadius: 8,
                          color: sharedId === id ? '#10b981' : 'var(--text-secondary)',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => benefit && handleShare(id, isKo ? benefit.title : benefit.titleEn)}
                        aria-label={isKo ? '공유하기' : 'Share'}
                        title={isKo ? '공유하기' : 'Share'}
                      >
                        {sharedId === id ? '✅' : '📤'}
                      </button>
                    </div>

                    {/* 혜택 제목 & 금액 — 실제 데이터 표시 */}
                    <Link href={`/detail/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
                      <h3 className={styles.cardTitle}>
                        {benefit
                          ? (isKo ? benefit.title : benefit.titleEn)
                          : id}
                      </h3>
                      {benefit && (
                        <p className={styles.cardAmount}>
                          {isKo ? benefit.amount : benefit.amountEn}
                        </p>
                      )}

                      {/* AI 추천 이유 */}
                      {reason && (
                        <div className={styles.aiReason}>
                          <span>✨</span>
                          <p>{reason}</p>
                        </div>
                      )}

                      <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 8, fontWeight: 600 }}>
                        {isKo ? '자세히 보기 →' : 'View details →'}
                      </p>
                    </Link>
                  </div>
                )
              })}
            </div>

            <div className={styles.disclaimer}>
              {isKo
                ? '⚠️ AI 분석 결과는 참고용이며 법적 효력이 없습니다. 정확한 자격 판단은 해당 기관에 문의하세요.'
                : '⚠️ AI recommendations are for reference only and have no legal effect. Please contact the relevant agency for accurate eligibility determination.'}
            </div>

            <button
              className={styles.resetBtn}
              onClick={() => { setResult(null); setInput('') }}
            >
              {isKo ? '다시 검색하기' : 'Search Again'}
            </button>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
