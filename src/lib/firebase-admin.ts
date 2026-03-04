// Firebase Admin SDK (서버 전용 — API routes, cron jobs)
// 인증 우선순위: 개별 필드 → JSON 문자열 → 파일 경로 → ADC (Firebase App Hosting)
import { App, getApps, initializeApp, cert, applicationDefault, ServiceAccount } from 'firebase-admin/app'
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

  // 우선순위: 개별 필드 → JSON 문자열 → 파일 경로 → ADC (Firebase App Hosting / Cloud Run)
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH

  if (projectId && clientEmail && privateKey) {
    // 개별 필드 방식 — 환경변수 크기 최소화
    adminApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey } as ServiceAccount),
    })
  } else if (keyJson) {
    const serviceAccount = JSON.parse(keyJson) as ServiceAccount
    adminApp = initializeApp({ credential: cert(serviceAccount) })
  } else if (keyPath) {
    // Use fs.readFileSync instead of require() for Turbopack compatibility
    const fileContent = readFileSync(keyPath, 'utf-8')
    const serviceAccount = JSON.parse(fileContent) as ServiceAccount
    adminApp = initializeApp({ credential: cert(serviceAccount) })
  } else {
    // ADC (Application Default Credentials)
    // Firebase App Hosting / Cloud Run / GCE에서는 자동 인증
    // 로컬에서는 GOOGLE_APPLICATION_CREDENTIALS 또는 gcloud auth
    console.log('[firebase-admin] Using Application Default Credentials (ADC)')
    adminApp = initializeApp({
      credential: applicationDefault(),
      projectId: projectId || undefined,
    })
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
