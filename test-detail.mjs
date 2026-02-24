// 복지서비스 목록 + 상세 API 테스트
const serviceKey = 'ccb9d17949e5cb97d8349992b505b64d97f95b889afd6387c0d919038dfddc1e'
const BASE = 'http://apis.data.go.kr/B554287/NationalWelfareInformationsV001'

// 1. 목록 API (3건)
console.log('\n[1] 목록 API 테스트...')
try {
  const url = `${BASE}/NationalWelfarelistV001?serviceKey=${serviceKey}&pageNo=1&numOfRows=3&_type=json`
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
  const json = await res.json()
  const items = json?.wantedList?.body?.items?.item ?? []
  const total = json?.wantedList?.body?.totalCount ?? 0
  const firstServId = items[0]?.servId ?? null
  console.log(`status: ${res.status} | totalCount: ${total}`)
  console.log(`첫 번째 servId: ${firstServId} | servNm: ${items[0]?.servNm ?? 'N/A'}`)

  // 2. 해당 servId로 상세 API 테스트
  if (firstServId) {
    console.log(`\n[2] 상세 API 테스트 (servId: ${firstServId})...`)
    const detailUrl = `${BASE}/NationalWelfaredetailedV001?serviceKey=${serviceKey}&servId=${firstServId}`
    const detailRes = await fetch(detailUrl, { signal: AbortSignal.timeout(15000) })
    const detailText = await detailRes.text()
    const nameMatch = detailText.match(/<servNm>(.*?)<\/servNm>/)
    const codeMatch = detailText.match(/<resultCode>(.*?)<\/resultCode>/)
    console.log(`status: ${detailRes.status} | resultCode: ${codeMatch?.[1] ?? '?'} | servNm: ${nameMatch?.[1] ?? 'N/A'}`)
    if (!nameMatch) {
      console.log(`응답 앞 400자:\n${detailText.substring(0, 400)}`)
    }
  }
} catch(e) {
  console.log(`오류: ${e.message}`)
}

// 3. 로컬 Next.js 상세 API 테스트 (/api/benefits/:id)
console.log('\n[3] 로컬 Next.js /api/benefits/:id 테스트...')
try {
  // api- prefix 아이템 하나 먼저 목록에서 찾기
  const listRes = await fetch('http://localhost:3001/api/benefits', { signal: AbortSignal.timeout(20000) })
  const listJson = await listRes.json()
  const apiItem = listJson?.data?.find(b => b.id?.startsWith('api-'))
  const mockItem = listJson?.data?.find(b => !b.id?.startsWith('api-'))

  console.log(`목록 source: ${listJson.source} | total: ${listJson.data?.length}`)
  
  if (apiItem) {
    console.log(`api- 아이템 발견: ${apiItem.id} (${apiItem.title})`)
    const detailRes = await fetch(`http://localhost:3001/api/benefits/${apiItem.id}`, { signal: AbortSignal.timeout(15000) })
    const detailJson = await detailRes.json()
    console.log(`상세 응답 status: ${detailRes.status} | success: ${detailJson.success} | source: ${detailJson.source}`)
    if (detailJson.data?.title) console.log(`상세 title: ${detailJson.data.title}`)
  } else {
    console.log('api- prefix 아이템 없음 — 목록이 mock 전용')
  }

  if (mockItem) {
    const detailRes = await fetch(`http://localhost:3001/api/benefits/${mockItem.id}`, { signal: AbortSignal.timeout(10000) })
    const detailJson = await detailRes.json()
    console.log(`\nmock 아이템(${mockItem.id}) 상세: success=${detailJson.success} | source=${detailJson.source}`)
  }
} catch(e) {
  console.log(`로컬 API 오류: ${e.message}`)
}
