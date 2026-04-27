// Firebase Admin SDK (서버 전용 — API routes, cron jobs)
// 통합 후 인증: SA Key 파일 (로컬) → ADC (프로덕션, 같은 프로젝트)
import {
  App,
  getApps,
  initializeApp,
  cert,
  applicationDefault,
  ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";
import { getMessaging, Messaging } from "firebase-admin/messaging";
import { readFileSync } from "fs";

let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  // 통합 후: SA Key 파일 (로컬 개발) → ADC (프로덕션, 같은 프로젝트)
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (keyPath) {
    let fileContent: string;
    try {
      fileContent = readFileSync(keyPath, "utf-8");
    } catch (err) {
      console.error("[firebase-admin] Cannot read SA Key file:", keyPath, err);
      adminApp = initializeApp({ credential: applicationDefault() });
      return adminApp;
    }
    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(fileContent) as ServiceAccount;
    } catch {
      throw new Error(
        `[firebase-admin] Invalid JSON in service account file: ${keyPath}`,
      );
    }
    adminApp = initializeApp({ credential: cert(serviceAccount) });
    console.info("[firebase-admin] Using SA Key file");
  } else if (keyJson) {
    // 인라인 JSON (로컬 .env.local 또는 Vercel env)
    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(keyJson) as ServiceAccount;
    } catch {
      console.error(
        "[firebase-admin] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON",
      );
      adminApp = initializeApp({ credential: applicationDefault() });
      return adminApp;
    }
    adminApp = initializeApp({ credential: cert(serviceAccount) });
    console.info("[firebase-admin] Using SA Key JSON env var");
  } else {
    // 프로덕션 (Firebase App Hosting): ADC 자동 인증
    console.info("[firebase-admin] Using ADC (same project)");
    adminApp = initializeApp({ credential: applicationDefault() });
  }

  return adminApp;
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminMessaging(): Messaging {
  return getMessaging(getAdminApp());
}

/** Kakao → Firebase Custom Token 발급 */
export async function createKakaoCustomToken(
  kakaoId: string,
  extraClaims?: Record<string, unknown>,
): Promise<string> {
  const auth = getAdminAuth();
  return auth.createCustomToken(`kakao_${kakaoId}`, extraClaims);
}
