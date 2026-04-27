// Kakao SDK utility

declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (params: KakaoShareParams) => void;
      };
      Channel: {
        addChannel: (params: { channelPublicId: string }) => void;
        chat: (params: { channelPublicId: string }) => void;
      };
    };
  }
}

interface KakaoShareParams {
  objectType: string;
  content: {
    title: string;
    description: string;
    imageUrl: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  };
  buttons?: Array<{
    title: string;
    link: {
      mobileWebUrl: string;
      webUrl: string;
    };
  }>;
}

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "";
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://benefitbell.kr";
// 카카오톡 채널 공개 ID (채널명: BenefitBell, https://pf.kakao.com/_IdDIX 검증 완료)
export const KAKAO_CHANNEL_ID = "_IdDIX";

// SDK 초기화
export function initKakao() {
  if (typeof window === "undefined") return;
  if (!window.Kakao) return;
  if (!KAKAO_JS_KEY) return;
  if (window.Kakao.isInitialized()) return;
  window.Kakao.init(KAKAO_JS_KEY);
}

// 혜택 공유하기
export function shareKakaoBenefit({
  title,
  amount,
  categoryLabel,
  dDay,
  benefitId,
}: {
  title: string;
  amount: string;
  categoryLabel: string;
  dDay: number;
  benefitId: string;
}) {
  if (typeof window === "undefined" || !window.Kakao) return;

  initKakao();

  const url = `${APP_BASE_URL}/detail/${benefitId}`;
  const dDayText =
    dDay >= 365
      ? "상시 모집!"
      : dDay === 0
        ? "오늘 마감!"
        : `D-${dDay} 마감 임박!`;
  const description = `${categoryLabel} | ${amount}\n⏰ ${dDayText}`;

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: `🔔 ${title}`,
      description,
      imageUrl: `${APP_BASE_URL}/icons/icon-512.png`,
      link: {
        mobileWebUrl: url,
        webUrl: url,
      },
    },
    buttons: [
      {
        title: "혜택 신청하러 가기",
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
    ],
  });
}

// 앱 공유하기 (홈)
export function shareKakaoApp() {
  if (typeof window === "undefined" || !window.Kakao) return;

  initKakao();

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: "🔔 혜택알리미 - 나에게 맞는 지원금, 한눈에",
      description:
        "기초수급, 청년 지원금, 노인 복지 등 맞춤 정부 혜택을 한 번에 확인하세요!",
      imageUrl: `${APP_BASE_URL}/icons/icon-512.png`,
      link: {
        mobileWebUrl: APP_BASE_URL,
        webUrl: APP_BASE_URL,
      },
    },
    buttons: [
      {
        title: "지금 확인하기",
        link: {
          mobileWebUrl: APP_BASE_URL,
          webUrl: APP_BASE_URL,
        },
      },
    ],
  });
}

// 카카오톡 채널 추가하기 (친구 추가)
export function addKakaoChannel() {
  if (typeof window === "undefined" || !window.Kakao) return;
  initKakao();
  window.Kakao.Channel.addChannel({ channelPublicId: KAKAO_CHANNEL_ID });
}

// 카카오톡 채널 1:1 채팅
export function chatKakaoChannel() {
  if (typeof window === "undefined" || !window.Kakao) return;
  initKakao();
  window.Kakao.Channel.chat({ channelPublicId: KAKAO_CHANNEL_ID });
}
