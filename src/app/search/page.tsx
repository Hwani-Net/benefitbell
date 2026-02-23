'use client'
import { useState, useEffect, Suspense, useCallback } from 'react'
import { useApp } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText, CATEGORY_INFO } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import styles from './page.module.css'

type SortType = 'popular' | 'deadline' | 'new'

const SearchFieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

function SearchContent() {
  const { t, lang, toggleBookmark, isBookmarked } = useApp()
  const searchParams = useSearchParams()
  const router = useRouter()

  // URL 쿼리 파라미터로 상태 관리 → 조건 선택 시 router.push() → 뒤로가기 시 /search 초기화면 복귀
  const query = searchParams.get('q') ?? ''
  const catKey = searchParams.get('cat') ?? ''
  const sort = (searchParams.get('sort') as SortType) ?? 'popular'

  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState(query)

  const recentSearches = ['기초연금 신청', '서울시 청년지원', '차상위 의료비']
  const recommendedTags = ['#청년월세', '#기초수급', '#K패스', '#부모급여', '#도약계좌']
  const categories = Object.entries(CATEGORY_INFO)

  // URL 파라미터 변경 시 inputValue 동기화
  useEffect(() => {
    setInputValue(query)
  }, [query])

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/benefits')
        if (!res.ok) throw new Error('API return not ok')
        const json = await res.json()
        setBenefits(json.data)
      } catch (err) {
        console.error('Failed to load search benefits', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 검색어 선택 → URL push
  const applyQuery = useCallback((q: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sort !== 'popular') params.set('sort', sort)
    router.push(`/search${params.toString() ? '?' + params.toString() : ''}`)
  }, [router, sort])

  // 카테고리 키 선택 → URL push (?cat=basic-living)
  const applyCategory = useCallback((key: string) => {
    const params = new URLSearchParams()
    if (key) params.set('cat', key)
    if (sort !== 'popular') params.set('sort', sort)
    router.push(`/search?${params.toString()}`)
  }, [router, sort])

  // 정렬 변경 → replace (히스토리 불필요)
  const applySort = useCallback((s: SortType) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (catKey) params.set('cat', catKey)
    if (s !== 'popular') params.set('sort', s)
    router.replace(`/search?${params.toString()}`)
  }, [router, query, catKey])

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applyQuery(inputValue)
  }

  const filtered = benefits.filter(b => {
    const matchesQuery = query === '' ||
      b.title.includes(query) ||
      b.titleEn.toLowerCase().includes(query.toLowerCase()) ||
      b.categoryLabel.includes(query)
    const matchesCat = catKey === '' || b.category === catKey
    return matchesQuery && matchesCat
  }).sort((a, b) => {
    if (sort === 'deadline') return a.dDay - b.dDay
    if (sort === 'new') return (b.new ? 1 : 0) - (a.new ? 1 : 0)
    return (b.popular ? 1 : 0) - (a.popular ? 1 : 0)
  })

  return (
    <>
      <TopBar />
      <main className="page-content">
        {/* 검색바 */}
        <div className={styles.searchSection}>
          <div className={styles.searchBar}>
            <SearchFieldIcon />
            <input
              className={styles.searchInput}
              placeholder={t.searchPlaceholder}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleInputSubmit}
              onBlur={() => { if (inputValue !== query) applyQuery(inputValue) }}
            />
            {inputValue && (
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: 'var(--text-tertiary)' }}
                onClick={() => { setInputValue(''); applyQuery('') }}
                aria-label="검색어 지우기"
              >✕</button>
            )}
          </div>
        </div>

        {query === '' && catKey === '' ? (
          <>
            {/* 카테고리 그리드 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.searchByCategory}</h2>
              <div className={styles.catGrid}>
                {categories.map(([key, cat]) => (
                  <button key={key} className={styles.catItem} onClick={() => applyCategory(key)}>
                    <span className={styles.catEmoji}>{cat.icon}</span>
                    <span className={styles.catLabel}>{lang === 'ko' ? cat.label : cat.labelEn}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 추천 태그 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.recommendedTags}</h2>
              <div className={styles.tagRow}>
                {recommendedTags.map(tag => (
                  <button key={tag} className={styles.tag} onClick={() => applyQuery(tag.replace('#', ''))}>
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            {/* 최근 검색어 */}
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">{t.recentSearches}</h2>
                <button className="section-link">{t.clearAll}</button>
              </div>
              <ul className={styles.recentList}>
                {recentSearches.map(s => (
                  <li key={s} className={styles.recentItem} onClick={() => applyQuery(s)}>
                    <span className={styles.recentIcon}>🕐</span>
                    <span className={styles.recentText}>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <>
            {/* 카테고리 필터 헤더 (catKey 선택 시) */}
            {catKey && CATEGORY_INFO[catKey as keyof typeof CATEGORY_INFO] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 4px' }}>
                <span style={{ fontSize: 20 }}>{CATEGORY_INFO[catKey as keyof typeof CATEGORY_INFO].icon}</span>
                <strong style={{ fontSize: 15, color: 'var(--text-primary)' }}>
                  {lang === 'ko'
                    ? CATEGORY_INFO[catKey as keyof typeof CATEGORY_INFO].label
                    : CATEGORY_INFO[catKey as keyof typeof CATEGORY_INFO].labelEn}
                </strong>
                <button
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-tertiary)' }}
                  onClick={() => router.push('/search')}
                  aria-label="카테고리 필터 초기화"
                >✕</button>
              </div>
            )}
            {/* 정렬 필터 탭 */}
            <div className={`scroll-x ${styles.sortRow}`} style={{ padding: '0 16px 12px' }}>
              {[
                { key: 'popular', label: t.sortByPopular },
                { key: 'deadline', label: t.sortByDeadline },
                { key: 'new', label: t.sortByNew },
              ].map(s => (
                <button
                  key={s.key}
                  className={`chip ${sort === s.key ? 'active' : ''}`}
                  onClick={() => applySort(s.key as SortType)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* 결과 리스트 */}
            <section className="section">
              {loading ? (
                <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>불러오는 중...</p>
              ) : (
                <>
                  <p className={styles.resultCount}>{filtered.length}건</p>
                  <div className={styles.resultList}>
                    {filtered.map(b => (
                      <Link key={b.id} href={`/detail/${b.id}`} className={`${styles.resultItem} animate-fade-in`}>
                        <div className={styles.resultLeft}>
                          <div className={styles.resultMeta}>
                            <span className="badge badge-coral-soft">{lang === 'ko' ? b.categoryLabel : b.categoryLabelEn}</span>
                            {b.dDay >= 0 && b.dDay <= 14 && (
                              <span className={`badge ${getDDayColor(b.dDay)}`}>{getDDayText(b.dDay, lang === 'ko' ? 'ko' : 'en')}</span>
                            )}
                            {b.new && <span className="badge badge-coral text-xs">{t.newBadge}</span>}
                          </div>
                          <h3 className={styles.resultTitle}>{lang === 'ko' ? b.title : b.titleEn}</h3>
                          <p className={styles.resultAmount}>{lang === 'ko' ? b.amount : b.amountEn}</p>
                          <p className={styles.resultPeriod}>📅 {b.applicationStart} ~ {b.applicationEnd}</p>
                        </div>
                        <button
                          className={styles.resultBookmark}
                          onClick={e => { e.preventDefault(); toggleBookmark(b.id) }}
                        >
                          {isBookmarked(b.id) ? '❤️' : '🤍'}
                        </button>
                      </Link>
                    ))}
                    {filtered.length === 0 && (
                      <div className={styles.emptyState}>
                        <span style={{ fontSize: 40 }}>🔍</span>
                        <p>검색 결과가 없습니다</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px 20px', textAlign: 'center' }}>데이터를 불러오는 중입니다...</div>}>
      <SearchContent />
    </Suspense>
  )
}
