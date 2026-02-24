'use client'
import { useState, useEffect, useCallback } from 'react'
import { useApp, UserProfile } from '@/lib/context'
import { Benefit, getDDayColor, getDDayText } from '@/data/benefits'
import { KAKAO_CHANNEL_ID } from '@/lib/kakao'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import PushToggle from '@/components/pwa/PushToggle'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import styles from './page.module.css'

// ─── 한국 행정구역 데이터 ───
const REGIONS: Record<string, string[]> = {
  '서울특별시': ['강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구','노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구','성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구'],
  '부산광역시': ['강서구','금정구','기장군','남구','동구','동래구','부산진구','북구','사상구','사하구','서구','수영구','연제구','영도구','중구','해운대구'],
  '대구광역시': ['군위군','남구','달서구','달성군','동구','북구','서구','수성구','중구'],
  '인천광역시': ['강화군','계양구','남동구','동구','미추홀구','부평구','서구','연수구','옹진군','중구'],
  '광주광역시': ['광산구','남구','동구','북구','서구'],
  '대전광역시': ['대덕구','동구','서구','유성구','중구'],
  '울산광역시': ['남구','동구','북구','울주군','중구'],
  '세종특별자치시': ['세종시'],
  '경기도': ['가평군','고양시','과천시','광명시','광주시','구리시','군포시','김포시','남양주시','동두천시','부천시','성남시','수원시','시흥시','안산시','안성시','안양시','양주시','양평군','여주시','연천군','오산시','용인시','의왕시','의정부시','이천시','파주시','평택시','포천시','하남시','화성시'],
  '강원도': ['강릉시','고성군','동해시','삼척시','속초시','양구군','양양군','영월군','원주시','인제군','정선군','철원군','춘천시','태백시','평창군','홍천군','화천군','횡성군'],
  '충청북도': ['괴산군','단양군','보은군','영동군','옥천군','음성군','제천시','증평군','진천군','청주시','충주시'],
  '충청남도': ['계룡시','공주시','금산군','논산시','당진시','보령시','부여군','서산시','서천군','아산시','예산군','천안시','청양군','태안군','홍성군'],
  '전라북도': ['고창군','군산시','김제시','남원시','무주군','부안군','순창군','완주군','익산시','임실군','장수군','전주시','정읍시','진안군'],
  '전라남도': ['강진군','고흥군','곡성군','광양시','구례군','나주시','담양군','목포시','무안군','보성군','순천시','신안군','여수시','영광군','영암군','완도군','장성군','장흥군','진도군','함평군','해남군','화순군'],
  '경상북도': ['경산시','경주시','고령군','구미시','군위군','김천시','문경시','봉화군','상주시','성주군','안동시','영덕군','영양군','영주시','영천시','예천군','울릉군','울진군','의성군','청도군','청송군','칠곡군','포항시'],
  '경상남도': ['거제시','거창군','고성군','김해시','남해군','밀양시','사천시','산청군','양산시','의령군','진주시','창녕군','창원시','통영시','하동군','함안군','함양군','합천군'],
  '제주특별자치도': ['서귀포시','제주시'],
}

function parseRegion(region: string) {
  const parts = region.trim().split(' ')
  return { sido: parts[0] || '', sigungu: parts.slice(1).join(' ') || '' }
}

