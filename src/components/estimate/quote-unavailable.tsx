import { AlertCircle } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'

// 조회 불가 사유. 임시 저장(draft), 유효기간 만료(expired), 데이터 불완전(invalid), 노션 요청 제한(rateLimited)을 구분한다.
export type QuoteUnavailableReason =
  | 'draft'
  | 'expired'
  | 'invalid'
  | 'rateLimited'

interface QuoteUnavailableProps {
  reason: QuoteUnavailableReason
  className?: string
}

const messages: Record<
  QuoteUnavailableReason,
  { title: string; body: string }
> = {
  draft: {
    title: '아직 발행되지 않은 견적서입니다',
    body: '담당자가 발행을 완료하면 이 페이지에서 확인할 수 있습니다.',
  },
  expired: {
    title: '유효기간이 지난 견적서입니다',
    body: '최신 견적이 필요하면 담당자에게 다시 요청해 주세요.',
  },
  invalid: {
    title: '견적서 정보를 표시할 수 없습니다',
    body: '견적서 정보가 완전하지 않습니다. 담당자에게 문의해 주세요.',
  },
  rateLimited: {
    title: '요청이 많아 잠시 후 다시 시도해 주세요',
    body: '견적서 시스템의 요청 한도를 넘었습니다. 잠시 뒤 새로고침해 주세요.',
  },
}

// 조회할 수 없는 견적서의 안내 카드. 원본 데이터나 상태 값은 노출하지 않는다.
export function QuoteUnavailable({ reason, className }: QuoteUnavailableProps) {
  const { title, body } = messages[reason]

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center gap-3">
        <AlertCircle
          aria-hidden="true"
          className="text-muted-foreground size-6"
        />
        {/* 페이지의 유일한 h1 역할을 하므로 CardTitle 대신 h1을 쓴다 */}
        <h1 className="text-lg leading-none font-semibold">{title}</h1>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
