/**
 * 일회성 상세 데이터 사전 수집 스크립트
 * Usage:
 *   node scripts/prefetch-details.mjs          # 미캐시 항목 전체 수집
 *   node scripts/prefetch-details.mjs --force  # 전체 재수집 (캐시 무시)
 *   node scripts/prefetch-details.mjs --dry    # 수집 대상 목록만 출력 (실제 호출 안 함)
 */
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DATA_GO_KR_KEY = process.env.DATA_GO_KR_SERVICE_KEY
const API_BASE = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DATA_GO_KR_KEY) {
  console.error('❌ 필수 환경변수 누락: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATA_GO_KR_SERVICE_KEY')
  process.exit(1)
}

const BATCH = 5         // 동시 처리 수 (쿼터 절약: 10→5)
const BATCH_DELAY = 2000 // 배치 간 딜레이 ms (429 방지: 1s→2s)

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY = args.includes('--dry')

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

/**
 * 단일 servId 상세 조회
 * @returns {object|null|'QUOTA'} 성공 시 row객체, 실패 시 null, 쿼터초과 시 'QUOTA'
 */
async function fetchDetail(servId) {
  const url = `${API_BASE}/NationalWelfaredetailedV001?serviceKey=${DATA_GO_KR_KEY}&callTp=D&servId=${servId}`
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(2000)
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 8000)
      let res
      try { res = await fetch(url, { signal: ctrl.signal }) }
      finally { clearTimeout(t) }

      // ★ 쿼터 초과: 즉시 상위에 알림
      if (res.status === 429) {
        const body = await res.text().catch(() => '')
        console.error(`❌ [${servId}] 429 쿼터 초과 — ${body.substring(0, 100)}`)
        return 'QUOTA'
      }

      if (!res.ok) {
        console.warn(`⚠ [${servId}] HTTP ${res.status} (attempt ${attempt + 1})`)
        continue
      }

      const xml = await res.text()
      if (!xml || xml.length < 50) {
        console.warn(`⚠ [${servId}] 빈 응답 (attempt ${attempt + 1})`)
        continue
      }

      const rc = getXmlValue(xml, 'resultCode')
      if (rc && rc !== '0' && rc !== '00') {
        console.warn(`⚠ [${servId}] resultCode=${rc}: ${getXmlValue(xml, 'resultMessage')}`)
        continue
      }

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
    } catch (e) {
      const msg = e?.name === 'AbortError' ? 'Timeout' : e?.message
      console.warn(`⚠ [${servId}] Error: ${msg} (attempt ${attempt + 1})`)
    }
  }
  return null
}

async function main() {
  console.log(`🚀 Prefetch 시작 (${FORCE ? 'FORCE' : 'incremental'}${DRY ? ' DRY' : ''})`)
  console.log(`   배치: ${BATCH}개 동시, ${BATCH_DELAY}ms 간격`)

  // 1. 전체 목록 수집
  const listUrl = `${API_BASE}/NationalWelfarelistV001?serviceKey=${DATA_GO_KR_KEY}&callTp=L&srchKeyCode=001&pageNo=1&numOfRows=999`
  const listRes = await fetch(listUrl)
  if (!listRes.ok) {
    if (listRes.status === 429) {
      console.error('❌ 목록 API도 429 쿼터 초과. 자정(KST) 이후 재시도하세요.')
      process.exit(1)
    }
    console.error(`❌ 목록 API 실패: HTTP ${listRes.status}`)
    process.exit(1)
  }
  const xml = await listRes.text()
  const matches = xml.match(/<servId>([^<]+)<\/servId>/g) ?? []
  const allIds = matches.map(m => m.replace(/<\/?servId>/g, '').trim()).filter(Boolean)
  console.log(`📋 전체 ID: ${allIds.length}개`)

  // 2. 기존 캐시 확인 (FORCE면 스킵)
  let toFetch = allIds
  if (!FORCE) {
    const { data: cached, error: cacheErr } = await supabase
      .from('welfare_details')
      .select('serv_id')
    if (cacheErr) {
      console.error('❌ Supabase 캐시 조회 실패:', cacheErr.message)
      process.exit(1)
    }
    const cachedSet = new Set((cached ?? []).map(r => r.serv_id))
    toFetch = allIds.filter(id => !cachedSet.has(id))
    console.log(`✅ 캐시: ${cachedSet.size}개, 신규 수집 대상: ${toFetch.length}개`)
  }

  if (toFetch.length === 0) {
    console.log('✨ 모든 항목이 이미 캐시됨. 완료.')
    process.exit(0)
  }

  if (DRY) {
    console.log('📋 DRY RUN — 수집 대상 목록:')
    toFetch.forEach(id => console.log(' -', id))
    process.exit(0)
  }

  // 3. 배치 처리
  let success = 0, fail = 0, quotaHit = false
  const startTime = Date.now()

  for (let i = 0; i < toFetch.length; i += BATCH) {
    if (quotaHit) break

    const batch = toFetch.slice(i, i + BATCH)
    const results = await Promise.all(batch.map(fetchDetail))

    // 쿼터 초과 감지
    if (results.includes('QUOTA')) {
      quotaHit = true
      console.error('\n🚫 쿼터 초과 감지! 수집 중단.')
      console.error(`   진행: ${i}/${toFetch.length} (${Math.round(i / toFetch.length * 100)}%)`)
      console.error('   자정(KST 00:00) 이후 재실행하면 중단 지점부터 이어서 수집됩니다.')
      break
    }

    const rows = results.filter(r => r && r !== 'QUOTA')
    if (rows.length > 0) {
      const { error } = await supabase
        .from('welfare_details')
        .upsert(rows, { onConflict: 'serv_id' })
      if (error) {
        console.error(`❌ Supabase upsert 실패:`, error.message)
        fail += batch.length
      } else {
        success += rows.length
        fail += batch.length - rows.length
      }
    } else {
      fail += batch.length
    }

    const done = Math.min(i + BATCH, toFetch.length)
    const pct = Math.round(done / toFetch.length * 100)
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    const eta = elapsed > 0 ? Math.round((toFetch.length - done) / done * elapsed) : '?'
    process.stdout.write(`\r[${pct}%] ${done}/${toFetch.length} — ✅ ${success} ❌ ${fail} | 경과: ${elapsed}s ETA: ${eta}s`)

    if (i + BATCH < toFetch.length && !quotaHit) await sleep(BATCH_DELAY)
  }

  console.log(`\n\n✨ 완료! ✅ ${success}개 저장, ❌ ${fail}개 실패`)
  if (quotaHit) {
    console.log('⚠ 쿼터 초과로 일부 미수집. 내일 재실행 필요.')
    process.exit(2) // exit code 2 = partial
  }
  process.exit(0)
}

main().catch(e => { console.error('❌ 치명 오류:', e.message); process.exit(1) })
