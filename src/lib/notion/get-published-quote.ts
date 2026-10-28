import 'server-only'

import { APIErrorCode, isNotionClientError } from '@notionhq/client'
import { unstable_cache } from 'next/cache'

import { getNotionCacheTtlSeconds } from '@/lib/env'
import { getQuoteAvailability } from '@/lib/estimate/availability'
import { todayInSeoul } from '@/lib/estimate/date'
import type { Quote } from '@/lib/estimate/types'

import { getEstimate, normalizeShareId } from './get-estimate'

// 노션 조회 결과를 TTL 동안 캐시한다. 예외는 캐시되지 않고 다음 요청에서 다시 조회한다.
function loadEstimate(id: string) {
  const ttl = getNotionCacheTtlSeconds()
  if (ttl === 0) return getEstimate(id)
  return unstable_cache(() => getEstimate(id), ['estimate', id], {
    revalidate: ttl,
  })()
}

// 연동 오류의 종류. rateLimited는 노션 요청 제한(429)을 SDK 재시도 후에도 받은 경우다.
// unavailable은 그 밖의 연동 실패(타임아웃, 잘못된 DB 설정, 값 검증 실패 등)다.
export type ViewErrorReason = 'rateLimited' | 'unavailable'

// 공개 조회 결과. 페이지와 PDF Route Handler가 이 함수 하나를 함께 쓴다.
// draft, expired, invalid는 금액과 항목을 담지 않는다.
// invalid는 노션 데이터가 필수 값 검증을 통과하지 못한 경우다 (실패한 필드 이름은 서버 로그에만 남긴다).
export type ViewResult =
  | { kind: 'found'; quote: Quote }
  | { kind: 'draft' }
  | { kind: 'expired' }
  | { kind: 'invalid' }
  | { kind: 'notFound' }
  | { kind: 'error'; reason: ViewErrorReason }

export function classifyError(error: unknown): ViewErrorReason {
  if (isNotionClientError(error) && error.code === APIErrorCode.RateLimited) {
    return 'rateLimited'
  }
  return 'unavailable'
}

// 서버 로그는 JSON 한 줄로 남긴다. 오류 코드와 식별자 앞 8자리만 쓰고, 원문 메시지와 전체 식별자는 남기지 않는다.
function logError(event: string, id: string, error: unknown): void {
  const code = isNotionClientError(error)
    ? error.code
    : error instanceof Error
      ? error.name
      : 'unknown'
  console.error(
    JSON.stringify({ level: 'error', event, code, id: id.slice(0, 8) })
  )
}

export async function getPublishedQuote(shareId: string): Promise<ViewResult> {
  const id = normalizeShareId(shareId)
  if (!id) return { kind: 'notFound' }

  try {
    const result = await loadEstimate(id)

    if (result.kind === 'notFound') return { kind: 'notFound' }
    if (result.kind === 'invalid') {
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'estimate_invalid',
          fields: result.fields,
          id: id.slice(0, 8),
        })
      )
      return { kind: 'invalid' }
    }

    const availability = getQuoteAvailability(result.quote, todayInSeoul())
    if (availability === 'draft') return { kind: 'draft' }
    if (availability === 'expired') return { kind: 'expired' }

    return { kind: 'found', quote: result.quote }
  } catch (error) {
    const reason = classifyError(error)
    logError(
      reason === 'rateLimited' ? 'notion_rate_limited' : 'estimate_load_failed',
      id,
      error
    )
    return { kind: 'error', reason }
  }
}
