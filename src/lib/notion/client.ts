import 'server-only'

import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'

import { Client } from '@notionhq/client'

import { env, getNotionEnv } from '@/lib/env'

// 설치된 SDK(5.28.0)의 기본값과 같은 API 버전을 명시한다. SDK를 올려도 응답 형태가 바뀌지 않게 고정한다.
export const NOTION_VERSION = '2025-09-03'
// 노션 응답이 이 시간을 넘기면 연동 오류로 본다 (Task 013에서 조정).
export const NOTION_TIMEOUT_MS = 10_000
// SDK 기본값과 같다. 직접 재시도 루프를 만들지 않고 SDK 옵션으로만 조정한다.
export const NOTION_MAX_RETRIES = 2

let client: Client | null = null

// Next.js는 같은 요청 안에서 GET fetch 결과를 묶어 재사용한다(dedupe). 그래서 SDK 재시도가
// 노션에 다시 나가지 않고 같은 실패 응답을 받는다. SDK에는 Next가 패치하지 않은 Node http(s)
// 기반 fetch를 넘겨서, 재시도마다 실제로 노션에 요청이 나가게 한다.
function notionFetch(
  input: string | URL,
  init: RequestInit = {}
): Promise<Response> {
  const url = new URL(String(input))
  const send = url.protocol === 'https:' ? httpsRequest : httpRequest

  return new Promise<Response>((resolve, reject) => {
    const req = send(
      url,
      {
        method: init.method ?? 'GET',
        headers: init.headers as Record<string, string> | undefined,
      },
      res => {
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => chunks.push(chunk))
        res.on('end', () => {
          const headers = new Headers()
          for (const [key, value] of Object.entries(res.headers)) {
            if (value === undefined) continue
            headers.set(key, Array.isArray(value) ? value.join(', ') : value)
          }
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode ?? 500,
              headers,
            })
          )
        })
      }
    )
    req.on('error', reject)
    init.signal?.addEventListener('abort', () =>
      req.destroy(new Error('request aborted'))
    )
    if (init.body !== undefined && init.body !== null) {
      req.write(init.body as string | Uint8Array)
    }
    req.end()
  })
}

// 환경변수는 첫 호출 때 읽는다. 모듈 로드 시점에 읽으면 키가 없는 상태에서 빌드가 실패한다.
export function getNotionClient(): Client {
  if (client) return client

  const { apiKey } = getNotionEnv()
  client = new Client({
    auth: apiKey,
    notionVersion: NOTION_VERSION,
    timeoutMs: NOTION_TIMEOUT_MS,
    retry: { maxRetries: NOTION_MAX_RETRIES },
    fetch: notionFetch,
    // 테스트 전용 주소가 설정된 경우에만 기본 노션 주소를 바꾼다. 운영에서는 설정하지 않는다.
    ...(env.NOTION_BASE_URL ? { baseUrl: env.NOTION_BASE_URL } : {}),
  })
  return client
}
