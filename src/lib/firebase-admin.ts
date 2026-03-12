// Firebase Admin SDK (서버 전용 — API routes, cron jobs)
// 통합 후 인증: SA Key 파일 (로컬) → ADC (프로덕션, 같은 프로젝트)
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

  // 통합 후: SA Key 파일 (로컬 개발) → ADC (프로덕션, 같은 프로젝트)
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH

  if (keyPath) {
    // 로컬 개발: SA Key 파일 경로
    const fileContent = readFileSync(keyPath, 'utf-8')
    const serviceAccount = JSON.parse(fileContent) as ServiceAccount
    adminApp = initializeApp({ credential: cert(serviceAccount) })
    console.log('[firebase-admin] Using SA Key file (local dev)')
  } else {
    // 프로덕션 (Firebase App Hosting): ADC 자동 인증
    // Firestore가 같은 프로젝트(ai-project-ce41f)이므로 크로스-프로젝트 SA Key 불필요
    console.log('[firebase-admin] Using ADC (same project)')
    adminApp = initializeApp({
      credential: applicationDefault(),
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
