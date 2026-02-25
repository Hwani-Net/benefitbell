/**
 * 자정(KST) 이후 자동 prefetch 실행 스크립트
 * Usage: node scripts/prefetch-midnight.mjs
 *
 * KST = UTC+9, data.go.kr 쿼터는 UTC 기준 자정(KST 09:00)에 리셋된다는 설도 있으나
 * 실제 경험상 KST 자정(UTC 15:00) 또는 KST 아침(UTC 00:00)에 초기화됨.
 * 안전하게 KST 01:00(UTC 16:00)에 실행.
 */
import { execSync } from 'child_process'

function getKSTHour() {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return { h: kst.getUTCHours(), m: kst.getUTCMinutes(), s: kst.getUTCSeconds() }
}

function msTillTarget(targetHour = 1, targetMin = 0) {
  const now = Date.now()
  const kstNow = new Date(now + 9 * 60 * 60 * 1000)
  const kstTarget = new Date(kstNow)
  kstTarget.setUTCHours(targetHour, targetMin, 5, 0) // KST 01:00:05
  if (kstTarget.getTime() <= now + 9 * 60 * 60 * 1000) {
    kstTarget.setUTCDate(kstTarget.getUTCDate() + 1) // 내일로
  }
  const utcTarget = kstTarget.getTime() - 9 * 60 * 60 * 1000
  return utcTarget - now
}

async function main() {
  const { h, m } = getKSTHour()
  console.log(`🕐 현재 KST: ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)

  // 이미 오전 1시 이후면 바로 실행
  if (h >= 1 && h < 6) {
    console.log('✅ 쿼터 리셋 시간대. 바로 실행합니다.')
  } else {
    const waitMs = msTillTarget(1, 0)
    const waitMin = Math.round(waitMs / 60000)
    console.log(`⏳ KST 01:00까지 대기 중... (약 ${waitMin}분)`)
    console.log('   Ctrl+C로 취소 가능')

    // 1분마다 남은 시간 출력
    const interval = setInterval(() => {
      const { h: ch, m: cm } = getKSTHour()
      const remaining = msTillTarget(1, 0)
      process.stdout.write(`\r   남은 시간: ${Math.round(remaining / 60000)}분 (현재 KST ${String(ch).padStart(2,'0')}:${String(cm).padStart(2,'0')})  `)
    }, 60000)

    await new Promise(r => setTimeout(r, waitMs))
    clearInterval(interval)
    console.log('\n')
  }

  console.log('🚀 prefetch-details.mjs 실행 시작...')
  try {
    execSync('node scripts/prefetch-details.mjs', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('✅ 사전 수집 완료!')
  } catch (e) {
    const code = e.status
    if (code === 2) {
      console.warn('⚠ 쿼터 초과로 일부 미수집. 내일 재시도 필요.')
    } else {
      console.error('❌ 실행 실패:', e.message)
    }
  }
}

main()
