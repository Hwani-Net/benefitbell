'use client'
import { useState } from 'react'
import { useApp, UserProfile } from '@/lib/context'
import { addKakaoChannel } from '@/lib/kakao'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import styles from './page.module.css'

export default function ProfilePage() {
  const { t, lang, userProfile, setUserProfile } = useApp()
  const [profile, setProfile] = useState<UserProfile>(userProfile)
  const [saved, setSaved] = useState(false)
  const [isPremium] = useState(false)

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

  const handleSave = () => {
    setUserProfile(profile)
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
        <div className={styles.profileHero}>
          <div className={styles.avatar}>{profile.name.charAt(0)}</div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{profile.name}</h1>
            <p className={styles.profileSub}>
              {profile.birthYear}년생 · {lang === 'ko' ? (profile.gender === 'male' ? '남성' : '여성') : (profile.gender === 'male' ? 'Male' : 'Female')} · {profile.region}
            </p>
            {!isPremium && (
              <span className={`badge badge-coral-soft`}>{t.currentPlan}</span>
            )}
          </div>
        </div>

        {/* 개인정보 */}
        <section className="section">
          <h2 className="section-title mb-12">{t.myInfo}</h2>
          <div className={styles.formCard}>
            {/* 이름 */}
            <div className={styles.formRow}>
              <label className={styles.label}>이름</label>
              <input
                className={styles.input}
                value={profile.name}
                onChange={e => update('name', e.target.value)}
              />
            </div>

            {/* 생년 */}
            <div className={styles.formRow}>
              <label className={styles.label}>{t.birthDate}</label>
              <input
                className={styles.input}
                type="number"
                value={profile.birthYear}
                onChange={e => update('birthYear', Number(e.target.value))}
                placeholder="예) 1995"
              />
            </div>

            {/* 성별 */}
            <div className={styles.formRow}>
              <label className={styles.label}>{t.gender}</label>
              <div className={styles.toggleGroup}>
                <button
                  className={`chip ${profile.gender === 'male' ? 'active' : ''}`}
                  onClick={() => update('gender', 'male')}
                >{t.male}</button>
                <button
                  className={`chip ${profile.gender === 'female' ? 'active' : ''}`}
                  onClick={() => update('gender', 'female')}
                >{t.female}</button>
              </div>
            </div>

            {/* 거주지역 */}
            <div className={styles.formRow}>
              <label className={styles.label}>{t.region}</label>
              <input
                className={styles.input}
                value={profile.region}
                onChange={e => update('region', e.target.value)}
              />
            </div>

            {/* 가구원 수 */}
            <div className={styles.formRow}>
              <label className={styles.label}>{t.householdSize}</label>
              <div className={styles.stepper}>
                <button className={styles.stepBtn} onClick={() => update('householdSize', Math.max(1, profile.householdSize - 1))}>-</button>
                <span className={styles.stepValue}>{profile.householdSize}{lang === 'ko' ? '인' : 'P'}</span>
                <button className={styles.stepBtn} onClick={() => update('householdSize', Math.min(10, profile.householdSize + 1))}>+</button>
              </div>
            </div>

            {/* 소득분위 슬라이더 */}
            <div className={styles.formRowFull}>
              <div className={styles.sliderHeader}>
                <label className={styles.label}>{t.incomeRatio}</label>
                <span className={styles.sliderValue}>{lang === 'ko' ? `중위소득 ${profile.incomePercent}%` : `${profile.incomePercent}% Median`}</span>
              </div>
              <input
                type="range"
                className={styles.slider}
                min={10} max={200} step={10}
                value={profile.incomePercent}
                onChange={e => update('incomePercent', Number(e.target.value))}
              />
              <div className={styles.sliderLabels}>
                <span>기초수급</span><span>차상위</span><span>일반</span>
              </div>
            </div>
          </div>
        </section>

        {/* 주거형태 */}
        <section className="section">
          <h2 className="section-title mb-12">{t.housingType}</h2>
          <div className={styles.chipRow}>
            {housingOptions.map(h => (
              <button
                key={h.key}
                className={`chip ${profile.housingType === h.key ? 'active' : ''}`}
                onClick={() => update('housingType', h.key)}
              >{h.label}</button>
            ))}
          </div>
        </section>

        {/* 고용상태 */}
        <section className="section">
          <h2 className="section-title mb-12">{t.employmentStatus}</h2>
          <div className={styles.chipRow}>
            {employmentOptions.map(e => (
              <button
                key={e.key}
                className={`chip ${profile.employmentStatus === e.key ? 'active' : ''}`}
                onClick={() => update('employmentStatus', e.key as UserProfile['employmentStatus'])}
              >{e.label}</button>
            ))}
          </div>
        </section>

        {/* 특이사항 */}
        <section className="section">
          <h2 className="section-title mb-12">{t.specialStatus}</h2>
          <div className={styles.chipRow}>
            {specialOptions.map(s => (
              <button
                key={s.key}
                className={`chip ${profile.specialStatus.includes(s.key) ? 'active-purple' : ''}`}
                onClick={() => toggleSpecial(s.key)}
              >{s.label}</button>
            ))}
          </div>
        </section>

        {/* 알림 설정 */}
        <section className="section">
          <h2 className="section-title mb-12">{t.notificationSettings}</h2>
          <div className={styles.notifCard}>
            {/* 카카오 알림 */}
            <div className={styles.notifRow}>
              <div>
                <p className={styles.notifLabel}>💬 {t.kakaoNotification}</p>
                <p className={styles.notifDesc}>카카오톡으로 혜택 마감 알림을 받습니다</p>
              </div>
              <button
                className={`toggle ${profile.kakaoAlerts ? 'on' : ''}`}
                onClick={() => {
                  const next = !profile.kakaoAlerts
                  update('kakaoAlerts', next)
                  if (next) addKakaoChannel()
                }}
              />
            </div>
            {/* 알림 시점 */}
            {profile.kakaoAlerts && (
              <div className={styles.alertDays}>
                <p className={styles.notifLabel}>{t.notifyBefore}</p>
                <div className={styles.chipRow}>
                  {[14, 7, 3, 1].map(d => (
                    <button
                      key={d}
                      className={`chip ${profile.alertDays.includes(d) ? 'active-blue' : ''}`}
                      onClick={() => toggleAlertDay(d)}
                    >
                      {d === 1 ? (lang === 'ko' ? '당일' : 'Today') : `D-${d}`}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* 맞춤 추천 */}
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
                <p className={styles.premiumPrice}>₩1,900<small>{t.perMonth}</small></p>
                <button className={`btn btn-primary`} style={{ padding: '8px 16px', fontSize: 13 }}>
                  {t.subscribe}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 카카오 채널 */}
        <section className="section">
          <div className={styles.coffeeCard} style={{ background: 'linear-gradient(135deg, #FEF9C3 0%, #FEF3C7 100%)', border: '1px solid #FDE68A' }}>
            <p className={styles.coffeeTitle}>💬 카카오톡 채널 추가하기</p>
            <p className={styles.coffeeDesc}>혜택알리미 채널을 추가하면 최신 혜택 소식을 카카오톡으로 받을 수 있습니다</p>
            <button
              className={`btn btn-kakao w-full mt-12`}
              onClick={addKakaoChannel}
            >
              카카오톡 채널 추가 @hyetack-alimi
            </button>
          </div>
        </section>

        {/* 커피 후원 */}
        <section className="section">
          <div className={styles.coffeeCard}>
            <p className={styles.coffeeTitle}>{t.coffeeSupport}</p>
            <p className={styles.coffeeDesc}>{t.supportDesc}</p>
            <button className={`btn btn-outline w-full mt-12`} style={{ borderColor: '#F97316', color: '#F97316' }}>
              ☕ 커피 한 잔 선물하기
            </button>
          </div>
        </section>

        {/* 저장 버튼 */}
        <div style={{ padding: '0 16px 20px' }}>
          <button className={`btn btn-primary btn-full btn-lg`} onClick={handleSave}>
            {saved ? `✅ ${t.saved}` : t.saveSettings}
          </button>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
