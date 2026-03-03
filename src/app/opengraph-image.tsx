import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '혜택알리미 - 나에게 맞는 정부 지원금·복지 혜택, 한눈에'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a0533 0%, #0f1b3c 60%, #0a1628 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: -150, left: -100,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, zIndex: 1, padding: '0 80px' }}>
          {/* Bell icon + app name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B4A, #FF8C42)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 54, boxShadow: '0 0 40px rgba(255,107,74,0.5)',
            }}>
              🔔
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 56, fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>혜택알리미</span>
              <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>BenefitBell</span>
            </div>
          </div>

          {/* Tagline */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#FF6B4A' }}>나에게 맞는 정부 지원금</span>
            <span style={{ fontSize: 36, fontWeight: 700, color: '#ffffff' }}>복지 혜택, 한눈에 확인하세요</span>
          </div>

          {/* Feature badges */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {['🤖 AI 맞춤 분석', '📢 마감 알림', '🔎 108건+ 검색', '🆓 무료 이용'].map((badge) => (
              <div
                key={badge}
                style={{
                  padding: '10px 22px',
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: 99,
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: 18,
                  fontWeight: 600,
                  display: 'flex',
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: 32, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 80px',
        }}>
          <div style={{ display: 'flex', gap: 32 }}>
            {['🏠 기초생활', '🌱 청년', '👴 노인', '🏥 의료', '💼 취업'].map((cat) => (
              <span key={cat} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, display: 'flex' }}>{cat}</span>
            ))}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, display: 'flex' }}>benefitbell.kr</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
