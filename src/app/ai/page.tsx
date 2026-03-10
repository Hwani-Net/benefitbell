'use client'
import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText, bText } from '@/data/benefits'
import { getFilteredBenefits, FilteredBenefit } from '@/lib/recommendation'
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

// ─── Filter result card ───
function FilterCard({ benefit, lang }: { benefit: FilteredBenefit; lang: string }) {
  const isKo = lang === 'ko'
  const scoreColor = benefit.aiVerdict === 'likely' ? '#15803d'
    : benefit.aiVerdict === 'partial' ? '#92400e'
    : '#dc2626'
  const scoreBg = benefit.aiVerdict === 'likely' ? '#dcfce7'
    : benefit.aiVerdict === 'partial' ? '#fef3c7'
    : '#fee2e2'

  return (
    <Link href={`/detail/${benefit.id}`} className={styles.filterCard}>
      <div className={styles.filterCardInfo}>
        <h3 className={styles.filterCardTitle}>{bText(benefit, 'title', lang)}</h3>
        <p className={styles.filterCardAmount}>{bText(benefit, 'amount', lang)}</p>
        <div className={styles.filterCardMeta}>
          <span className="badge badge-coral-soft text-xs">{bText(benefit, 'categoryLabel', lang)}</span>
          {benefit.dDay >= 0 && benefit.dDay <= 14 && (
            <span className={`badge ${getDDayColor(benefit.dDay)} text-xs`}>
              {getDDayText(benefit.dDay, isKo ? 'ko' : 'en')}
            </span>
          )}
        </div>
        {benefit.aiSummary && (
          <p className={styles.filterCardSummary}>✨ {benefit.aiSummary}</p>
        )}
      </div>
      {benefit.aiScore !== undefined && (
        <div className={styles.scoreBadge}>
          <div className={styles.scoreCircle} style={{ background: scoreBg, color: scoreColor }}>
            {benefit.aiScore}%
          </div>
          <span className={styles.scoreLabel}>{isKo ? 'AI 점수' : 'AI'}</span>
        </div>
      )}
    </Link>
  )
}

