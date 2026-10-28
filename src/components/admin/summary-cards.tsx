import { Card, CardContent } from '@/components/ui/card'
import type { EstimateSummary } from '@/lib/estimate/summary'
import { SUMMARY_LABELS } from '@/lib/estimate/summary'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  summary: EstimateSummary
}

// 상태 건수 카드. 색은 토큰만 쓰고, 상태 이름은 항상 텍스트로 보여준다 (WCAG 1.4.1).
export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <li>
        <Card className="h-full">
          <CardContent className="space-y-1 p-4">
            <p className="text-muted-foreground text-xs">전체</p>
            <p className="text-2xl font-bold tabular-nums">{summary.total}</p>
          </CardContent>
        </Card>
      </li>
      {SUMMARY_LABELS.map(label => (
        <li key={label}>
          <Card className="h-full">
            <CardContent className="space-y-1 p-4">
              <p
                className={cn(
                  'text-xs',
                  label === '거절' || label === '정보 누락'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                )}
              >
                {label}
              </p>
              <p className="text-2xl font-bold tabular-nums">
                {summary.counts[label]}
              </p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
