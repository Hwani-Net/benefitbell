'use client'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function TermsPage() {
  return (
    <>
      <TopBar />
      <main className="page-content" style={{ padding: '20px 16px 100px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)' }}>
          📋 이용약관
        </h1>

        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제1조 (목적)</h2>
            <p>
              이 약관은 혜택알리미(BenefitBell, 이하 &quot;서비스&quot;)가 제공하는 정부 복지 혜택 안내 서비스의 이용과 관련하여,
              회사와 이용자 간의 권리, 의무 및 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제2조 (서비스 내용)</h2>
            <p>서비스가 제공하는 기능은 다음과 같습니다:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>공공데이터포털(data.go.kr) 기반 정부 복지 혜택 조회</li>
              <li>AI 기반 맞춤 혜택 추천 및 자격 판정</li>
              <li>혜택 마감 알림 (푸시 알림)</li>
              <li>필요 서류 안내 및 발급처 연결</li>
              <li>프리미엄 구독 서비스</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제3조 (회원가입 및 인증)</h2>
            <p>
              서비스는 카카오 OAuth를 통한 간편 로그인을 제공합니다.
              사용자는 로그인 시 카카오 프로필 정보(닉네임, 프로필 이미지)가 서비스에 전달되는 것에 동의합니다.
              서비스는 사용자의 카카오 비밀번호를 저장하지 않습니다.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제4조 (AI 서비스 면책)</h2>
            <p>
              서비스가 제공하는 AI 자격 판정 및 추천 결과는 <strong>참고 목적</strong>으로만 활용해야 하며,
              최종 자격 여부는 관할 기관의 심사에 따라 결정됩니다.
              AI 판정 결과와 실제 수급 자격이 다를 수 있으며, 이에 대한 법적 책임은 서비스에 없습니다.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제5조 (프리미엄 서비스)</h2>
            <p>
              프리미엄 구독은 월 4,900원이며, 다음 혜택을 포함합니다:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>AI 혜택 분석 무제한 이용</li>
              <li>마감 14일 전 얼리버드 알림</li>
              <li>광고 제거</li>
              <li>카카오톡 1:1 상담 우선 지원</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제6조 (면책 조항)</h2>
            <ul style={{ paddingLeft: 20, listStyleType: 'disc' }}>
              <li>공공데이터포털 API 장애로 인한 정보 누락에 대해 책임지지 않습니다.</li>
              <li>정부 정책 변경으로 인한 혜택 내용 불일치에 대해 책임지지 않습니다.</li>
              <li>사용자의 프로필 입력 오류로 인한 부정확한 추천에 대해 책임지지 않습니다.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제7조 (개인정보 처리)</h2>
            <p>
              서비스는 사용자의 개인정보를 소중히 다루며, 카카오 프로필 정보와 프로필 입력 데이터만 수집합니다.
              수집된 정보는 혜택 추천 및 맞춤 알림 외 목적으로 사용되지 않습니다.
              사용자는 언제든지 프로필 삭제를 요청할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제8조 (약관 변경)</h2>
            <p>
              서비스는 필요 시 약관을 변경할 수 있으며, 변경 사항은 앱 내 공지를 통해 안내합니다.
              변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.
            </p>
          </section>

          <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-tertiary)' }}>
            시행일: 2026년 3월 3일
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
