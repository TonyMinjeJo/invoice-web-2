import type { QuoteSummary as QuoteSummaryAmounts } from '@/lib/estimate/types'

interface QuoteSummaryProps extends QuoteSummaryAmounts {
  className?: string
}

const formatWon = (value: number) => `${value.toLocaleString('ko-KR')}원`

// 합계 3줄. 값은 계산 함수 결과를 props로 받아 그대로 표시한다.
export function QuoteSummary({
  supplyAmount,
  vatAmount,
  totalAmount,
  className,
}: QuoteSummaryProps) {
  return (
    <section aria-labelledby="quote-summary-heading" className={className}>
      <h2 id="quote-summary-heading" className="sr-only">
        금액 합계
      </h2>
      <dl className="bg-muted/40 ml-auto w-full space-y-3 rounded-xl border p-5 md:max-w-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">공급가액</dt>
          <dd className="tabular-nums">{formatWon(supplyAmount)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">부가세</dt>
          <dd className="tabular-nums">{formatWon(vatAmount)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t pt-3 text-xl font-bold">
          <dt>총액</dt>
          <dd className="tabular-nums">{formatWon(totalAmount)}</dd>
        </div>
      </dl>
    </section>
  )
}
