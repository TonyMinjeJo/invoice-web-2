// 견적 금액 계산 순수 함수. 뷰어와 PDF는 이 파일의 결과만 쓴다 (shrimp-rules.md 5-3절).
import type { QuoteItem, QuoteSummary } from '@/lib/estimate/types'

// 부가세율. PRD 확정 전제이며 다른 세율은 쓰지 않는다.
const VAT_DIVISOR = 10 // 부가세 10%는 공급가액 / 10으로 계산해 부동소수점 오차를 피한다

// 원 단위 절사. ROADMAP2 Q2 확정: 원 단위 정수, 부가세는 내림.
// 항목 금액과 부가세 모두 이 함수를 거치며, 규칙은 이 한 곳에서만 바꾼다.
export function roundWon(value: number): number {
  return Math.floor(value)
}

// 수량과 단가가 계산 가능한 값인지 확인한다. 빈 값, NaN, 무한대, 음수는 제외 대상이다.
function isValidAmount(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

// 항목 금액(수량 × 단가). 입력이 올바르지 않으면 null을 반환한다.
export function calculateLineAmount(
  quantity: number | null | undefined,
  unitPrice: number | null | undefined
): number | null {
  if (!isValidAmount(quantity) || !isValidAmount(unitPrice)) return null
  return roundWon(quantity * unitPrice)
}

export interface CalculateResult {
  summary: QuoteSummary
  // 계산에서 제외된 항목 id 목록. 화면에서 안내 문구에 쓸 수 있다.
  excludedItemIds: string[]
}

// 항목 목록으로 공급가액, 부가세, 총액을 계산한다. 예외를 던지지 않는다.
export function calculateSummary(items: QuoteItem[]): CalculateResult {
  const excludedItemIds: string[] = []
  let supplyAmount = 0

  for (const item of items) {
    const lineAmount = calculateLineAmount(item.quantity, item.unitPrice)
    if (lineAmount === null) {
      excludedItemIds.push(item.id)
      continue
    }
    supplyAmount += lineAmount
  }

  const vatAmount = roundWon(supplyAmount / VAT_DIVISOR)
  const totalAmount = supplyAmount + vatAmount

  return {
    summary: { supplyAmount, vatAmount, totalAmount },
    excludedItemIds,
  }
}
