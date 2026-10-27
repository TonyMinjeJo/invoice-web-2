import type { PageObjectResponse } from '@notionhq/client'
import { z } from 'zod'

import type { Quote, QuoteItem, QuoteStatus } from '@/lib/estimate/types'

// 노션 속성 이름. docs/tasks/003-notion-schema-design.md 매핑표 기준이다.
export const INVOICE_PROPS = {
  quoteNumber: '견적서 번호',
  clientName: '클라이언트명',
  issueDate: '발행일',
  validUntil: '유효기간',
  status: '상태',
  notionTotalAmount: '총 금액',
  items: '항목',
} as const

export const ITEM_PROPS = {
  name: '항목명',
  quantity: '수량',
  unitPrice: '단가',
  invoices: 'invoices',
} as const

// 상태 옵션 '승인'을 발행(issued)으로 본다. 그 밖의 값(대기, 거절 등)은 draft다.
// 노션에 '발행' 옵션이 없어 '승인'을 발행 상태로 정했다 (사용자 확정).
export const STATUS_ISSUED_NAME = '승인'

type NotionProperty = PageObjectResponse['properties'][string]

function joinPlainText(items: Array<{ plain_text: string }>): string | null {
  const text = items
    .map(item => item.plain_text)
    .join('')
    .trim()
  return text === '' ? null : text
}

// 문자열로 읽는다. title, rich_text, number 속성을 지원한다. 그 밖의 타입은 null이다.
export function readText(prop: NotionProperty | undefined): string | null {
  if (!prop) return null
  switch (prop.type) {
    case 'title':
      return joinPlainText(prop.title)
    case 'rich_text':
      return joinPlainText(prop.rich_text)
    case 'number':
      return prop.number === null ? null : String(prop.number)
    default:
      return null
  }
}

// 숫자로 읽는다. number 속성과 숫자 formula를 지원한다.
export function readNumber(prop: NotionProperty | undefined): number | null {
  if (!prop) return null
  if (prop.type === 'number') return prop.number
  if (prop.type === 'formula' && prop.formula.type === 'number') {
    return prop.formula.number
  }
  return null
}

// 날짜의 시작값을 YYYY-MM-DD로 읽는다. 시간이 붙어 있으면 날짜 부분만 쓴다.
export function readDate(prop: NotionProperty | undefined): string | null {
  if (!prop || prop.type !== 'date' || !prop.date) return null
  return prop.date.start.slice(0, 10)
}

// status 또는 select 속성의 옵션 이름을 읽는다.
export function readOptionName(
  prop: NotionProperty | undefined
): string | null {
  if (!prop) return null
  if (prop.type === 'status') return prop.status?.name ?? null
  if (prop.type === 'select') return prop.select?.name ?? null
  return null
}

// relation 속성의 페이지 ID 목록을 읽는다.
export function readRelationIds(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== 'relation') return []
  return prop.relation.map(ref => ref.id)
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

// 견적서 헤더 검증. 실패한 필드 이름만 돌려주고 값은 담지 않는다.
export const InvoiceFieldsSchema = z.object({
  quoteNumber: z.string().min(1),
  clientName: z.string().min(1),
  issueDate: isoDate,
  validUntil: isoDate,
  notionTotalAmount: z.number().int().min(0).nullable(),
})

export type InvoiceFields = z.infer<typeof InvoiceFieldsSchema>

// 항목 검증. 정수 원 단위만 받는다.
export const ItemFieldsSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(0),
  unitPrice: z.number().int().min(0),
})

export type MapResult<T> =
  | { ok: true; value: T }
  | { ok: false; fields: string[] }

export function toQuoteStatus(name: string | null): QuoteStatus {
  return name === STATUS_ISSUED_NAME ? 'issued' : 'draft'
}

// invoices 페이지의 속성을 헤더 필드로 바꾼다.
export function mapInvoiceFields(
  page: PageObjectResponse
): MapResult<InvoiceFields & { status: QuoteStatus }> {
  const props = page.properties
  const raw = {
    quoteNumber: readText(props[INVOICE_PROPS.quoteNumber]),
    clientName: readText(props[INVOICE_PROPS.clientName]),
    issueDate: readDate(props[INVOICE_PROPS.issueDate]),
    validUntil: readDate(props[INVOICE_PROPS.validUntil]),
    notionTotalAmount: readNumber(props[INVOICE_PROPS.notionTotalAmount]),
  }

  const parsed = InvoiceFieldsSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      fields: parsed.error.issues.map(issue => String(issue.path[0])),
    }
  }

  return {
    ok: true,
    value: {
      ...parsed.data,
      status: toQuoteStatus(readOptionName(props[INVOICE_PROPS.status])),
    },
  }
}

// Items 페이지 한 행을 항목으로 바꾼다.
// 항목명, 수량, 단가가 모두 비어 있으면 빈 행으로 보고 버린다 (003 정제 규칙 1).
// 일부만 비어 있으면 검증 실패다 (003 정제 규칙 2).
export type ItemMapResult =
  | { kind: 'skip' }
  | { kind: 'ok'; item: QuoteItem }
  | { kind: 'invalid'; fields: string[] }

export function mapItem(page: PageObjectResponse): ItemMapResult {
  const props = page.properties
  const raw = {
    name: readText(props[ITEM_PROPS.name]),
    quantity: readNumber(props[ITEM_PROPS.quantity]),
    unitPrice: readNumber(props[ITEM_PROPS.unitPrice]),
  }

  if (raw.name === null && raw.quantity === null && raw.unitPrice === null) {
    return { kind: 'skip' }
  }

  const parsed = ItemFieldsSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      kind: 'invalid',
      fields: parsed.error.issues.map(issue => String(issue.path[0])),
    }
  }

  return {
    kind: 'ok',
    item: { id: page.id, ...parsed.data },
  }
}

// 헤더와 항목을 합쳐 Quote를 만든다. 금액 계산은 하지 않는다 (Task 004 calculate.ts 담당).
export function buildQuote(
  page: PageObjectResponse,
  header: InvoiceFields & { status: QuoteStatus },
  items: QuoteItem[]
): Quote {
  return {
    id: page.id,
    quoteNumber: header.quoteNumber,
    clientName: header.clientName,
    issueDate: header.issueDate,
    validUntil: header.validUntil,
    status: header.status,
    items,
    notionTotalAmount: header.notionTotalAmount,
  }
}
