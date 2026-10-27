import type { Quote } from '@/lib/estimate/types'

// 발행자 정보. Quote 타입에 필드가 없어 헤더 전용 props로 받는다.
export interface QuoteIssuer {
  name: string
  contact?: string
}

interface QuoteHeaderProps
  extends Pick<
    Quote,
    'quoteNumber' | 'clientName' | 'issueDate' | 'validUntil'
  > {
  issuer: QuoteIssuer
  className?: string
}

// 견적서 상단 정보: 제목, 발행자/수신자, 번호, 발행일, 유효기간
export function QuoteHeader({
  quoteNumber,
  clientName,
  issueDate,
  validUntil,
  issuer,
  className,
}: QuoteHeaderProps) {
  return (
    <header className={className}>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">견적서</h1>
      <p className="text-muted-foreground mt-2 text-sm break-words">
        견적 번호 {quoteNumber}
      </p>

      {/* 모바일 1열, sm 이상 2열. 카드 한 장에 정보를 묶는다 */}
      <dl className="bg-card mt-8 grid gap-6 rounded-xl border p-6 sm:grid-cols-2">
        <div className="space-y-1">
          <dt className="text-muted-foreground text-sm">발행자</dt>
          <dd className="font-medium break-words">{issuer.name}</dd>
          {issuer.contact ? (
            <dd className="text-muted-foreground text-sm break-words">
              {issuer.contact}
            </dd>
          ) : null}
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground text-sm">수신자</dt>
          <dd className="font-medium break-words">{clientName}</dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground text-sm">발행일</dt>
          <dd>
            <time dateTime={issueDate}>{issueDate}</time>
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="text-muted-foreground text-sm">유효기간</dt>
          <dd>
            <time dateTime={validUntil}>{validUntil}</time>까지
          </dd>
        </div>
      </dl>
    </header>
  )
}
