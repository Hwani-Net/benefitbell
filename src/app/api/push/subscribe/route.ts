import { NextResponse } from 'next/server'

// Demo-purpose in-memory store
// In production, use Vercel KV or a database
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const subscriptions: any[] = []

export async function POST(req: Request) {
  try {
    const subscription = await req.json()
    const exists = subscriptions.some((s) => s.endpoint === subscription.endpoint)
    if (!exists) {
      subscriptions.push(subscription)
    }
    return NextResponse.json({ success: true, total: subscriptions.length })
  } catch {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ count: subscriptions.length })
}
