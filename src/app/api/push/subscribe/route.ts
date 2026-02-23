import { NextResponse } from 'next/server'
import { addSubscription, getSubscriptionCount } from '@/lib/push-store'

export async function POST(req: Request) {
  try {
    const subscription = await req.json()
    await addSubscription(subscription)
    const total = await getSubscriptionCount()
    return NextResponse.json({ success: true, total })
  } catch {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

export async function GET() {
  const count = await getSubscriptionCount()
  return NextResponse.json({ count })
}
