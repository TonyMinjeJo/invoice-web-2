import 'server-only'

import {
  APIErrorCode,
  type PageObjectResponse,
  isFullDatabase,
  isFullPage,
  isNotionClientError,
} from '@notionhq/client'

import { getNotionEnv } from '@/lib/env'
import type { Quote, QuoteItem } from '@/lib/estimate/types'

import { getNotionClient } from './client'
import {
  INVOICE_PROPS,
  ITEM_PROPS,
  buildQuote,
  mapInvoiceFields,
  mapItem,
} from './estimate-schema'

export type EstimateResult =
  | { kind: 'ok'; quote: Quote }
  | { kind: 'notFound' }
  | { kind: 'invalid'; fields: string[] }

// 공유 식별자는 노션 페이지 ID다. 하이픈 유무와 대소문자를 정규화하고, 형식이 맞지 않으면 null이다.
export function normalizeShareId(input: string): string | null {
  const id = input.replace(/-/g, '').toLowerCase()
  return /^[0-9a-f]{32}$/.test(id) ? id : null
}

interface DataSourceIds {
  invoices: string
  items: string
}

// 견적서 DB의 데이터 소스 ID와 항목 DB의 데이터 소스 ID를 찾는다.
// 항목 DB ID는 환경변수 없이 invoices의 '항목' 관계 속성 설정에서 읽는다.
// 실패하면 다음 호출에서 다시 시도하도록 캐시를 비운다.
let sourceIds: Promise<DataSourceIds> | null = null

export function resolveDataSourceIds(): Promise<DataSourceIds> {
  if (!sourceIds) {
    sourceIds = (async () => {
      const notion = getNotionClient()
      const { databaseId } = getNotionEnv()

      const database = await notion.databases.retrieve({
        database_id: databaseId,
      })
      if (!isFullDatabase(database)) {
        throw new Error('노션 데이터베이스 정보를 읽을 수 없습니다')
      }
      const invoicesId = database.data_sources[0]?.id
      if (!invoicesId) {
        throw new Error('노션 데이터베이스에 데이터 소스가 없습니다')
      }

      const source = await notion.dataSources.retrieve({
        data_source_id: invoicesId,
      })
      const relation = source.properties[INVOICE_PROPS.items]
      if (!relation || relation.type !== 'relation') {
        throw new Error(`관계 속성을 찾을 수 없습니다: ${INVOICE_PROPS.items}`)
      }

      return {
        invoices: invoicesId,
        items: relation.relation.data_source_id,
      }
    })().catch(error => {
      sourceIds = null
      throw error
    })
  }
  return sourceIds
}

// Items 데이터 소스에서 이 견적서에 연결된 행을 모두 읽는다 (100개 단위 페이지네이션).
async function listItems(
  itemsSourceId: string,
  invoiceId: string
): Promise<{ ok: true; items: QuoteItem[] } | { ok: false; fields: string[] }> {
  const notion = getNotionClient()
  const items: QuoteItem[] = []
  const invalidFields = new Set<string>()
  let cursor: string | undefined

  do {
    const response = await notion.dataSources.query({
      data_source_id: itemsSourceId,
      result_type: 'page',
      filter: {
        property: ITEM_PROPS.invoices,
        relation: { contains: invoiceId },
      },
      sorts: [{ timestamp: 'created_time', direction: 'ascending' }],
      page_size: 100,
      start_cursor: cursor,
    })

    for (const row of response.results) {
      if (!isFullPage(row)) continue
      const mapped = mapItem(row as PageObjectResponse)
      if (mapped.kind === 'skip') continue
      if (mapped.kind === 'invalid') {
        mapped.fields.forEach(field => invalidFields.add(`항목.${field}`))
        continue
      }
      items.push(mapped.item)
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined
  } while (cursor)

  if (invalidFields.size > 0) {
    return { ok: false, fields: [...invalidFields] }
  }
  return { ok: true, items }
}

// 공유 식별자 하나로 견적서 한 건을 조회한다.
// 견적서 DB에 속하지 않는 페이지는 존재하지 않는 것과 같이 notFound로 돌려준다.
export async function getEstimate(shareId: string): Promise<EstimateResult> {
  const id = normalizeShareId(shareId)
  if (!id) return { kind: 'notFound' }

  const notion = getNotionClient()
  const sources = await resolveDataSourceIds()

  // SDK는 하이픈이 있는 UUID 형식만 받는다. 정규화된 32자리 값을 UUID로 바꿔 넘긴다.
  const pageId = [
    id.slice(0, 8),
    id.slice(8, 12),
    id.slice(12, 16),
    id.slice(16, 20),
    id.slice(20),
  ].join('-')

  let page
  try {
    page = await notion.pages.retrieve({ page_id: pageId })
  } catch (error) {
    if (
      isNotionClientError(error) &&
      'code' in error &&
      error.code === APIErrorCode.ObjectNotFound
    ) {
      return { kind: 'notFound' }
    }
    throw error
  }

  if (
    !isFullPage(page) ||
    page.parent.type !== 'data_source_id' ||
    page.parent.data_source_id !== sources.invoices
  ) {
    return { kind: 'notFound' }
  }

  const header = mapInvoiceFields(page)
  if (!header.ok) return { kind: 'invalid', fields: header.fields }

  const items = await listItems(sources.items, page.id)
  if (!items.ok) return { kind: 'invalid', fields: items.fields }

  return {
    kind: 'ok',
    quote: buildQuote(page, header.value, items.items),
  }
}
