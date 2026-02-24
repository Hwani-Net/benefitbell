// 포털 샘플 URL 기반 최종 테스트
const serviceKey = 'ccb9d17949e5cb97d8349992b505b64d97f95b889afd6387c0d919038dfddc1e'
const BASE = 'https://apis.data.go.kr/B554287/NationalWelfareInformationsV001'

function xmlGet(text, tag) {
  const m = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  return m ? m[1].trim() : null
}

// [A] 포털 샘플 URL 그대로 (callTp=L, srchKeyCode=001 포함)
console.log('[A] 포털 샘플 URL (callTp=L, srchKeyCode=001) ...')
try {
  const url = `${BASE}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&pageNo=1&numOfRows=3&srchKeyCode=001`
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
  const text = await res.text()
  console.log(`status: ${res.status} | 응답길이: ${text.length}`)
  const total = xmlGet(text, 'totalCount')
  const code = xmlGet(text, 'resultCode')
  const msg = xmlGet(text, 'resultMessage')
  const firstId = xmlGet(text, 'servId')
  const firstName = xmlGet(text, 'servNm')
  console.log(`resultCode: ${code} | totalCount: ${total} | msg: ${msg}`)
  if (firstId) console.log(`✅ 첫 번째: ${firstId} / ${firstName}`)
  else console.log('응답 앞 300자:')
  console.log(text.substring(0, 300))
} catch(e) {
  console.log(`❌ 에러: ${e.message}`)
}

// [B] 최소 파라미터 (callTp=L만)
console.log('\n[B] callTp=L 만 (다른 파라미터 없음) ...')
try {
  const url = `${BASE}/NationalWelfarelistV001?serviceKey=${serviceKey}&callTp=L&pageNo=1&numOfRows=3`
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
  const text = await res.text()
  const code = xmlGet(text, 'resultCode')
  const total = xmlGet(text, 'totalCount')
  const msg = xmlGet(text, 'resultMessage')
  const firstId = xmlGet(text, 'servId')
  console.log(`resultCode: ${code} | total: ${total} | msg: ${msg} | firstId: ${firstId}`)
} catch(e) {
  console.log(`❌ 에러: ${e.message}`)
}

// [C] 상세 API (포털 샘플 servId: WLF00001138)
console.log('\n[C] 상세 API (callTp=D, servId=WLF00001138) ...')
try {
  const url = `${BASE}/NationalWelfaredetailedV001?serviceKey=${serviceKey}&callTp=D&servId=WLF00001138`
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
  const text = await res.text()
  const code = xmlGet(text, 'resultCode')
  const name = xmlGet(text, 'servNm')
  const msg = xmlGet(text, 'resultMessage')
  console.log(`resultCode: ${code} | servNm: ${name} | msg: ${msg}`)
} catch(e) {
  console.log(`❌ 에러: ${e.message}`)
}
