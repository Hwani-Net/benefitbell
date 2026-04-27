"use client";

import { useState, useEffect } from "react";
import styles from "./PushToggle.module.css";

import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, deleteToken } from "firebase/messaging";
import { useApp } from "@/lib/context";

export default function PushToggle() {
  const { lang } = useApp();
  const isKo = lang === "ko";
  const [status, setStatus] = useState<
    "unsupported" | "denied" | "subscribed" | "unsubscribed"
  >("unsubscribed");
  const [loading, setLoading] = useState(false);
  const [showDeniedGuide, setShowDeniedGuide] = useState(false);

  // FCM용 VAPID Key: Firebase 콘솔 > 프로젝트 설정 > 클라우드 메시징 > Web 영역
  const vapidKey =
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ||
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    // Check if already subscribed via Service Worker
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setStatus(sub ? "subscribed" : "unsubscribed");
      });
    });
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        throw new Error("Firebase Messaging not initialized");
      }

      const reg = await navigator.serviceWorker.ready;

      // Get FCM token
      const currentToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: reg,
      });

      if (currentToken) {
        // 백엔드 API 포맷 변경: { fcmToken: "ey..." } 형태로 전송
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fcmToken: currentToken, lang }),
        });
        // profile 페이지의 category 업데이트가 fcmToken을 읽을 수 있도록 저장
        try {
          localStorage.setItem("fcm_token", currentToken);
        } catch (storageErr) {
          // localStorage 쓰기 실패 (storage full, private mode 등) — 기능 저하 허용
          // 구독 자체는 성공했으므로 앱 실행은 계속되나, 카테고리 업데이트 시 fcmToken 재조회 불가
          console.error(
            "[PushToggle] fcm_token localStorage 저장 실패:",
            storageErr,
          );
        }
        setStatus("subscribed");
      } else {
        console.warn(
          "No registration token available. Request permission to generate one.",
        );
      }
    } catch (err) {
      console.error("[FCM Push subscribe]", err);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    try {
      const messaging = await getFirebaseMessaging();
      if (messaging) {
        await deleteToken(messaging);
      }
      // 기존 네이티브 구독도 정리
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      // fcm_token localStorage 정리 (profile 페이지의 카테고리 업데이트에서 참조)
      try { localStorage.removeItem("fcm_token"); } catch { /* ignore */ }
      // 서버에도 알림 (선택적) - 현재는 서버 API가 없으므로 생략
      setStatus("unsubscribed");
    } catch (err) {
      console.error("[FCM Push unsubscribe]", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "unsupported") return null;

  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <span className={styles.icon}>🔔</span>
        <div>
          <p className={styles.label}>
            {isKo ? "마감 임박 알림" : "Deadline Alerts"}
          </p>
          <p className={styles.desc}>
            {status === "denied"
              ? isKo
                ? "알림이 차단되었습니다."
                : "Notifications are blocked."
              : status === "subscribed"
                ? isKo
                  ? "알림이 활성화되어 있습니다"
                  : "Notifications are enabled"
                : isKo
                  ? "신청 마감 전 푸시 알림을 받으세요"
                  : "Get push alerts before deadlines"}
          </p>
          {status === "denied" && (
            <div className={styles.deniedWrap}>
              <button
                className={styles.deniedBtn}
                onClick={() => setShowDeniedGuide((v) => !v)}
              >
                {showDeniedGuide
                  ? isKo
                    ? "안내 닫기 ▲"
                    : "Hide Guide ▲"
                  : isKo
                    ? "설정 안내 보기 ▼"
                    : "Show Settings Guide ▼"}
              </button>
              {showDeniedGuide && (
                <p className={styles.deniedGuide}>
                  {isKo ? (
                    <>
                      주소창 왼쪽 🔒 아이콘 → <strong>사이트 설정</strong> →{" "}
                      <strong>알림</strong> → <strong>허용</strong>으로 변경 후
                      새로고침 해주세요.
                    </>
                  ) : (
                    <>
                      Click the 🔒 icon in the address bar →{" "}
                      <strong>Site settings</strong> →{" "}
                      <strong>Notifications</strong> → set to{" "}
                      <strong>Allow</strong>, then refresh.
                    </>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {status !== "denied" && (
        <button
          id="push-toggle-btn"
          className={`${styles.toggle} ${status === "subscribed" ? styles.on : ""} ${loading ? styles.loading : ""}`}
          onClick={status === "subscribed" ? unsubscribe : subscribe}
          disabled={loading}
          aria-label={
            status === "subscribed"
              ? isKo
                ? "알림 끄기"
                : "Turn off notifications"
              : isKo
                ? "알림 켜기"
                : "Turn on notifications"
          }
        >
          <span className={styles.knob} />
        </button>
      )}
    </div>
  );
}
