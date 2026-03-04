/**
 * 민간복지서비스 CSV → JSON 변환 스크립트
 * 
 * 입력: 한국사회보장정보원_민간복지서비스정보_20251105.csv (EUC-KR)
 * 출력: src/data/private-welfare.json (UTF-8)
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const CSV_PATH = join(import.meta.dirname, '..', '한국사회보장정보원_민간복지서비스정보_20251105.csv')
const OUT_PATH = join(import.meta.dirname, '..', 'src', 'data', 'private-welfare.json')

// Read EUC-KR encoded CSV
const buf = readFileSync(CSV_PATH)
const text = new TextDecoder('euc-kr').decode(buf)

// Parse CSV (handle quoted fields with commas inside)
function parseCSVLine(line) {
  const fields = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

const lines = text.split('\n').filter(l => l.trim())
const header = parseCSVLine(lines[0])
console.log('Header columns:', header)
console.log('Data rows:', lines.length - 1)

const items = []
for (let i = 1; i < lines.length; i++) {
  const fields = parseCSVLine(lines[i])
  if (fields.length < 3) continue // skip malformed

  const obj = {}
  header.forEach((col, idx) => {
    obj[col.trim()] = (fields[idx] || '').replace(/\s+/g, ' ').trim()
  })

  // Skip entries with empty name
  if (!obj['사업명']) continue

  items.push({
    id: `PW-${i}`,
    orgName: obj['기관명'] || '',
    name: obj['사업명'] || '',
    startDate: obj['사업시작일'] || '',
    endDate: obj['사업종료일'] || '',
    purpose: obj['사업목적'] || '',
    target: obj['지원대상'] || '',
    content: obj['지원내용'] || '',
    howToApply: obj['신청방법'] || '',
    documents: obj['제출서류'] || '',
    etc: obj['기타'] || '',
    lifeCycle: obj['생애주기'] || '',
    household: obj['가구상황'] || '',
    interest: obj['관심주제'] || '',
  })
}

console.log(`Converted ${items.length} items`)
writeFileSync(OUT_PATH, JSON.stringify(items, null, 2), 'utf-8')
console.log(`Written to ${OUT_PATH}`)
