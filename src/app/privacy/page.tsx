"use client";
import Link from "next/link";
import { useApp } from "@/lib/context";

const SECTIONS_KO = [
  {
    title: "제1조 (목적)",
    content: `혜택알리미(BenefitBell, 이하 "서비스")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.`,
  },
  {
    title: "제2조 (수집하는 개인정보 항목)",
    content: null,
    subsections: [
      {
        label: "일반 개인정보",
        items: [
          "카카오 로그인 시 자동 수집: 카카오 고유 ID, 닉네임, 프로필 이미지 URL",
          "사용자 직접 입력: 이름, 생년월일, 성별, 거주 지역, 소득분위, 고용상태, 주거형태, 가구원 수",
          "자동 수집: FCM 푸시 토큰, 서비스 이용 기록",
        ],
      },
      {
        label: "민감정보 (별도 동의)",
        items: ["임신 여부", "장애 여부", "의료급여 수급 여부"],
      },
    ],
  },
  {
    title: "제3조 (개인정보의 수집·이용 목적)",
    content: null,
    items: [
      "맞춤형 정부·지자체 혜택 추천",
      "수혜 자격 매칭 및 마감일 알림 발송",
      "서비스 품질 개선 및 통계 분석",
    ],
  },
  {
    title: "제4조 (개인정보의 보유·이용기간)",
    content:
      "수집된 개인정보는 회원 탈퇴 시 즉시 파기합니다. 단, 관계 법령에 의해 보존이 필요한 경우 해당 법령이 정한 기간 동안 보관합니다.",
  },
  {
    title: "제5조 (개인정보의 제3자 제공)",
    content:
      "서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법령에 따라 수사기관의 요청이 있는 경우에는 예외로 합니다.",
  },
  {
    title: "제6조 (개인정보 처리 위탁)",
    content: null,
    items: [
      "Firebase (Google LLC): 인증, 데이터베이스, 푸시 알림 인프라 운영",
      "카카오(Kakao Corp.): 소셜 로그인 인증",
    ],
  },
  {
    title: "제7조 (개인정보의 파기)",
    content:
      "보유기간 경과 또는 처리 목적 달성 시 개인정보를 지체 없이 파기합니다. 전자적 파일 형태는 복구 불가능한 방법으로 영구 삭제하며, 출력물은 분쇄 또는 소각합니다.",
  },
  {
    title: "제8조 (정보주체의 권리·의무)",
    content: null,
    items: [
      "개인정보 열람, 정정, 삭제, 처리정지 요청 권리",
      "개인정보 처리에 관한 동의 철회 권리",
      "권리 행사: 아래 개인정보 보호책임자에게 이메일로 요청",
    ],
  },
  {
    title: "제9조 (개인정보 보호책임자)",
    content: null,
    items: [
      "서비스명: 혜택알리미 (BenefitBell)",
      "운영자: BenefitBell",
      "이메일: stayicon@gmail.com",
    ],
  },
  {
    title: "제10조 (처리방침 변경)",
    content:
      "이 개인정보 처리방침은 2026년 4월 22일부터 시행됩니다. 법령·정책 변경 또는 서비스 변화에 따라 내용이 변경될 경우 서비스 공지사항을 통해 고지합니다.",
  },
];

