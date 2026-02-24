import { NextResponse } from 'next/server'
import { BENEFITS } from '@/data/benefits'

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

  // If it's a mock item (non-api ID), return from local data
  if (!id.startsWith('api-')) {
    const mockItem = BENEFITS.find(b => b.id === id)
    if (!mockItem) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: mockItem, source: 'mock' })
  }

  // Extract the actual servId from "api-WLF00000024" format
  const servId = id.replace('api-', '')

  if (!DATA_GO_KR_SERVICE_KEY || DATA_GO_KR_SERVICE_KEY === 'placeholder') {
    return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 })
  }

  try {
    const apiUrl = `${API_BASE}/NationalWelfaredetailedV001?serviceKey=${DATA_GO_KR_SERVICE_KEY}&callTp=D&servId=${servId}`
    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours (detail data changes rarely)
    })

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'API error' }, { status: 502 })
    }

    const xml = await response.text()

    // Check for API error
    const resultCode = getXmlValue(xml, 'resultCode')
    if (resultCode !== '0' && resultCode !== '00') {
      return NextResponse.json({
        success: false,
        error: getXmlValue(xml, 'resultMessage') || 'API returned error',
      }, { status: 502 })
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

  } catch (error) {
    console.error('Detail API Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch detail' }, { status: 500 })
  }
}