export default function AiPage() {
  const { t, lang, userProfile, benefits: allBenefits, kakaoUser } = useApp()
  const [activeTab, setActiveTab] = useState<'filter' | 'chat'>('filter')

  // ─── Tab 1: Filter state ───
  const [aiScores, setAiScores] = useState<Map<string, { score: number; verdict: string; summary: string }>>(new Map())
  const [aiLoading, setAiLoading] = useState(false)
  const [aiProgress, setAiProgress] = useState({ done: 0, total: 0 })
  const [showUnlikely, setShowUnlikely] = useState(false)

  // ─── Tab 2: Chat state ───
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatResult, setChatResult] = useState<AiResult | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [usageCount, setUsageCount] = useState(0)
  const [sharedId, setSharedId] = useState<string | null>(null)

  const isKo = lang === 'ko'
  const hasProfile = !!(userProfile?.birthYear && userProfile?.region)

  // ─── D안: 배치별 점진적 AI 스코어 로딩 ───
  // 10개씩 순차 처리, 각 배치 완료 즉시 UI 업데이트 → 첫 결과 ~1초
  useEffect(() => {
    if (!hasProfile || allBenefits.length === 0) return
    let cancelled = false

    const BATCH_SIZE = 10
    const toAssess = allBenefits.slice(0, 50) // 최대 50개
    const totalBatches = Math.ceil(toAssess.length / BATCH_SIZE)

    setAiLoading(true)
    setAiProgress({ done: 0, total: toAssess.length })

    const profilePayload = {
      age: new Date().getFullYear() - userProfile.birthYear,
      gender: userProfile.gender,
      region: userProfile.region,
      employmentStatus: userProfile.employmentStatus,
      housingType: userProfile.housingType,
      incomePercent: userProfile.incomePercent,
      householdSize: userProfile.householdSize,
      specialStatus: userProfile.specialStatus,
    }

    ;(async () => {
      for (let i = 0; i < totalBatches; i++) {
        if (cancelled) break

        const batch = toAssess.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
        try {
          const res = await fetch('/api/ai-eligibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile: profilePayload,
              benefits: batch.map(b => ({
                id: b.id,
                title: b.title,
                description: b.description?.substring(0, 500) || '',
                category: b.category,
                targetAge: b.targetAge || '',
                incomeLevel: b.incomeLevel || '',
                // AI 정확도 향상: 자격요건 체크리스트 + 신청절차 전달
                eligibility: b.eligibilityChecks?.map(c => c.label).join(', ') || '',
              })),
            }),
          })

          if (!res.ok || cancelled) break

          const data = await res.json()
          const batchResults: Array<{ benefitId: string; score: number; verdict: string; summary: string }> = data.results || []

          if (!cancelled) {
            // 배치 완료 즉시 map 업데이트 → 화면 즉시 반영 (D안 핵심)
            setAiScores(prev => {
              const next = new Map(prev)
              for (const r of batchResults) {
                next.set(r.benefitId, { score: r.score, verdict: r.verdict, summary: r.summary })
              }
              return next
            })
            setAiProgress(prev => ({ ...prev, done: Math.min(prev.done + batch.length, prev.total) }))
          }
        } catch {
          // 배치 실패 시 다음 배치로 계속 (부분 실패 허용)
          if (!cancelled) {
            setAiProgress(prev => ({ ...prev, done: Math.min(prev.done + batch.length, prev.total) }))
          }
        }
      }

      if (!cancelled) setAiLoading(false)
    })()

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasProfile, allBenefits.length])

  // ─── Free usage tracking ───
  useEffect(() => {
    if (!userProfile?.isPremium) {
      const today = new Date().toDateString()
      const usageStr = localStorage.getItem('ai_usage_limit')
      let usage = usageStr ? JSON.parse(usageStr) : { date: today, count: 0 }
      if (usage.date !== today) usage = { date: today, count: 0 }
      setUsageCount(usage.count)
    }
  }, [userProfile?.isPremium])

  // ─── Chat submit ───
  async function handleChatSubmit() {
    if (!input.trim() || chatLoading) return

    if (!userProfile?.isPremium) {
      const today = new Date().toDateString()
      const usageStr = localStorage.getItem('ai_usage_limit')
      let usage = usageStr ? JSON.parse(usageStr) : { date: today, count: 0 }
      if (usage.date !== today) usage = { date: today, count: 0 }
      if (usage.count >= 10) {
        if (confirm(isKo ? '무료 제공량(일 10회)을 모두 소진했습니다.\n무제한 분석을 위해 프리미엄으로 업그레이드하시겠습니까?' : 'You have exhausted your free daily limit (10 times).\nWould you like to upgrade to Premium for unlimited analysis?')) {
          window.location.href = '/premium'
        }
        return
      }
      localStorage.setItem('ai_usage_limit', JSON.stringify({ date: today, count: usage.count + 1 }))
      setUsageCount(usage.count + 1)
    }

    setChatLoading(true)
    setChatResult(null)
    setChatError(null)

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
      setChatResult(await res.json())
    } catch (e) {
      setChatError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setChatLoading(false)
    }
  }

  // ─── Web Share ───
  const handleShare = useCallback(async (benefitId: string, title: string) => {
    const url = `${window.location.origin}/detail/${benefitId}`
    const text = isKo ? `💡 ${title} — 혜택알리미에서 확인하세요!` : `💡 ${title} — Check on BenefitBell!`
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
  }, [isKo])

  // ─── Filtered results ───
  const filtered = hasProfile ? getFilteredBenefits(allBenefits, userProfile!, aiScores) : null

  return (
    <div className={styles.page}>
      <TopBar />
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.aiIcon}>🤖</div>
          <h1 className={styles.title}>
            {isKo ? 'AI 맞춤 혜택' : 'AI Benefits'}
          </h1>
          <p className={styles.subtitle}>
            {isKo
              ? '내 프로필로 받을 수 있는 혜택을 자동으로 찾아드립니다'
              : 'Automatically find benefits that match your profile'}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'filter' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('filter')}
          >
            🎯 {isKo ? '내 맞춤 혜택' : 'My Benefits'}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'chat' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 {isKo ? 'AI 상담' : 'AI Chat'}
          </button>
        </div>

        {/* ═══════════ Tab 1: 내 맞춤 혜택 ═══════════ */}
        {activeTab === 'filter' && (
          <>
            {!hasProfile ? (
              /* Profile CTA */
              <div className={styles.profileCta}>
                <span className={styles.profileCtaIcon}>🎯</span>
                <h2 className={styles.profileCtaTitle}>
                  {isKo ? '30초 프로필 입력으로\nAI 맞춤 혜택을 발견하세요' : 'Enter your profile in 30 seconds\nto discover matching benefits'}
                </h2>
                <p className={styles.profileCtaDesc}>
                  {isKo
                    ? '나이, 지역, 소득 등을 입력하면 수백 개 혜택 중\n내가 받을 수 있는 것만 자동으로 골라드립니다'
                    : 'Enter your age, region, income, and we\'ll\nautomatically filter matching benefits for you'}
                </p>
                <Link href="/profile" className={styles.profileCtaBtn}>
                  {isKo ? '📝 프로필 입력하기' : '📝 Enter Profile'}
                </Link>
              </div>
            ) : (
              <>
                {/* Stats Row */}
                {filtered && (
                  <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                      <p className={styles.statNumber} style={{ color: '#15803d' }}>{filtered.likely.length}</p>
                      <p className={styles.statLabel}>{isKo ? '✅ 수령 가능' : '✅ Eligible'}</p>
                    </div>
                    <div className={styles.statCard}>
                      <p className={styles.statNumber} style={{ color: '#92400e' }}>{filtered.partial.length}</p>
                      <p className={styles.statLabel}>{isKo ? '⚠️ 확인 필요' : '⚠️ Check'}</p>
                    </div>
                    <div className={styles.statCard}>
                      <p className={styles.statNumber} style={{ color: '#9ca3af' }}>{filtered.unlikely.length}</p>
                      <p className={styles.statLabel}>{isKo ? '❌ 해당 안됨' : '❌ Unlikely'}</p>
                    </div>
                  </div>
                )}

                {/* AI Progress */}
                {aiLoading && (
                  <div className={styles.aiProgress}>
                    <span style={{ fontSize: 16 }}>🤖</span>
                    <div className={styles.aiProgressBar}>
                      <div
                        className={styles.aiProgressFill}
                        style={{ width: aiProgress.total > 0 ? `${(aiProgress.done / aiProgress.total) * 100}%` : '30%' }}
                      />
                    </div>
                    <span className={styles.aiProgressText}>
                      {isKo ? 'AI 분석 중...' : 'AI analyzing...'}
                    </span>
                  </div>
                )}

                {/* ─── Likely Group ─── */}
                {filtered && filtered.likely.length > 0 && (
                  <>
                    <div className={styles.groupHeader}>
                      <span className={styles.groupIcon}>✅</span>
                      <h3 className={styles.groupTitle}>{isKo ? '수령 가능성 높음' : 'Likely Eligible'}</h3>
                      <span className={styles.groupCount}>{filtered.likely.length}</span>
                    </div>
                    <div className={styles.benefitList}>
                      {filtered.likely.map(b => <FilterCard key={b.id} benefit={b} lang={lang} />)}
                    </div>
                  </>
                )}

                {/* ─── Partial Group ─── */}
                {filtered && filtered.partial.length > 0 && (
                  <>
                    <div className={styles.groupHeader}>
                      <span className={styles.groupIcon}>⚠️</span>
                      <h3 className={styles.groupTitle}>{isKo ? '확인 필요' : 'Needs Review'}</h3>
                      <span className={styles.groupCount}>{filtered.partial.length}</span>
                    </div>
                    <div className={styles.benefitList}>
                      {filtered.partial.map(b => <FilterCard key={b.id} benefit={b} lang={lang} />)}
                    </div>
                  </>
                )}

                {/* ─── Unlikely Group (collapsed) ─── */}
                {filtered && filtered.unlikely.length > 0 && (
                  <>
                    <button className={styles.collapseToggle} onClick={() => setShowUnlikely(!showUnlikely)}>
                      {showUnlikely
                        ? (isKo ? `▲ 해당 안됨 ${filtered.unlikely.length}건 접기` : `▲ Hide ${filtered.unlikely.length} unlikely`)
                        : (isKo ? `▼ 해당 안됨 ${filtered.unlikely.length}건 보기` : `▼ Show ${filtered.unlikely.length} unlikely`)}
                    </button>
                    {showUnlikely && (
                      <div className={styles.benefitList} style={{ marginTop: 12, opacity: 0.65 }}>
                        {filtered.unlikely.map(b => <FilterCard key={b.id} benefit={b} lang={lang} />)}
                      </div>
                    )}
                  </>
                )}

                {/* Empty state */}
                {filtered && filtered.likely.length === 0 && filtered.partial.length === 0 && !aiLoading && (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      {isKo ? '현재 프로필로 매칭되는 혜택이 없습니다' : 'No matching benefits for your profile'}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
                      {isKo ? '프로필 정보를 추가하면 더 정확한 결과를 받을 수 있어요' : 'Add more profile info for better results'}
                    </p>
                    <Link href="/profile" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                      {isKo ? '프로필 수정하기' : 'Edit Profile'}
                    </Link>
                  </div>
                )}

                {/* Disclaimer */}
                {filtered && (filtered.likely.length > 0 || filtered.partial.length > 0) && (
                  <div className={styles.disclaimer} style={{ marginTop: 20 }}>
                    {isKo
                      ? '⚠️ AI 분석 결과는 참고용이며 법적 효력이 없습니다. 정확한 자격 판단은 해당 기관에 문의하세요.'
                      : '⚠️ AI results are for reference only. Contact the relevant agency for accurate eligibility.'}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ═══════════ Tab 2: AI 상담 ═══════════ */}
        {activeTab === 'chat' && (
          <>
            <div className={styles.inputSection}>
              <textarea
                className={styles.textarea}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={isKo
                  ? '예: 40대 자영업자, 코로나 이후 매출이 절반으로 줄었어요. 운전자금이 필요한데 어떤 지원이 있나요?'
                  : 'e.g. I\'m a self-employed person in my 40s. Revenue dropped by half since COVID. What support is available?'}
                rows={4}
                maxLength={500}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleChatSubmit()
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
                  onClick={handleChatSubmit}
                  disabled={!input.trim() || chatLoading}
                  id="ai-submit-btn"
                >
                  {chatLoading
                    ? (isKo ? 'AI 분석 중...' : 'AI analyzing...')
                    : (isKo ? '🔍 혜택 찾기' : '🔍 Find Benefits')}
                </button>
              </div>
            </div>

            {/* Example prompts */}
            {!chatResult && !chatLoading && (
              <div className={styles.examples}>
                <p className={styles.examplesTitle}>💡 {isKo ? '이렇게 물어보세요' : 'Try asking'}</p>
                <div className={styles.exampleList}>
                  {(isKo ? EXAMPLE_PROMPTS_KO : EXAMPLE_PROMPTS_EN).map((ex, i) => (
                    <button key={i} className={styles.exampleChip} onClick={() => setInput(ex)} id={`ai-example-${i}`}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {chatLoading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>{isKo ? 'AI가 혜택 데이터베이스를 분석하고 있어요...' : 'AI is analyzing the benefits database...'}</p>
              </div>
            )}

            {/* Error */}
            {chatError && (
              <div className={styles.errorBox}>
                <p>⚠️ {isKo ? 'AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.' : 'AI analysis failed. Please try again later.'}</p>
              </div>
            )}

            {/* Chat Results */}
            {chatResult && (
              <div className={styles.results}>
                <div className={styles.aiMessage}>
                  <span className={styles.aiAvatar}>🤖</span>
                  <div className={styles.aiMessageBubble}>
                    <p>{chatResult.message}</p>
                  </div>
                </div>

                <p className={styles.resultCount}>
                  {isKo
                    ? `${chatResult.benefitIds.length}개의 맞춤 혜택을 찾았어요`
                    : `Found ${chatResult.benefitIds.length} matching benefits`}
                </p>

                <div className={styles.benefitList}>
                  {chatResult.benefitIds.map(id => {
                    const benefit = allBenefits.find(b => b.id === id)
                    const reason = chatResult.reasons[id]
                    return (
                      <div key={id} className={styles.benefitCard}>
                        <div className={styles.cardTop}>
                          <span className="badge badge-coral-soft" style={{ fontSize: 11 }}>
                            {benefit ? bText(benefit, 'categoryLabel', lang) : '🔎'}
                          </span>
                          {benefit?.dDay !== undefined && benefit.dDay >= 0 && benefit.dDay <= 30 && (
                            <span className="badge" style={{ fontSize: 11, color: getDDayColor(benefit.dDay) }}>
                              {getDDayText(benefit.dDay, isKo ? 'ko' : 'en')}
                            </span>
                          )}
                          <button
                            style={{ marginLeft: 'auto', background: sharedId === id ? 'rgba(16,185,129,0.12)' : 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 6px', borderRadius: 8, color: sharedId === id ? '#10b981' : 'var(--text-secondary)', transition: 'all 0.2s' }}
                            onClick={() => benefit && handleShare(id, bText(benefit, 'title', lang))}
                            aria-label={isKo ? '공유하기' : 'Share'}
                          >
                            {sharedId === id ? '✅' : '📤'}
                          </button>
                        </div>
                        <Link href={`/detail/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
                          <h3 className={styles.cardTitle}>{benefit ? bText(benefit, 'title', lang) : id}</h3>
                          {benefit && <p className={styles.cardAmount}>{bText(benefit, 'amount', lang)}</p>}
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
                    : '⚠️ AI recommendations are for reference only. Contact the relevant agency for accurate eligibility.'}
                </div>

                <button className={styles.resetBtn} onClick={() => { setChatResult(null); setInput('') }}>
                  {isKo ? '다시 검색하기' : 'Search Again'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
