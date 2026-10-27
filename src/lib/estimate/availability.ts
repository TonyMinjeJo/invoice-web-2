// 견적서 조회 가능 여부 판단. 조회 가능 조건은 docs/tasks/003-notion-schema-design.md 기준이다.
import type { Quote } from '@/lib/estimate/types'

export type QuoteAvailability = 'available' | 'draft' | 'expired'

// 임시(draft) 상태는 조회할 수 없다. 유효기간이 지난 견적서도 조회할 수 없다.
// today는 'YYYY-MM-DD' 형식이다. 같은 날짜는 아직 유효한 것으로 본다.
export function getQuoteAvailability(
  quote: Quote,
  today: string
): QuoteAvailability {
  if (quote.status === 'draft') return 'draft'
  if (quote.validUntil < today) return 'expired'
  return 'available'
}
