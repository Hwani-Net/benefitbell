'use client'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'

export default function PrivacyPage() {
  return (
    <>
      <TopBar />
      <main className="page-content" style={{ padding: '20px 16px 100px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)' }}>
          🔒 개인정보처리방침
        </h1>

        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제1조 (목적)</h2>
            <p>
              혜택알리미(BenefitBell, 이하 &quot;서비스&quot;)는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고
              이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제2조 (수집하는 개인정보 항목)</h2>
            <p>서비스는 다음의 개인정보 항목을 수집합니다:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li><strong>카카오 로그인 시 자동 수집</strong>: 카카오 고유 ID, 닉네임, 프로필 이미지 URL</li>
              <li><strong>사용자 직접 입력</strong>: 나이, 성별, 거주 지역, 고용 상태, 주거 형태, 가구원 수, 소득 분위, 특이 사항 (장애, 한부모 등)</li>
              <li><strong>자동 수집</strong>: FCM 푸시 토큰, 서비스 이용 기록</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제3조 (수집 목적)</h2>
            <p>수집된 개인정보는 다음 목적으로만 이용됩니다:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>정부 복지 혜택 맞춤 추천 및 AI 자격 판정</li>
              <li>혜택 마감 알림 (푸시 알림) 발송</li>
              <li>프리미엄 구독 관리 및 결제 처리</li>
              <li>서비스 개선 및 통계 분석 (비식별 처리)</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제4조 (보유 기간)</h2>
            <ul style={{ paddingLeft: 20, listStyleType: 'disc' }}>
              <li><strong>회원 정보</strong>: 회원 탈퇴 시까지</li>
              <li><strong>결제 기록</strong>: 전자상거래법에 따라 5년</li>
              <li><strong>푸시 알림 발송 이력</strong>: 30일 후 자동 삭제</li>
              <li><strong>AI 판정 캐시</strong>: 24시간 후 자동 삭제</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제5조 (제3자 제공)</h2>
            <p>
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 다음의 경우 예외로 합니다:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>이용자가 사전 동의한 경우</li>
              <li>법령에 의해 요구되는 경우</li>
              <li>결제 처리를 위한 토스페이먼츠 연동 (결제 정보만 전달)</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제6조 (AI 서비스와 개인정보)</h2>
            <p>
              AI 자격 판정 시 사용자 프로필(나이, 성별, 지역 등)이 AI 모델(OpenRouter)에 전송됩니다.
              전송되는 정보에는 카카오 ID, 이름 등 <strong>직접 식별 가능한 정보는 포함되지 않습니다</strong>.
              AI 판정 결과는 24시간 캐싱 후 자동 삭제됩니다.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제7조 (이용자의 권리)</h2>
            <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다:</p>
            <ul style={{ paddingLeft: 20, marginTop: 8, listStyleType: 'disc' }}>
              <li>개인정보 열람, 수정, 삭제 요청</li>
              <li>처리 정지 요청</li>
              <li>동의 철회</li>
            </ul>
            <p style={{ marginTop: 8 }}>
              위 요청은 프로필 페이지에서 직접 수정하거나, 아래 연락처로 문의해 주세요.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제8조 (안전성 확보 조치)</h2>
            <ul style={{ paddingLeft: 20, listStyleType: 'disc' }}>
              <li>Firebase/Firestore 보안 규칙을 통한 접근 제어</li>
              <li>HTTPS(TLS) 암호화 전송</li>
              <li>API 인증 시크릿 키 기반 접근 통제</li>
              <li>관리자 접근 권한 최소화</li>
            </ul>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제9조 (쿠키 및 분석 도구)</h2>
            <p>
              서비스는 Google Analytics를 사용하여 서비스 이용 통계를 수집합니다.
              수집 데이터는 비식별 처리되며, Google의 개인정보처리방침에 따라 관리됩니다.
              브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
            </p>
          </section>

          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제10조 (처리방침 변경)</h2>
            <p>
              이 개인정보처리방침은 법령 또는 서비스 변경사항의 반영을 위해 수정될 수 있으며,
              변경 시 앱 내 공지를 통해 안내합니다.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>제11조 (개인정보 보호책임자)</h2>
            <ul style={{ paddingLeft: 20, listStyleType: 'disc' }}>
              <li>서비스명: 혜택알리미 (BenefitBell)</li>
              <li>이메일: stayicon@gmail.com</li>
            </ul>
          </section>

          <p style={{ marginTop: 32, fontSize: 12, color: 'var(--text-tertiary)' }}>
            시행일: 2026년 3월 4일
          </p>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
