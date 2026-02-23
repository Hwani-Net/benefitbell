import { NextResponse } from 'next/server'
import { addSubscription, getSubscriptionCount } from '@/lib/push-store'

export async function POST(req: Request) {
  try {
    const subscription = await req.json()
    addSubscription(subscription)
    return NextResponse.json({ success: true, total: getSubscriptionCount() })
  } catch {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ count: getSubscriptionCount() })
}
