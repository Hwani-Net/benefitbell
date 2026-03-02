import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { fcmToken, categories = [], age_group, region } = body

    if (!fcmToken) {
      return NextResponse.json({ error: 'Invalid subscription data: fcmToken is required' }, { status: 400 })
    }

    const db = getAdminFirestore()
    // 토큰이 길거나 특수문자가 있을 수 있으므로 base64 인코딩하여 docId로 사용
    const docId = Buffer.from(fcmToken).toString('base64').replace(/[/+=]/g, '_').slice(0, 150)
    
    await db.collection('push_subscriptions').doc(docId).set(
      { fcmToken, categories, age_group, region, updated_at: new Date() },
      { merge: true }
    )

    const snapshot = await db.collection('push_subscriptions').count().get()
    const total = snapshot.data().count

    return NextResponse.json({ success: true, total })
  } catch (err) {
    console.error('[push/subscribe] Error:', err)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = getAdminFirestore()
    const snapshot = await db.collection('push_subscriptions').count().get()
    return NextResponse.json({ count: snapshot.data().count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { fcmToken } = await req.json()
    if (!fcmToken) {
      return NextResponse.json({ error: 'fcmToken required' }, { status: 400 })
    }
    const db = getAdminFirestore()
    const docId = Buffer.from(fcmToken).toString('base64').replace(/[/+=]/g, '_').slice(0, 150)
    await db.collection('push_subscriptions').doc(docId).delete()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }
}
