/**
 * 일회성 상세 데이터 사전 수집 스크립트
 * node 실행: node scripts/prefetch-details.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dbolydpnqefusswahfml.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRib2x5ZHBucWVmdXNzd2FoZm1sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg1MzQzMywiZXhwIjoyMDg3NDI5NDMzfQ.F9jmdqaNwKIhNum-JipniKX0NyUE2mZfWxjRXgBoQy4'
const DATA_GO_KR_KEY = 'ccb9d17949e5cb97d8349992b505b64d97f95b889afd6387c0d919038dfddc1e'
const API_BASE = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function getXmlValue(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return m ? m[1].trim() : ''
}

function getXmlValues(xml, parentTag, childTag) {
  const re = new RegExp(`<${parentTag}>([\\s\\S]*?)</${parentTag}>`, 'g')
  const results = []
  let m
  while ((m = re.exec(xml)) !== null) {
    const val = getXmlValue(m[1], childTag)
    if (val) results.push(val)
  }
  return results
}

function cleanText(text) {
  return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim()
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fetchDetail(servId) {
  const url = `${API_BASE}/NationalWelfaredetailedV001?serviceKey=${DATA_GO_KR_KEY}&callTp=D&servId=${servId}`
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(2000)
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 7000)
      let res
      try { res = await fetch(url, { signal: ctrl.signal }) }
      finally { clearTimeout(t) }
      
      if (!res.ok) { continue }
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
          name, address: getXmlValues(xml, 'inqplCtadrList', 'servSeDetailLink')[i] || ''
        })),
        required_docs:  getXmlValues(xml, 'basfrmList', 'servSeDetailNm'),
        related_laws:   getXmlValues(xml, 'baslawList', 'servSeDetailNm'),
        homepages: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailNm').map((name, i) => ({
          name, url: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailLink')[i] || ''
        })),
        fetched_at: new Date().toISOString(),
      }
    } catch { /* ignore */ }
  }
  return null
}

async function main() {
  console.log('🚀 Starting prefetch...')
  
  // 1. 목록 수집
  const listUrl = `${API_BASE}/NationalWelfarelistV001?serviceKey=${DATA_GO_KR_KEY}&callTp=L&srchKeyCode=001&pageNo=1&numOfRows=500`
  const listRes = await fetch(listUrl)
  const xml = await listRes.text()
  const matches = xml.match(/<servId>([^<]+)<\/servId>/g) ?? []
  const allIds = matches.map(m => m.replace(/<\/?servId>/g, '').trim()).filter(Boolean)
  console.log(`📋 Total IDs: ${allIds.length}`)

  // 2. 기존 캐시 확인
  const { data: cached } = await supabase.from('welfare_details').select('serv_id')
  const cachedSet = new Set((cached ?? []).map(r => r.serv_id))
  const toFetch = allIds.filter(id => !cachedSet.has(id))
  console.log(`✅ Cached: ${cachedSet.size}, To fetch: ${toFetch.length}`)

  // 2.5 연결 테스트 — 테이블에 단일 행 테스트 삽입
  const testRow = { serv_id: '__TEST__', title: 'test', fetched_at: new Date().toISOString() }
  const { error: testErr } = await supabase.from('welfare_details').upsert([testRow], { onConflict: 'serv_id' })
  if (testErr) {
    console.error('❌ Supabase connection/table test FAILED:', JSON.stringify(testErr))
    console.error('=> 테이블이 생성되지 않았거나 권한 문제입니다.')
    process.exit(1)
  }
  console.log('✅ Supabase connection test passed. Starting batch...')

  // 3. 배치 처리 (10개씩, 1초 간격)
  const BATCH = 10
  let success = 0, fail = 0
  for (let i = 0; i < toFetch.length; i += BATCH) {
    const batch = toFetch.slice(i, i + BATCH)
    const results = (await Promise.all(batch.map(fetchDetail))).filter(Boolean)
    
    if (results.length > 0) {
      const { error } = await supabase.from('welfare_details').upsert(results, { onConflict: 'serv_id' })
      if (error) { 
        console.error('❌ Upsert error:', JSON.stringify(error))
        fail += batch.length 
      }
      else { success += results.length; fail += batch.length - results.length }
    } else {
      fail += batch.length
    }
    
    const pct = Math.round(((i + BATCH) / toFetch.length) * 100)
    console.log(`[${pct}%] Processed ${Math.min(i + BATCH, toFetch.length)}/${toFetch.length} — success: ${success}, fail: ${fail}`)
    
    if (i + BATCH < toFetch.length) await sleep(1000)
  }
  
  console.log(`\n✨ Done! Success: ${success}, Failed: ${fail}`)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