export default function ProfilePage() {
  const { t, lang, userProfile, setUserProfile, kakaoUser, bookmarks, toggleBookmark, isBookmarked } = useApp()
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'settings'>('bookmarks')
  const [profile, setProfile] = useState<UserProfile>(userProfile)
  
  // AppContext의 userProfile이 로컬스토리지에서 늦게 불러와진 경우(hydration) 로컬 profile 상태 동기화
  useEffect(() => {
    setProfile(userProfile)
  }, [userProfile])

  const [saved, setSaved] = useState(false)
  const isPremium = userProfile?.isPremium || false
  const [isKakaoLinked, setIsKakaoLinked] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('push_categories') || '[]') } catch(e){}
    }
    return []
  })
  const [categorySaving, setCategorySaving] = useState(false)

  // ─── 북마크 혜택 데이터 ───
  const [allBenefits, setAllBenefits] = useState<Benefit[]>([])
  const [benefitsLoading, setBenefitsLoading] = useState(true)
  const [sharedId, setSharedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/benefits')
      .then(r => r.json())
      .then(json => { if (json.data) setAllBenefits(json.data) })
      .catch(e => console.warn('bookmark benefit preload failed:', e))
      .finally(() => setBenefitsLoading(false))
  }, [])

  const savedBenefits = allBenefits.filter(b => isBookmarked(b.id))

  // Web Share API
  const handleShare = useCallback(async (benefitId: string, title: string) => {
    const url = `${window.location.origin}/detail/${benefitId}`
    const text = lang === 'ko'
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
  }, [lang])

  const CATEGORY_CHIPS = [
    { key: 'youth',           label: '청년' },
    { key: 'small-biz',       label: '소상공인' },
    { key: 'startup',         label: '창업' },
    { key: 'closure-restart', label: '폐업·재창업' },
    { key: 'debt-relief',     label: '채무조정' },
    { key: 'employment',      label: '취업' },
    { key: 'housing',         label: '주거' },
    { key: 'medical',         label: '의료' },
    { key: 'education',       label: '교육' },
    { key: 'basic-living',    label: '기초생활' },
    { key: 'senior',          label: '노인' },
  ]

  const toggleCategory = (key: string) => {
    setSelectedCategories(prev =>
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    )
  }

  const parsedRegion = parseRegion(profile.region || '')
  const [selectedSido, setSelectedSido] = useState(parsedRegion.sido || Object.keys(REGIONS)[0])
  const [selectedSigungu, setSelectedSigungu] = useState(parsedRegion.sigungu || '')

  useEffect(() => {
    const parsed = parseRegion(profile.region || '')
    setSelectedSido(parsed.sido || Object.keys(REGIONS)[0])
    setSelectedSigungu(parsed.sigungu || '')
  }, [profile.region])

  const handleSidoChange = (sido: string) => {
    setSelectedSido(sido)
    const firstSigungu = REGIONS[sido]?.[0] || ''
    setSelectedSigungu(firstSigungu)
    update('region', `${sido} ${firstSigungu}`.trim())
  }

  const handleSigunguChange = (sigungu: string) => {
    setSelectedSigungu(sigungu)
    update('region', `${selectedSido} ${sigungu}`.trim())
  }

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '')
      return null
    }
    const kakaoProfile = getCookie('kakao_profile')
    if (kakaoProfile) {
      try {
        const data = JSON.parse(kakaoProfile)
        if (data.name && !isKakaoLinked) {
          setProfile(prev => ({ ...prev, name: data.name }))
          setIsKakaoLinked(true)
          setUserProfile({ ...userProfile, name: data.name })
        }
      } catch (e) {
        console.error('Failed to parse kakao profile cookie', e)
      }
    }
  }, [isKakaoLinked, userProfile, setUserProfile])

  const update = (key: keyof UserProfile, value: unknown) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  const toggleSpecial = (key: string) => {
    const arr = profile.specialStatus
    const next = arr.includes(key) ? arr.filter(s => s !== key) : [...arr, key]
    update('specialStatus', next)
  }

  const toggleAlertDay = (day: number) => {
    const arr = profile.alertDays
    const next = arr.includes(day) ? arr.filter(d => d !== day) : [...arr, day]
    update('alertDays', next)
  }

  const handleSave = async () => {
    setUserProfile(profile)
    localStorage.setItem('push_categories', JSON.stringify(selectedCategories))

    if (kakaoUser?.id) {
      try {
        await supabase.from('user_profiles').upsert({
          kakao_id: String(kakaoUser.id),
          nickname: kakaoUser.nickname,
          categories: selectedCategories,
          age_group: profile.birthYear
            ? (new Date().getFullYear() - profile.birthYear < 35 ? 'youth'
              : new Date().getFullYear() - profile.birthYear < 60 ? 'middle-aged'
              : 'senior')
            : undefined,
          region: profile.region,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'kakao_id' })
      } catch (e) {
        console.warn('user_profiles sync failed:', e)
      }
    }

    try {
      setCategorySaving(true)
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: sub.toJSON(),
            categories: selectedCategories,
            age_group: profile.birthYear
              ? (new Date().getFullYear() - profile.birthYear < 35 ? 'youth'
                : new Date().getFullYear() - profile.birthYear < 60 ? 'middle-aged'
                : 'senior')
              : undefined,
            region: profile.region,
          }),
        })
      }
    } catch (e) {
      console.warn('push subscription update failed:', e)
    } finally {
      setCategorySaving(false)
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const housingOptions = [
    { key: 'monthly', label: t.monthly },
    { key: 'deposit', label: t.deposit },
    { key: 'owned', label: t.owned },
  ]

  const employmentOptions = [
    { key: 'jobSeeking', label: t.jobSeeking },
    { key: 'employed', label: t.employed },
    { key: 'selfEmployed', label: t.selfEmployed },
    { key: 'student', label: t.student },
  ]

  const specialOptions = [
    { key: 'disability', label: t.disability },
    { key: 'singleParent', label: t.singleParent },
    { key: 'multicultural', label: t.multicultural },
    { key: 'veteran', label: t.veteran },
  ]

  return (
    <>
      <TopBar />
      <main className="page-content">
        {/* 프로필 헤더 */}
        {kakaoUser ? (
          <div className={styles.profileHero}>
            {kakaoUser.profile_image
              ? <img src={kakaoUser.profile_image} alt="프로필" className={styles.avatarImg} />
              : <div className={styles.avatar}>{kakaoUser.nickname.charAt(0)}</div>
            }
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName}>{kakaoUser.nickname}</h1>
              <p className={styles.profileSub}>
                {profile.birthYear}년생 · {lang === 'ko' ? (profile.gender === 'male' ? '남성' : '여성') : (profile.gender === 'male' ? 'Male' : 'Female')} · {profile.region}
              </p>
              {!isPremium && (
                <span className={`badge badge-coral-soft`}>{t.currentPlan}</span>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.profileHero}>
            <div className={styles.avatarGuest}>👤</div>
            <div className={styles.profileInfo}>
              <h1 className={styles.profileName} style={{ fontSize: 16 }}>로그인이 필요합니다</h1>
              <p className={styles.profileSub}>카카오로 로그인하면 맞춤 혜택을 받아볼 수 있어요</p>
            </div>
          </div>
        )}

        {/* ─── 탭 네비게이션 ─── */}
        <div className={styles.tabNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'bookmarks' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('bookmarks')}
          >
            ❤️ {lang === 'ko' ? `저장한 혜택 ${bookmarks.length > 0 ? `(${bookmarks.length})` : ''}` : `Saved ${bookmarks.length > 0 ? `(${bookmarks.length})` : ''}`}
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ {lang === 'ko' ? '설정' : 'Settings'}
          </button>
        </div>

        {/* ─── 탭 콘텐츠: 저장한 혜택 ─── */}
        {activeTab === 'bookmarks' && (
          <div style={{ padding: '0 0 24px' }}>
            {benefitsLoading ? (
              <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <p>{lang === 'ko' ? '혜택 정보를 불러오는 중...' : 'Loading benefits...'}</p>
              </div>
            ) : savedBenefits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 16px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤍</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {lang === 'ko' ? '저장한 혜택이 없어요' : 'No saved benefits yet'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                  {lang === 'ko' ? '마음에 드는 혜택에 ❤️를 눌러 저장하세요' : 'Tap ❤️ on any benefit to save it here'}
                </p>
                <Link
                  href="/search"
                  className="btn btn-primary"
                  style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 28px' }}
                >
                  {lang === 'ko' ? '혜택 둘러보기 →' : 'Browse Benefits →'}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {savedBenefits.map(b => (
                  <div key={b.id} className={styles.bookmarkItem}>
                    <Link href={`/detail/${b.id}`} className={styles.bookmarkContent}>
                      <div className={styles.bookmarkMeta}>
                        <span className="badge badge-coral-soft" style={{ fontSize: 11 }}>
                          {lang === 'ko' ? b.categoryLabel : b.categoryLabelEn}
                        </span>
                        {b.dDay >= 0 && b.dDay <= 14 && (
                          <span className="badge" style={{ fontSize: 11, color: getDDayColor(b.dDay) }}>
                            {getDDayText(b.dDay, lang === 'ko' ? 'ko' : 'en')}
                          </span>
                        )}
                      </div>
                      <h3 className={styles.bookmarkTitle}>{lang === 'ko' ? b.title : b.titleEn}</h3>
                      <p className={styles.bookmarkAmount}>{lang === 'ko' ? b.amount : b.amountEn}</p>
                    </Link>
                    <div className={styles.bookmarkActions}>
                      <button
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                          color: sharedId === b.id ? '#10b981' : 'var(--text-tertiary)',
                          padding: '4px', transition: 'color 0.2s',
                        }}
                        onClick={() => handleShare(b.id, lang === 'ko' ? b.title : b.titleEn)}
                        aria-label={lang === 'ko' ? '공유' : 'Share'}
                      >
                        {sharedId === b.id ? '✅' : '📤'}
                      </button>
                      <button
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', fontSize: 20,
                          color: '#ef4444', padding: '4px',
                        }}
                        onClick={() => toggleBookmark(b.id)}
                        aria-label={lang === 'ko' ? '저장 취소' : 'Remove'}
                      >
                        ❤️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── 탭 콘텐츠: 설정 ─── */}
        {activeTab === 'settings' && (
          <>
            {/* SNS 연동 */}
            <section className="section">
              <h2 className="section-title mb-12">소셜 계정 연결</h2>
              {isKakaoLinked ? (
                <div className={styles.coffeeCard} style={{ background: '#FEE500', color: '#000000', border: 'none' }}>
                  <p className={styles.coffeeTitle}>✅ 카카오 계정 연동 완료</p>
                  <p className={styles.coffeeDesc} style={{ color: '#333333' }}>카카오 계정으로 안전하게 연결되었습니다.</p>
                </div>
              ) : (
                <div className={styles.coffeeCard}>
                  <p className={styles.coffeeTitle}>🔐 카카오 간편 로그인</p>
                  <p className={styles.coffeeDesc}>로그인하고 내 프로필 정보와 저장한 혜택을 기기 간 연동하세요.</p>
                  <a href="/api/auth/kakao" className="btn btn-kakao w-full mt-12" style={{ textDecoration: 'none', display: 'block', textAlign: 'center', lineHeight: '24px' }}>
                    1초 만에 카카오로 시작하기
                  </a>
                </div>
              )}
            </section>

            {/* 개인정보 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.myInfo}</h2>
              <div className={styles.formCard}>
                <div className={styles.formRow}>
                  <label className={styles.label}>이름</label>
                  <input className={styles.input} value={profile.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div className={styles.formRowFull}>
                  <label className={styles.label}>{t.birthDate}</label>
                  <select className={styles.selectField} value={profile.birthYear} onChange={e => update('birthYear', Number(e.target.value))}>
                    {Array.from({ length: new Date().getFullYear() - 1924 }, (_, i) => {
                      const year = new Date().getFullYear() - i
                      return <option key={year} value={year}>{year}년</option>
                    })}
                  </select>
                </div>
                <div className={styles.formRow}>
                  <label className={styles.label}>{t.gender}</label>
                  <div className={styles.toggleGroup}>
                    <button className={`chip ${profile.gender === 'male' ? 'active' : ''}`} onClick={() => update('gender', 'male')}>{t.male}</button>
                    <button className={`chip ${profile.gender === 'female' ? 'active' : ''}`} onClick={() => update('gender', 'female')}>{t.female}</button>
                  </div>
                </div>
                <div className={styles.formRowFull}>
                  <label className={styles.label}>{t.region}</label>
                  <div className={styles.selectRow}>
                    <select className={styles.selectField} value={selectedSido} onChange={e => handleSidoChange(e.target.value)}>
                      {Object.keys(REGIONS).map(sido => <option key={sido} value={sido}>{sido}</option>)}
                    </select>
                    <select className={styles.selectField} value={selectedSigungu} onChange={e => handleSigunguChange(e.target.value)}>
                      {(REGIONS[selectedSido] || []).map(sg => <option key={sg} value={sg}>{sg}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <label className={styles.label}>{t.householdSize}</label>
                  <div className={styles.stepper}>
                    <button className={styles.stepBtn} onClick={() => update('householdSize', Math.max(1, profile.householdSize - 1))}>-</button>
                    <span className={styles.stepValue}>{profile.householdSize}{lang === 'ko' ? '인' : 'P'}</span>
                    <button className={styles.stepBtn} onClick={() => update('householdSize', Math.min(10, profile.householdSize + 1))}>+</button>
                  </div>
                </div>
                <div className={styles.formRowFull}>
                  <div className={styles.sliderHeader}>
                    <label className={styles.label}>{t.incomeRatio}</label>
                    <span className={styles.sliderValue}>{lang === 'ko' ? `중위소득 ${profile.incomePercent}%` : `${profile.incomePercent}% Median`}</span>
                  </div>
                  <input type="range" className={styles.slider} min={10} max={200} step={10} value={profile.incomePercent} onChange={e => update('incomePercent', Number(e.target.value))} />
                  <div className={styles.sliderLabels}><span>기초수급</span><span>차상위</span><span>일반</span></div>
                </div>
              </div>
            </section>

            {/* 관심 혜택 카테고리 */}
            <section className="section">
              <h2 className="section-title mb-12">📢 알림 받을 혜택 분야</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                선택한 분야의 혜택이 오픈/마감 임박 시 푸시 알림을 보냅니다. (중복 선택 가능)
              </p>
              <div className={styles.chipGrid}>
                {CATEGORY_CHIPS.map(({ key, label }) => (
                  <button key={key} className={`chip ${selectedCategories.includes(key) ? 'active' : ''}`} onClick={() => toggleCategory(key)}>
                    {selectedCategories.includes(key) ? '✓ ' : ''}{label}
                  </button>
                ))}
              </div>
            </section>

            {/* 주거형태 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.housingType}</h2>
              <div className={styles.chipRow}>
                {housingOptions.map(h => (
                  <button key={h.key} className={`chip ${profile.housingType === h.key ? 'active' : ''}`} onClick={() => update('housingType', h.key)}>{h.label}</button>
                ))}
              </div>
            </section>

            {/* 고용상태 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.employmentStatus}</h2>
              <div className={styles.chipRow}>
                {employmentOptions.map(e => (
                  <button key={e.key} className={`chip ${profile.employmentStatus === e.key ? 'active' : ''}`} onClick={() => update('employmentStatus', e.key as UserProfile['employmentStatus'])}>{e.label}</button>
                ))}
              </div>
            </section>

            {/* 특이사항 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.specialStatus}</h2>
              <div className={styles.chipRow}>
                {specialOptions.map(s => (
                  <button key={s.key} className={`chip ${profile.specialStatus.includes(s.key) ? 'active-purple' : ''}`} onClick={() => toggleSpecial(s.key)}>{s.label}</button>
                ))}
              </div>
            </section>

            {/* 알림 설정 */}
            <section className="section">
              <h2 className="section-title mb-12">{t.notificationSettings}</h2>
              <div className={styles.notifCard}>
                <PushToggle />
                <div className={styles.divider} />
                <div className={styles.notifRow}>
                  <div>
                    <p className={styles.notifLabel}>💬 {t.kakaoNotification}</p>
                    <p className={styles.notifDesc}>카카오톡으로 혜택 마감 알림을 받습니다</p>
                  </div>
                  <button className={`toggle ${profile.kakaoAlerts ? 'on' : ''}`} onClick={() => update('kakaoAlerts', !profile.kakaoAlerts)} />
                </div>
                {profile.kakaoAlerts && (
                  <div className={styles.alertDays}>
                    <p className={styles.notifLabel}>{t.notifyBefore}</p>
                    <div className={styles.chipRow}>
                      {[14, 7, 3, 1].map(d => (
                        <button key={d} className={`chip ${profile.alertDays.includes(d) ? 'active-blue' : ''}`} onClick={() => toggleAlertDay(d)}>
                          {d === 1 ? (lang === 'ko' ? '당일' : 'Today') : `D-${d}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className={styles.notifRow}>
                  <div>
                    <p className={styles.notifLabel}>⭐ {t.personalizedRec}</p>
                    <p className={styles.notifDesc}>프로필 기반 맞춤 혜택을 추천받습니다</p>
                  </div>
                  <div className="toggle on" />
                </div>
              </div>
            </section>

            {/* 프리미엄 배너 */}
            {!isPremium && (
              <section className="section">
                <div className={styles.premiumBanner}>
                  <div className={styles.premiumLeft}>
                    <span className="badge badge-purple-soft">{t.premium}</span>
                    <p className={styles.premiumTitle}>{t.premiumFeatures}</p>
                  </div>
                  <div className={styles.premiumRight}>
                    <p className={styles.premiumPrice}>₩4,900<small>{t.perMonth}</small></p>
                    <a href="/premium" className={`btn btn-primary`} style={{ padding: '8px 16px', fontSize: 13, display: 'inline-block', textDecoration: 'none' }}>
                      기능 알아보기
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* 카카오 채널 */}
            <section className="section">
              <div className={styles.coffeeCard} style={{ background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF3C7 100%)', border: '1px solid #FDE68A' }}>
                <p className={styles.coffeeTitle}>💬 카카오톡 채널 추가하기</p>
                <p className={styles.coffeeDesc}>혜택알리미 채널을 추가하면 최신 혜택 소식을 카카오톡으로 받을 수 있습니다</p>
                <a href={`https://pf.kakao.com/${KAKAO_CHANNEL_ID}/friend`} target="_blank" rel="noopener noreferrer" className={`btn btn-kakao w-full mt-12`} style={{ textDecoration: 'none', display: 'block', textAlign: 'center', lineHeight: '24px' }}>
                  카카오톡 채널 추가 @hyetack-alimi
                </a>
              </div>
            </section>

            {/* 커피 후원 */}
            <section className="section">
              <div className={styles.coffeeCard}>
                <p className={styles.coffeeTitle}>{t.coffeeSupport}</p>
                <p className={styles.coffeeDesc}>{t.supportDesc}</p>
                {process.env.NEXT_PUBLIC_KAKAOPAY_LINK && (
                  <a href={process.env.NEXT_PUBLIC_KAKAOPAY_LINK} target="_blank" rel="noopener noreferrer" className={`btn w-full mt-12`} style={{ background: '#FFE812', color: '#000', textDecoration: 'none', display: 'block', textAlign: 'center', lineHeight: '24px', fontWeight: 700, borderRadius: 12 }}>
                    💳 카카오페이로 후원하기
                  </a>
                )}
                <a href="https://www.buymeacoffee.com/stayicond" target="_blank" rel="noopener noreferrer" className={`btn btn-outline w-full mt-12`} style={{ borderColor: '#F97316', color: '#F97316', textDecoration: 'none', display: 'block', textAlign: 'center', lineHeight: '24px', fontWeight: 700, borderRadius: 12, padding: '12px 0' }}>
                  ☕ Buy Me a Coffee
                </a>
              </div>
            </section>

            {/* 저장 버튼 */}
            <div style={{ padding: '0 16px 20px' }}>
              <button className={`btn btn-primary btn-full btn-lg`} onClick={handleSave}>
                {saved ? `✅ ${t.saved}` : t.saveSettings}
              </button>
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </>
  )
}
