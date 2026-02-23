import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { subscription, categories = [], age_group, region } = body

    // Support both { subscription, categories } or bare subscription
    const sub = subscription ?? body
    const endpoint: string = sub.endpoint
    const p256dh: string = sub.keys?.p256dh ?? sub.p256dh ?? ''
    const auth: string = sub.keys?.auth ?? sub.auth ?? ''

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('push_subscriptions').upsert(
      { endpoint, p256dh, auth, categories, age_group, region },
      { onConflict: 'endpoint' }
    )

    if (error) throw error

    const { count } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ success: true, total: count ?? 0 })
  } catch (err) {
    console.error('[push/subscribe] Error:', err)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient()
    const { count } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true })
    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { endpoint } = await req.json()
    const supabase = createServiceClient()
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 })
  }
}
