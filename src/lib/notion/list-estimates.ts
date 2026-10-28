import 'server-only'

import {
  isFullPage,
  isNotionClientError,
  type PageObjectResponse,
} from '@notionhq/client'

import { requireAdminSession } from '@/lib/admin/session'
import { getQuoteAvailability } from '@/lib/estimate/availability'
import { todayInSeoul } from '@/lib/estimate/date'
import type {
  EstimateListItem,
  EstimateListStatusLabel,
} from '@/lib/estimate/types'

import { getNotionClient } from './client'
import {
  INVOICE_PROPS,
  buildQuote,
  mapInvoiceFields,
  readDate,
  readOptionName,
  readText,
} from './estimate-schema'
import { resolveDataSourceIds } from './get-estimate'
import { classifyError, type ViewErrorReason } from './get-published-quote'

// 관리자 목록 조회 결과. 노션 오류는 원본 메시지 없이 종류만 돌려준다.
export type ListEstimatesResult =
  | { kind: 'ok'; items: EstimateListItem[] }
  | { kind: 'error'; reason: ViewErrorReason }

// 노션 상태 옵션 '거절'은 대기와 구분해 보여준다. 둘 다 임시(draft)로 판정된다.
const STATUS_REJECTED_NAME = '거절'

function toListItem(page: PageObjectResponse, today: string): EstimateListItem {
  const mapped = mapInvoiceFields(page)

  if (!mapped.ok) {
    // 누락 필드명만 서버 로그에 남기고 값은 남기지 않는다.
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'estimate_list_incomplete',
        fields: mapped.fields,
        id: page.id.slice(0, 8),
      })
    )
    const props = page.properties
    return {
      id: page.id,
      quoteNumber: readText(props[INVOICE_PROPS.quoteNumber]),
      clientName: readText(props[INVOICE_PROPS.clientName]),
      issueDate: readDate(props[INVOICE_PROPS.issueDate]),
      validUntil: readDate(props[INVOICE_PROPS.validUntil]),
      status: 'incomplete',
      statusLabel: '정보 누락',
      missingFields: mapped.fields,
    }
  }

  const quote = buildQuote(page, mapped.value, [])
  const availability = getQuoteAvailability(quote, today)

  let status: EstimateListItem['status']
  let statusLabel: EstimateListStatusLabel
  if (availability === 'available') {
    status = 'issued'
    statusLabel = '승인'
  } else if (availability === 'expired') {
    status = 'expired'
    statusLabel = '만료됨'
  } else {
    status = 'draft'
    statusLabel =
      readOptionName(page.properties[INVOICE_PROPS.status]) ===
      STATUS_REJECTED_NAME
        ? '거절'
        : '대기'
  }

  return {
    id: page.id,
    quoteNumber: quote.quoteNumber,
    clientName: quote.clientName,
    issueDate: quote.issueDate,
    validUntil: quote.validUntil,
    status,
    statusLabel,
    missingFields: [],
  }
}

// 견적서 DB 전체를 발행일 내림차순으로 읽는다. 캐시하지 않고 금액은 조회하지 않는다 (G2, G3).
// 노션 호출은 데이터 소스 조회 ceil(N/100)회이고, 데이터 소스 ID 해석은 프로세스 안에서 한 번만 한다.
export async function listEstimates(): Promise<ListEstimatesResult> {
  // 레이아웃과 별개로 데이터 함수에서도 세션을 확인한다 (인증 없이 목록을 읽지 못하게).
  await requireAdminSession()

  try {
    const notion = getNotionClient()
    const sources = await resolveDataSourceIds()
    const today = todayInSeoul()
    const items: EstimateListItem[] = []
    let cursor: string | undefined

    do {
      const response = await notion.dataSources.query({
        data_source_id: sources.invoices,
        result_type: 'page',
        sorts: [{ property: INVOICE_PROPS.issueDate, direction: 'descending' }],
        page_size: 100,
        start_cursor: cursor,
      })

      for (const row of response.results) {
        if (!isFullPage(row)) continue
        items.push(toListItem(row, today))
      }

      cursor = response.has_more
        ? (response.next_cursor ?? undefined)
        : undefined
    } while (cursor)

    return { kind: 'ok', items }
  } catch (error) {
    const code = isNotionClientError(error)
      ? error.code
      : error instanceof Error
        ? error.name
        : 'unknown'
    console.error(
      JSON.stringify({ level: 'error', event: 'estimate_list_failed', code })
    )
    return { kind: 'error', reason: classifyError(error) }
  }
}
