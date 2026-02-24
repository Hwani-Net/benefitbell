/**
 * GET /api/cron/prefetch-details
 * Vercel Cron Job: 매일 새벽 2시 실행
 * data.go.kr 상세 API를 사전 수집해 Supabase에 캐싱
 */
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

const API_BASE = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001'
const BATCH_SIZE = 20       // 동시 처리 개수 (rate limit 방지)
const BATCH_DELAY_MS = 500  // 배치 간 딜레이

function getXmlValue(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return m ? m[1].trim() : ''
}

function getXmlValues(xml: string, parentTag: string, childTag: string): string[] {
  const re = new RegExp(`<${parentTag}>([\\s\\S]*?)</${parentTag}>`, 'g')
  const results: string[] = []
  let m
  while ((m = re.exec(xml)) !== null) {
    const val = getXmlValue(m[1], childTag)
    if (val) results.push(val)
  }
  return results
}

function cleanText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim()
}

async function fetchDetailWithRetry(servId: string, serviceKey: string): Promise<object | null> {
  const url = `${API_BASE}/NationalWelfaredetailedV001?serviceKey=${serviceKey}&callTp=D&servId=${servId}`
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise(r => setTimeout(r, 2000))
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 7000)
      let res: Response
      try {
        res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' })
      } finally { clearTimeout(t) }

      if (!res.ok) continue
      const xml = await res.text()
      if (!xml || xml.length < 50) continue
      const rc = getXmlValue(xml, 'resultCode')
      if (rc && rc !== '0' && rc !== '00') continue

      return {
        serv_id:             servId,
        title:               getXmlValue(xml, 'servNm'),
        ministry:            getXmlValue(xml, 'jurMnofNm'),
        phone:               getXmlValue(xml, 'rprsCtadr'),
        year:                getXmlValue(xml, 'crtrYr'),
        support_cycle:       getXmlValue(xml, 'sprtCycNm'),
        support_type:        getXmlValue(xml, 'srvPvsnNm'),
        overview:            cleanText(getXmlValue(xml, 'wlfareInfoOutlCn')),
        target_detail:       cleanText(getXmlValue(xml, 'tgtrDtlCn')),
        selection_criteria:  cleanText(getXmlValue(xml, 'slctCritCn')),
        support_content:     cleanText(getXmlValue(xml, 'alwServCn')),
        apply_bgn_dt:        getXmlValue(xml, 'aplyBgnDd'),
        apply_end_dt:        getXmlValue(xml, 'aplyEndDd'),
        life_stages:         getXmlValue(xml, 'lifeArray'),
        target_groups:       getXmlValue(xml, 'trgterIndvdlArray'),
        themes:              getXmlValue(xml, 'intrsThemaArray'),
        application_methods: getXmlValues(xml, 'applmetList', 'servSeDetailNm'),
        application_links:   getXmlValues(xml, 'applmetList', 'servSeDetailLink'),
        contacts: getXmlValues(xml, 'inqplCtadrList', 'servSeDetailNm').map((name, i) => ({
          name,
          address: getXmlValues(xml, 'inqplCtadrList', 'servSeDetailLink')[i] || '',
        })),
        required_docs:  getXmlValues(xml, 'basfrmList', 'servSeDetailNm'),
        related_laws:   getXmlValues(xml, 'baslawList', 'servSeDetailNm'),
        homepages: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailNm').map((name, i) => ({
          name,
          url: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailLink')[i] || '',
        })),
        fetched_at: new Date().toISOString(),
      }
    } catch { /* ignore */ }
  }
  return null
}

export async function GET(request: Request) {
  // Cron secret 검증
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceKey = process.env.DATA_GO_KR_SERVICE_KEY
  if (!serviceKey) return NextResponse.json({ error: 'No API key' }, { status: 500 })

  // 1. 목록 API에서 전체 servId 수집
  const listUrl = `${API_BASE}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&srchKeyCode=001&pageNo=1&numOfRows=999`
  let servIds: string[] = []
  try {
    const listRes = await fetch(listUrl, { cache: 'no-store' })
    if (listRes.ok) {
      const xml = await listRes.text()
      const idMatches = xml.match(/<servId>([^<]+)<\/servId>/g) ?? []
      servIds = idMatches.map(m => m.replace(/<\/?servId>/g, '').trim()).filter(Boolean)
    }
  } catch (err) {
    console.error('[prefetch] List fetch error:', err)
    return NextResponse.json({ error: 'List fetch failed' }, { status: 500 })
  }

  if (servIds.length === 0) {
    return NextResponse.json({ error: 'No servIds found' }, { status: 500 })
  }

  // 2. 최근 캐시된 ID는 스킵 (12시간 이내 수집된 것)
  const supabase = createServiceClient()
  const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  const { data: cached } = await supabase
    .from('welfare_details')
    .select('serv_id')
    .gt('fetched_at', cutoff)
  const cachedIds = new Set((cached ?? []).map((r: { serv_id: string }) => r.serv_id))
  const toFetch = servIds.filter(id => !cachedIds.has(id))

  console.log(`[prefetch] Total: ${servIds.length}, cached: ${cachedIds.size}, to fetch: ${toFetch.length}`)

  // 3. 배치 처리 (BATCH_SIZE개씩)
  let success = 0, failed = 0
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(batch.map(id => fetchDetailWithRetry(id, serviceKey)))

    const rows = results.filter(Boolean) as object[]
    if (rows.length > 0) {
      const { error } = await supabase
        .from('welfare_details')
        .upsert(rows, { onConflict: 'serv_id' })
      if (error) {
        console.error('[prefetch] Supabase upsert error:', error.message)
        failed += batch.length
      } else {
        success += rows.length
        failed += batch.length - rows.length
      }
    } else {
      failed += batch.length
    }

    if (i + BATCH_SIZE < toFetch.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  return NextResponse.json({
    success: true,
    total: servIds.length,
    alreadyCached: cachedIds.size,
    fetched: success,
    failed,
    timestamp: new Date().toISOString(),
  })
}
