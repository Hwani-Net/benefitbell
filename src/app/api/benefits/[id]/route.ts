import { NextResponse } from 'next/server'
import { getAdminFirestore } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

const API_BASE = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24시간

// ─── In-memory cache for detail API responses ───
const detailCache = new Map<string, { data: unknown; timestamp: number }>()
const MEM_CACHE_TTL = 60 * 60 * 1000 // 1시간 인메모리

function getXmlValue(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)
  const m = regex.exec(xml)
  return m ? m[1].trim() : ''
}

function getXmlValues(xml: string, parentTag: string, childTag: string): string[] {
  const parentRegex = new RegExp(`<${parentTag}>([\\s\\S]*?)</${parentTag}>`, 'g')
  const results: string[] = []
  let parentMatch
  while ((parentMatch = parentRegex.exec(xml)) !== null) {
    const val = getXmlValue(parentMatch[1], childTag)
    if (val) results.push(val)
  }
  return results
}

// Clean up text from API (strip HTML tags, decode entities, normalize whitespace)
function cleanText(text: string): string {
  return text
    // 1. Block-level HTML tags → newline (before stripping, so structure is preserved)
    .replace(/<\/(p|div|li|tr|h[1-6])\s*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // 2. Remove all remaining HTML tags (including inline styles, attributes)
    .replace(/<[^>]*>/g, '')
    // 3. Decode common HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    // 4. Normalize whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    // 5. Clean up leading/trailing whitespace per line
    .split('\n').map(l => l.trim()).join('\n')
    .trim()
}

/** Firestore 행 → API response shape 변환 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToDetail(row: any, id: string, servId: string) {
  return {
    id, servId,
    title:              row.title,
    ministry:           row.ministry,
    phone:              row.phone,
    year:               row.year,
    supportCycle:       row.support_cycle,
    supportType:        row.support_type,
    overview:           row.overview,
    targetDetail:       row.target_detail,
    selectionCriteria:  row.selection_criteria,
    supportContent:     row.support_content,
    applyBgnDt:         row.apply_bgn_dt,
    applyEndDt:         row.apply_end_dt,
    lifeStages:         row.life_stages,
    targetGroups:       row.target_groups,
    themes:             row.themes,
    applicationMethods: row.application_methods ?? [],
    applicationLinks:   row.application_links ?? [],
    contacts:           row.contacts ?? [],
    requiredDocs:       row.required_docs ?? [],
    relatedLaws:        row.related_laws ?? [],
    homepages:          row.homepages ?? [],
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const DATA_GO_KR_SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY

  // Extract the actual servId (servId 형식: WLF00000024 or api-WLF00000024)
  const servId = id.startsWith('api-') ? id.replace('api-', '') : id

  if (!servId || servId === 'api-') {
    return NextResponse.json({ success: false, error: 'Invalid benefit ID' }, { status: 400 })
  }

  // ─── 0. In-memory cache (fastest) ───
  const memCached = detailCache.get(servId)
  if (memCached && Date.now() - memCached.timestamp < MEM_CACHE_TTL) {
    return NextResponse.json({ success: true, data: memCached.data, source: 'mem_cache' })
  }

  // ──────────────────────────────────────────
  // 1. Firestore 캐시 먼저 확인 (24시간 TTL)
  // ──────────────────────────────────────────
  try {
    const db = getAdminFirestore()
    const cacheDoc = await db.collection('benefit_cache').doc(servId).get()
    if (cacheDoc.exists) {
      const cached = cacheDoc.data()!
      const cachedAt = cached.fetched_at?.toDate?.() ?? new Date(0)
      const age = Date.now() - cachedAt.getTime()
      if (age < CACHE_TTL_MS) {
        const detail = rowToDetail(cached.data, id, servId)
        detailCache.set(servId, { data: detail, timestamp: Date.now() })
        return NextResponse.json({
          success: true,
          data: detail,
          source: 'cache',
        })
      }
    }
  } catch {
    // Firestore 오류 시 API 호출로 진행
  }

  if (!DATA_GO_KR_SERVICE_KEY || DATA_GO_KR_SERVICE_KEY === 'placeholder') {
    return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 })
  }

  const apiUrl = `${API_BASE}/NationalWelfaredetailedV001?serviceKey=${DATA_GO_KR_SERVICE_KEY}&callTp=D&servId=${servId}`

  // 3회 재시도 + 지수 백오프 (data.go.kr 간헐적 502 대응)
  let lastError: string = 'Unknown error'
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      // 429 Rate Limit: 3초 대기, 기타 오류: 800ms/1600ms
      const delay = lastError.includes('429') ? 3000 : attempt * 800
      await new Promise(r => setTimeout(r, delay))
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000) // 8초 timeout

      let response: Response
      try {
        response = await fetch(apiUrl, {
          signal: controller.signal,
          cache: 'no-store', // 실패 응답 캐시 방지
        })
      } finally {
        clearTimeout(timeout)
      }

      if (response.status === 429) {
        lastError = '429 Rate Limit'
        continue
      }

      if (!response.ok) {
        lastError = `HTTP ${response.status}`
        continue // 재시도
      }

      const xml = await response.text()
      if (!xml || xml.length < 50) {
        lastError = 'Empty response'
        continue
      }

      // resultCode 체크 — 00 또는 0이 정상
      const resultCode = getXmlValue(xml, 'resultCode')
      if (resultCode && resultCode !== '0' && resultCode !== '00') {
        const msg = getXmlValue(xml, 'resultMessage') || `resultCode: ${resultCode}`
        // 30 = 데이터 없음 (존재하지 않는 ID) — 재시도 불필요
        if (resultCode === '30' || resultCode === '99') {
          return NextResponse.json({ success: false, error: msg }, { status: 404 })
        }
        lastError = msg
        continue
      }

      // Parse detailed benefit info
      const detail = {
        id,
        servId,
        title: getXmlValue(xml, 'servNm'),
        ministry: getXmlValue(xml, 'jurMnofNm'),
        phone: getXmlValue(xml, 'rprsCtadr'),
        year: getXmlValue(xml, 'crtrYr'),
        supportCycle: getXmlValue(xml, 'sprtCycNm'),
        supportType: getXmlValue(xml, 'srvPvsnNm'),
        // Detailed content fields
        overview: cleanText(getXmlValue(xml, 'wlfareInfoOutlCn')),
        targetDetail: cleanText(getXmlValue(xml, 'tgtrDtlCn')),
        selectionCriteria: cleanText(getXmlValue(xml, 'slctCritCn')),
        supportContent: cleanText(getXmlValue(xml, 'alwServCn')),
        // Apply dates
        applyBgnDt: getXmlValue(xml, 'aplyBgnDd'),
        applyEndDt: getXmlValue(xml, 'aplyEndDd'),
        // Array fields
        lifeStages: getXmlValue(xml, 'lifeArray'),
        targetGroups: getXmlValue(xml, 'trgterIndvdlArray'),
        themes: getXmlValue(xml, 'intrsThemaArray'),
        // Application methods
        applicationMethods: getXmlValues(xml, 'applmetList', 'servSeDetailNm'),
        applicationLinks: getXmlValues(xml, 'applmetList', 'servSeDetailLink'),
        // Inquiry contacts
        contacts: getXmlValues(xml, 'inqplCtadrList', 'servSeDetailNm')
          .map((name, i) => ({
            name,
            address: getXmlValues(xml, 'inqplCtadrList', 'servSeDetailLink')[i] || '',
          })),
        // Required documents (name + download link)
        requiredDocs: getXmlValues(xml, 'basfrmList', 'servSeDetailNm')
          .map((name, i) => ({
            name,
            link: getXmlValues(xml, 'basfrmList', 'servSeDetailLink')[i] || '',
          })),
        // Related laws
        relatedLaws: getXmlValues(xml, 'baslawList', 'servSeDetailNm'),
        // Inquiry homepage
        homepages: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailNm')
          .map((name, i) => ({
            name,
            url: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailLink')[i] || '',
          })),
      }

      // Save to in-memory cache
      detailCache.set(servId, { data: detail, timestamp: Date.now() })

      return NextResponse.json({ success: true, data: detail, source: 'api' })
      // NOTE: Firestore 저장은 응답 반환 후 백그라운드로 (fire-and-forget)
      // getAdminFirestore().collection('benefit_cache').doc(servId).set({ data: detail, fetched_at: FieldValue.serverTimestamp() })

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      lastError = msg.includes('abort') ? 'Timeout' : msg
      // 타임아웃이면 재시도
    }
  }

  // 3회 모두 실패
  console.error(`[/api/benefits/${servId}] All 3 attempts failed. Last: ${lastError}`)
  return NextResponse.json(
    { success: false, error: `Failed after 3 attempts: ${lastError}` },
    { status: 502 }
  )
}
