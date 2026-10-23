// 견적서 도메인 타입. 금액은 모두 원 단위 정수다.
// 노션 속성 → 이 타입의 매핑은 Task 003 설계 문서를 따른다.

// 발행 상태 (Q4 확정 전 임시 값)
// draft: 임시 저장 (공유 링크로 조회 불가)
// issued: 발행 (조회 가능)
export type QuoteStatus = 'draft' | 'issued'

export interface QuoteItem {
  name: string
  quantity: number
  unitPrice: number
}

export interface Quote {
  id: string
  quoteNumber: string
  recipientName: string
  issueDate: string
  validUntil: string
  status: QuoteStatus
  items: QuoteItem[]
}

// 금액 합계. 계산 함수는 Task 004에서 만들고, 이 타입은 결과 모양만 정의한다.
export interface QuoteSummary {
  supplyAmount: number
  vatAmount: number
  totalAmount: number
}
