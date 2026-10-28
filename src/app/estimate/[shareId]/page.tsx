import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'
import {
  LineItemsTable,
  type LineItemRow,
} from '@/components/estimate/line-items-table'
import { PdfDownloadButton } from '@/components/estimate/pdf-download-button'
import { QuoteHeader } from '@/components/estimate/quote-header'
import { QuoteSummary } from '@/components/estimate/quote-summary'
import {
  QuoteUnavailable,
  type QuoteUnavailableReason,
} from '@/components/estimate/quote-unavailable'
import { calculateLineAmount, calculateSummary } from '@/lib/estimate/calculate'
import { getIssuer } from '@/lib/estimate/issuer'
import type { Quote } from '@/lib/estimate/types'
import {
  getPublishedQuote,
  type ViewResult,
} from '@/lib/notion/get-published-quote'

interface EstimatePageProps {
  params: Promise<{ shareId: string }>
}

// Q5 채택: 견적서 페이지는 검색 엔진에 노출하지 않는다.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

// 식별자 검사, 노션 조회, 임시와 만료 판정은 getPublishedQuote에서만 한다.
export default async function EstimatePage({ params }: EstimatePageProps) {
  const { shareId } = await params
  const result = await getPublishedQuote(shareId)

  if (result.kind === 'notFound') notFound()
  // 연동 오류는 error.tsx가 보여준다. 원본 오류 메시지는 화면에 나가지 않는다.
  // 요청 제한은 안내 화면으로 보여주고, 그 밖의 연동 실패는 error.tsx가 보여준다.
  if (result.kind === 'error' && result.reason === 'unavailable') {
    throw new Error('견적서 조회 실패')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container>
          {result.kind === 'found' ? (
            <EstimateDetail quote={result.quote} shareId={shareId} />
          ) : (
            <div className="py-12 md:py-16">
              <QuoteUnavailable reason={toUnavailableReason(result)} />
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  )
}

// 안내 화면의 사유. found와 notFound는 이 함수를 거치지 않는다.
function toUnavailableReason(
  result: Exclude<ViewResult, { kind: 'found' } | { kind: 'notFound' }>
): QuoteUnavailableReason {
  if (result.kind === 'draft') return 'draft'
  if (result.kind === 'expired') return 'expired'
  if (result.kind === 'invalid') return 'invalid'
  return 'rateLimited'
}

// 조회 가능한 견적서 상세. 금액은 calculate.ts 결과만 쓴다.
function EstimateDetail({ quote, shareId }: { quote: Quote; shareId: string }) {
  const { summary, excludedItemIds } = calculateSummary(quote.items)

  // 계산에서 제외된 항목은 표에서 빼고, 금액은 계산 함수 결과만 쓴다.
  const rows: LineItemRow[] = quote.items.flatMap(item => {
    const amount = calculateLineAmount(item.quantity, item.unitPrice)
    return amount === null ? [] : [{ ...item, amount }]
  })

  return (
    <div className="space-y-12 py-10 md:py-14">
      <div className="flex justify-end">
        <PdfDownloadButton shareId={shareId} />
      </div>

      <QuoteHeader
        quoteNumber={quote.quoteNumber}
        clientName={quote.clientName}
        issueDate={quote.issueDate}
        validUntil={quote.validUntil}
        issuer={getIssuer()}
      />

      <LineItemsTable items={rows} />

      <QuoteSummary {...summary} />

      {excludedItemIds.length > 0 ? (
        <p className="text-destructive text-sm">
          금액이 올바르지 않은 항목 {excludedItemIds.length}건은 합계에서
          제외되었습니다.
        </p>
      ) : null}
    </div>
  )
}
