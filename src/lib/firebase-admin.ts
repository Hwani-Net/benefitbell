// Firebase Admin SDK (서버 전용 — API routes, cron jobs)
// 환경변수: FIREBASE_SERVICE_ACCOUNT_KEY (JSON 문자열) 또는 파일 경로
import { App, getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { getAuth, Auth } from 'firebase-admin/auth'
import { getMessaging, Messaging } from 'firebase-admin/messaging'
import { readFileSync } from 'fs'

let adminApp: App | null = null

function getAdminApp(): App {
  if (adminApp) return adminApp
  if (getApps().length > 0) {
    adminApp = getApps()[0]
    return adminApp
  }

  // 우선순위: JSON 문자열 → 파일 경로
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH

  if (keyJson) {
    const serviceAccount = JSON.parse(keyJson) as ServiceAccount
    adminApp = initializeApp({ credential: cert(serviceAccount) })
  } else if (keyPath) {
    // Use fs.readFileSync instead of require() for Turbopack compatibility
    const fileContent = readFileSync(keyPath, 'utf-8')
    const serviceAccount = JSON.parse(fileContent) as ServiceAccount
    adminApp = initializeApp({ credential: cert(serviceAccount) })
  } else {
    throw new Error(
      'Firebase Admin SDK: FIREBASE_SERVICE_ACCOUNT_KEY 또는 FIREBASE_SERVICE_ACCOUNT_KEY_PATH 환경변수가 필요합니다.'
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
