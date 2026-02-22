'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { BENEFITS, getDDayColor, getDDayText, CATEGORY_INFO } from '@/data/benefits'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import styles from './page.module.css'

type SortType = 'popular' | 'deadline' | 'new'
type PersonaType = 'all' | 'youth' | 'middle' | 'senior'

const SearchFieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

export default function SearchPage() {
  const { t, lang, toggleBookmark, isBookmarked } = useApp()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortType>('popular')
  const [persona, setPersona] = useState<PersonaType>('all')
  const [recentSearches] = useState(['기초연금 신청', '서울시 청년지원', '차상위 의료비'])
  const recommendedTags = ['#청년월세', '#기초수급', '#K패스', '#부모급여', '#도약계좌']

  const categories = Object.entries(CATEGORY_INFO).slice(0, 8)

  const filtered = BENEFITS.filter(b => {
    const matchQuery = query === '' ||
      b.title.includes(query) ||
      b.titleEn.toLowerCase().includes(query.toLowerCase()) ||
      b.categoryLabel.includes(query)

    const matchPersona =
      persona === 'all' ? true :
      persona === 'youth' ? b.category === 'youth' :
      persona === 'middle' ? b.category === 'middle-aged' || b.category === 'employment' :
      persona === 'senior' ? b.category === 'senior' : true

    return matchQuery && matchPersona
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
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        {query === '' ? (
          <>
            {/* 페르소나 선택 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.whoForBenefit}</h2>
              <div className={styles.personaRow}>
                {[
                  { key: 'all', emoji: '🙋', label: t.allCategories },
                  { key: 'youth', emoji: '🧑', label: t.youngAdult },
                  { key: 'middle', emoji: '🧑‍💼', label: t.middleAge },
                  { key: 'senior', emoji: '👴', label: t.olderAdult },
                ].map(p => (
                  <button
                    key={p.key}
                    className={`${styles.personaBtn} ${persona === p.key ? styles.personaActive : ''}`}
                    onClick={() => setPersona(p.key as PersonaType)}
                  >
                    <span className={styles.personaEmoji}>{p.emoji}</span>
                    <span className={styles.personaLabel}>{p.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 카테고리 그리드 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.searchByCategory}</h2>
              <div className={styles.catGrid}>
                {categories.map(([key, cat]) => (
                  <button key={key} className={styles.catItem} onClick={() => setQuery(cat.label)}>
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
                  <button key={tag} className={styles.tag} onClick={() => setQuery(tag.replace('#', ''))}>
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
                  <li key={s} className={styles.recentItem} onClick={() => setQuery(s)}>
                    <span className={styles.recentIcon}>🕐</span>
                    <span className={styles.recentText}>{s}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <>
            {/* 필터 탭 */}
            <div className={`scroll-x ${styles.sortRow}`} style={{ padding: '0 16px 12px' }}>
              {[
                { key: 'popular', label: t.sortByPopular },
                { key: 'deadline', label: t.sortByDeadline },
                { key: 'new', label: t.sortByNew },
              ].map(s => (
                <button
                  key={s.key}
                  className={`chip ${sort === s.key ? 'active' : ''}`}
                  onClick={() => setSort(s.key as SortType)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* 결과 리스트 */}
            <section className="section">
              <p className={styles.resultCount}>{filtered.length}건</p>
              <div className={styles.resultList}>
                {filtered.map((b, i) => (
                  <Link key={b.id} href={`/detail/${b.id}`} className={`${styles.resultItem} animate-fade-in`}>
                    <div className={styles.resultLeft}>
                      <div className={styles.resultMeta}>
                        <span className={`badge badge-coral-soft`}>{lang === 'ko' ? b.categoryLabel : b.categoryLabelEn}</span>
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
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </>
  )
}