const SECTIONS_EN = [
  {
    title: "Article 1 (Purpose)",
    content: `BenefitBell (혜택알리미, hereinafter "Service") establishes and discloses this Privacy Policy in accordance with Article 30 of the Personal Information Protection Act to protect users' personal information and handle related complaints promptly.`,
  },
  {
    title: "Article 2 (Personal Information Collected)",
    content: null,
    subsections: [
      {
        label: "General Personal Information",
        items: [
          "Auto-collected via Kakao login: Kakao unique ID, nickname, profile image URL",
          "User-entered: name, date of birth, gender, region, income level, employment status, housing type, household size",
          "Auto-collected: FCM push token, service usage history",
        ],
      },
      {
        label: "Sensitive Information (separate consent required)",
        items: [
          "Pregnancy status",
          "Disability status",
          "Medical aid recipient status",
        ],
      },
    ],
  },
  {
    title: "Article 3 (Purpose of Collection & Use)",
    content: null,
    items: [
      "Personalized government and local benefit recommendations",
      "Eligibility matching and deadline notification delivery",
      "Service quality improvement and statistical analysis",
    ],
  },
  {
    title: "Article 4 (Retention & Use Period)",
    content:
      "Collected personal information is immediately destroyed upon account deletion. Exceptions apply where retention is required by applicable law, for the period prescribed by such law.",
  },
  {
    title: "Article 5 (Third-Party Disclosure)",
    content:
      "The Service does not, as a rule, provide users' personal information to third parties. Exceptions apply when the user consents or when a law enforcement agency requests disclosure pursuant to applicable law.",
  },
  {
    title: "Article 6 (Processing Consignment)",
    content: null,
    items: [
      "Firebase (Google LLC): Authentication, database, and push notification infrastructure",
      "Kakao Corp.: Social login authentication",
    ],
  },
  {
    title: "Article 7 (Destruction of Personal Information)",
    content:
      "Personal information is destroyed without delay upon expiry of the retention period or achievement of the processing purpose. Electronic files are permanently deleted by an unrecoverable method; printed materials are shredded or incinerated.",
  },
  {
    title: "Article 8 (Rights & Obligations of Data Subjects)",
    content: null,
    items: [
      "Right to access, correct, delete, or suspend processing of personal information",
      "Right to withdraw consent for personal information processing",
      "To exercise rights: contact the Privacy Officer below via email",
    ],
  },
  {
    title: "Article 9 (Privacy Officer)",
    content: null,
    items: [
      "Service: BenefitBell (혜택알리미)",
      "Operator: BenefitBell",
      "Email: stayicon@gmail.com",
    ],
  },
  {
    title: "Article 10 (Policy Changes)",
    content:
      "This Privacy Policy is effective from April 22, 2026. If the content changes due to legal, policy, or service updates, users will be notified via the in-app notice.",
  },
];

type Section = {
  title: string;
  content?: string | null;
  items?: string[];
  subsections?: { label: string; items: string[] }[];
};

function SectionList({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section, idx) => (
        <section
          key={idx}
          style={{
            marginBottom: 28,
            paddingBottom: 28,
            borderBottom:
              idx < sections.length - 1
                ? "1px solid var(--border-color)"
                : "none",
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 10,
            }}
          >
            {section.title}
          </h2>

          {section.content && (
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.8,
              }}
            >
              {section.content}
            </p>
          )}

          {section.subsections?.map((sub, si) => (
            <div key={si} style={{ marginBottom: 12 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                {sub.label}
              </p>
              <ul
                style={{
                  paddingLeft: 18,
                  listStyleType: "disc",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.8,
                }}
              >
                {sub.items.map((item, ii) => (
                  <li key={ii}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {section.items && (
            <ul
              style={{
                paddingLeft: 18,
                listStyleType: "disc",
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.8,
              }}
            >
              {section.items.map((item, ii) => (
                <li key={ii}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}

export default function PrivacyPage() {
  const { lang } = useApp();
  const isKo = lang === "ko";
  const sections = isKo ? SECTIONS_KO : SECTIONS_EN;

  return (
    <>
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-color)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          maxWidth: 480,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: 13,
            color: "var(--color-coral)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
          aria-label={isKo ? "홈으로 이동" : "Go to home"}
        >
          {isKo ? "← 홈으로" : "← Home"}
        </Link>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            flex: 1,
            textAlign: "center",
          }}
        >
          {isKo ? "개인정보처리방침" : "Privacy Policy"}
        </span>
        <span style={{ width: 52 }} />
      </div>

      <main
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "24px 20px 60px",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "var(--text-tertiary)",
            marginBottom: 24,
          }}
        >
          {isKo ? "시행일: 2026년 4월 22일" : "Effective: April 22, 2026"}
        </p>

        <SectionList sections={sections as Section[]} />

        <div
          style={{
            background: "var(--bg-secondary)",
            borderRadius: "var(--border-radius-md)",
            padding: "14px 16px",
            fontSize: 12,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
          }}
        >
          {isKo ? (
            <>
              개인정보 관련 문의: <strong>stayicon@gmail.com</strong>
              <br />
              운영자: BenefitBell
            </>
          ) : (
            <>
              Privacy inquiries: <strong>stayicon@gmail.com</strong>
              <br />
              Operator: BenefitBell
            </>
          )}
        </div>
      </main>
    </>
  );
}
