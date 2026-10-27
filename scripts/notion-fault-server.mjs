// 테스트 전용 가짜 노션 서버. 429(요청 제한)와 응답 없음(타임아웃)을 재현한다.
// 사용법: node scripts/notion-fault-server.mjs <rate-limit|hang> [port]
// 앱은 NOTION_BASE_URL=http://localhost:<port> 로 띄워서 이 서버를 바라보게 한다.
import http from 'node:http'

const mode = process.argv[2]
const port = Number(process.argv[3] ?? 4010)

if (mode !== 'rate-limit' && mode !== 'hang') {
  console.error('mode는 rate-limit 또는 hang 이어야 합니다.')
  process.exit(1)
}

const server = http.createServer((req, res) => {
  if (mode === 'hang') {
    // 응답하지 않는다. SDK의 timeoutMs가 지나면 타임아웃 오류가 된다.
    return
  }
  // rate-limit: 노션 API의 429 응답 형식과 같게 돌려준다. retry-after 0으로 SDK 재시도 간격을 줄인다.
  res.writeHead(429, {
    'Content-Type': 'application/json',
    'Retry-After': '0',
  })
  res.end(
    JSON.stringify({
      object: 'error',
      status: 429,
      code: 'rate_limited',
      message: 'Rate limited (test server).',
    })
  )
})

server.listen(port, () => {
  console.log(`fault server: mode=${mode} port=${port}`)
})
