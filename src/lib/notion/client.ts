import 'server-only'

import { Client } from '@notionhq/client'

import { env, getNotionEnv } from '@/lib/env'

// 설치된 SDK(5.28.0)의 기본값과 같은 API 버전을 명시한다. SDK를 올려도 응답 형태가 바뀌지 않게 고정한다.
export const NOTION_VERSION = '2025-09-03'
// 노션 응답이 이 시간을 넘기면 연동 오류로 본다 (Task 013에서 조정).
export const NOTION_TIMEOUT_MS = 10_000
// SDK 기본값과 같다. 직접 재시도 루프를 만들지 않고 SDK 옵션으로만 조정한다.
export const NOTION_MAX_RETRIES = 2

let client: Client | null = null

// 환경변수는 첫 호출 때 읽는다. 모듈 로드 시점에 읽으면 키가 없는 상태에서 빌드가 실패한다.
export function getNotionClient(): Client {
  if (client) return client

  const { apiKey } = getNotionEnv()
  client = new Client({
    auth: apiKey,
    notionVersion: NOTION_VERSION,
    timeoutMs: NOTION_TIMEOUT_MS,
    retry: { maxRetries: NOTION_MAX_RETRIES },
    // 테스트 전용 주소가 설정된 경우에만 기본 노션 주소를 바꾼다. 운영에서는 설정하지 않는다.
    ...(env.NOTION_BASE_URL ? { baseUrl: env.NOTION_BASE_URL } : {}),
  })
  return client
}
