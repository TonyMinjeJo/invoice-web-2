// 견적서 도메인 타입. 금액은 모두 원 단위 정수다.
// 노션 속성 → 이 타입의 매핑은 docs/tasks/003-notion-schema-design.md를 따른다.

// 발행 상태. 노션 '상태' 속성의 값에서 변환한다.
// draft: 임시 (공유 링크로 조회 불가). 노션 값 '대기'
// issued: 발행 (조회 가능). 노션 값 '승인' (사용자 확정)
export type QuoteStatus = 'draft' | 'issued'

// 항목 한 줄. 금액(수량 × 단가)은 저장하지 않고 Task 004 계산 함수에서 구한다.
export interface QuoteItem {
  id: string // 노션 Items 페이지 ID (React key 용도)
  name: string
  quantity: number
  unitPrice: number
}

export interface Quote {
  id: string // 노션 invoices 페이지 ID
  quoteNumber: string
  clientName: string
  issueDate: string // YYYY-MM-DD
  validUntil: string // YYYY-MM-DD
  status: QuoteStatus
  items: QuoteItem[]
  // 노션 '총 금액' 값. 참고용이며 화면 금액 계산에는 쓰지 않는다. 값이 없으면 null.
  notionTotalAmount: number | null
}

// 금액 합계. 계산 함수는 Task 004에서 만들고, 이 타입은 결과 모양만 정의한다.
export interface QuoteSummary {
  supplyAmount: number
  vatAmount: number
  totalAmount: number
}
