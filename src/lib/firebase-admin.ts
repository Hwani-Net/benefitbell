// Firebase Admin SDK (서버 전용 — API routes, cron jobs)
// 환경변수: FIREBASE_SERVICE_ACCOUNT_KEY (JSON 문자열) 또는 파일 경로
import { App, getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getMessaging, Messaging } from 'firebase-admin/messaging'

let adminApp: App | null = null

function getAdminApp(): App {
  if (adminApp) return adminApp
  if (getApps().length > 0) {
    adminApp = getApps()[0]
    return adminApp
  }

  // 우선순위: B64 인코딩 → JSON 문자열 → 파일 경로
  const keyB64  = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH

  if (keyB64) {
    const serviceAccount = JSON.parse(
      Buffer.from(keyB64, 'base64').toString('utf-8')
    ) as ServiceAccount
    adminApp = initializeApp({ credential: cert(serviceAccount) })
  } else if (keyJson) {
    const serviceAccount = JSON.parse(keyJson) as ServiceAccount
    adminApp = initializeApp({ credential: cert(serviceAccount) })
  } else if (keyPath) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    adminApp = initializeApp({ credential: cert(require(keyPath) as ServiceAccount) })
  } else {
    throw new Error(
      'Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY_B64, FIREBASE_SERVICE_ACCOUNT_KEY, 또는 FIREBASE_SERVICE_ACCOUNT_KEY_PATH 환경변수가 필요합니다.'
    )
  }

  return adminApp
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp())
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp())
}

export function getAdminMessaging(): Messaging {
  return getMessaging(getAdminApp())
}

/** Kakao → Firebase Custom Token 발급 */
export async function createKakaoCustomToken(kakaoId: string, extraClaims?: Record<string, unknown>): Promise<string> {
  const auth = getAdminAuth()
  return auth.createCustomToken(`kakao_${kakaoId}`, extraClaims)
}
