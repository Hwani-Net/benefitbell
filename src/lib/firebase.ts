// Firebase Client SDK (브라우저 전용)
// FishLog fish-log/src/lib/firebase.ts 패턴 기반
import { FirebaseApp, initializeApp, getApps } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'

import { getMessaging, Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

function isConfigured(): boolean {
  return !!firebaseConfig.apiKey && !!firebaseConfig.projectId
}

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null

function getApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null // SSR safety
  if (!isConfigured()) return null
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  return app
}

export function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance
  const a = getApp()
  if (!a) return null
  authInstance = getAuth(a)
  return authInstance
}

export function getFirebaseDb(): Firestore | null {
  if (dbInstance) return dbInstance
  const a = getApp()
  if (!a) return null
  dbInstance = getFirestore(a)
  return dbInstance
}

let messagingInstance: Messaging | null = null

export function getFirebaseApp(): FirebaseApp | null {
  return getApp()
}

export function getFirebaseMessaging(): Messaging | null {
  if (messagingInstance) return messagingInstance
  const a = getApp()
  if (!a) return null
  messagingInstance = getMessaging(a)
  return messagingInstance
}

export function isFirebaseReady(): boolean {
  return typeof window !== 'undefined' && isConfigured()
}
