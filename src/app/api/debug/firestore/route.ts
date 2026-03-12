import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

// 임시 디버그 엔드포인트 — 프로덕션 Firestore 연결 진단
// TODO: 진단 후 삭제
export async function GET() {
  try {
    const db = getAdminFirestore()
    
    // Firestore 프로젝트 ID 확인
    const firestoreProject = (db as unknown as { projectId?: string }).projectId || 'unknown'
    
    // 간단한 읽기 테스트
    const testDoc = await db.collection('users').doc('4763983758').get()
    
    return NextResponse.json({
      status: 'ok',
      firestoreProject,
      docExists: testDoc.exists,
      envCheck: {
        FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        FIREBASE_SERVICE_ACCOUNT_KEY_LENGTH: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'not set',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not set',
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      }
    })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({
      status: 'error',
      error: errMsg,
      envCheck: {
        FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
        FIREBASE_SERVICE_ACCOUNT_KEY_LENGTH: process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.length || 0,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'not set',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'not set',
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      }
    }, { status: 500 })
  }
}
