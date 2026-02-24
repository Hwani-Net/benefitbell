import { NextResponse } from 'next/server'

const API_BASE = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001'

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

// Clean up text from API (remove excessive whitespace, keep line breaks meaningful)
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
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

  if (!DATA_GO_KR_SERVICE_KEY || DATA_GO_KR_SERVICE_KEY === 'placeholder') {
    return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 })
  }

  const apiUrl = `${API_BASE}/NationalWelfaredetailedV001?serviceKey=${DATA_GO_KR_SERVICE_KEY}&callTp=D&servId=${servId}`

  // 3회 재시도 + 지수 백오프 (data.go.kr 간헐적 502 대응)
  let lastError: string = 'Unknown error'
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, attempt * 600)) // 600ms, 1200ms
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000) // 8초 timeout

      let response: Response
      try {
        response = await fetch(apiUrl, {
          signal: controller.signal,
          next: { revalidate: 86400 },
        })
      } finally {
        clearTimeout(timeout)
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
        // Required documents
        requiredDocs: getXmlValues(xml, 'basfrmList', 'servSeDetailNm'),
        // Related laws
        relatedLaws: getXmlValues(xml, 'baslawList', 'servSeDetailNm'),
        // Inquiry homepage
        homepages: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailNm')
          .map((name, i) => ({
            name,
            url: getXmlValues(xml, 'inqplHmpgReldList', 'servSeDetailLink')[i] || '',
          })),
      }

      return NextResponse.json({ success: true, data: detail, source: 'api' })

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
