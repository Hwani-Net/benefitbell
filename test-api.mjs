// API 테스트 스크립트 (PowerShell 없이 Node.js로 실행)
const serviceKey = 'ccb9d17949e5cb97d8349992b505b64d97f95b889afd6387c0d919038dfddc1e'
const BASE_URL = 'http://apis.data.go.kr/B554287/NationalWelfareInformationsV001'

// serviceKey를 인코딩 없이 직접 넣어서 테스트
const url1 = `${BASE_URL}/NationalWelfarelistV001?serviceKey=${serviceKey}&pageNo=1&numOfRows=5&_type=json`

// serviceKey를 encodeURIComponent로 인코딩해서 테스트
const url2 = `${BASE_URL}/NationalWelfarelistV001?serviceKey=${encodeURIComponent(serviceKey)}&pageNo=1&numOfRows=5&_type=json`

async function test(label, url) {
  try {
    console.log(`\n[${label}] Fetching...`)
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    console.log(`Status: ${res.status}`)
    const text = await res.text()
    console.log(`Response (first 500 chars): ${text.substring(0, 500)}`)
  } catch(e) {
    console.log(`Error: ${e.message}`)
  }
}

await test('원본 키', url1)
await test('encodeURIComponent 키', url2)
