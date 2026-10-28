import type { QuoteItem } from '@/lib/estimate/types'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// 항목 + 항목별 금액. 금액(수량 x 단가)은 Task 004 계산 결과를 받는다.
export interface LineItemRow extends QuoteItem {
  amount: number
}

interface LineItemsTableProps {
  items: LineItemRow[]
  className?: string
}

const formatWon = (value: number) => `${value.toLocaleString('ko-KR')}원`

// 표 간격과 헤더 스타일. 셀 여백을 넓혀 행이 답답하지 않게 한다.
const headClass =
  'h-auto bg-muted/50 px-5 py-3 text-xs font-medium text-muted-foreground'
const bodyClass = 'px-5 py-4'

// md 이상은 표, 모바일은 카드 목록. CSS로만 전환한다.
export function LineItemsTable({ items, className }: LineItemsTableProps) {
  return (
    <section aria-labelledby="line-items-heading" className={className}>
      <h2
        id="line-items-heading"
        className="mb-4 text-lg font-semibold tracking-tight"
      >
        견적 항목
      </h2>

      {items.length === 0 && (
        <p className="text-muted-foreground rounded-xl border p-5 text-sm">
          등록된 항목이 없습니다.
        </p>
      )}

      {/* 데스크톱 표 */}
      {items.length > 0 && (
        <div className="hidden overflow-hidden rounded-xl border md:block">
          <Table>
            <TableCaption className="sr-only">
              견적 항목별 수량, 단가, 금액
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col" className={headClass}>
                  항목명
                </TableHead>
                <TableHead scope="col" className={cn(headClass, 'text-right')}>
                  수량
                </TableHead>
                <TableHead scope="col" className={cn(headClass, 'text-right')}>
                  단가
                </TableHead>
                <TableHead scope="col" className={cn(headClass, 'text-right')}>
                  금액
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id} className="hover:bg-muted/40">
                  {/* 긴 항목명은 줄바꿈 */}
                  <TableCell
                    className={cn(
                      bodyClass,
                      'max-w-0 min-w-48 break-words whitespace-normal'
                    )}
                  >
                    {item.name}
                  </TableCell>
                  <TableCell
                    className={cn(bodyClass, 'text-right tabular-nums')}
                  >
                    {item.quantity.toLocaleString('ko-KR')}
                  </TableCell>
                  <TableCell
                    className={cn(bodyClass, 'text-right tabular-nums')}
                  >
                    {formatWon(item.unitPrice)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      bodyClass,
                      'text-right font-medium tabular-nums'
                    )}
                  >
                    {formatWon(item.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 모바일 카드 목록 */}
      {items.length > 0 && (
        <ul className="space-y-4 md:hidden">
          {items.map(item => (
            <li key={item.id} className="bg-card rounded-xl border p-5">
              <p className="font-medium break-words">{item.name}</p>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">수량</dt>
                  <dd className="tabular-nums">
                    {item.quantity.toLocaleString('ko-KR')}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">단가</dt>
                  <dd className="tabular-nums">{formatWon(item.unitPrice)}</dd>
                </div>
                <div className="flex justify-between gap-4 font-medium">
                  <dt>금액</dt>
                  <dd className="tabular-nums">{formatWon(item.amount)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
