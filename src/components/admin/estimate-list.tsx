import type { EstimateListItem } from '@/lib/estimate/types'
import { cn } from '@/lib/utils'
import { ShareLinkCell } from '@/components/admin/share-link-cell'
import { StatusBadge } from '@/components/admin/status-badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface EstimateListProps {
  items: EstimateListItem[]
}

const headClass =
  'h-auto bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground'
const cellClass = 'px-4 py-3 align-top'
const EMPTY = '-'

// md 이상은 표, 모바일은 카드 목록. CSS로만 전환한다. 읽기 전용이라 편집 버튼은 없다.
export function EstimateList({ items }: EstimateListProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground rounded-xl border p-6 text-sm">
        표시할 견적서가 없습니다. 노션 견적서 데이터베이스에 견적서를 추가하면
        이곳에 나타납니다.
      </p>
    )
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border md:block">
        <Table>
          <TableCaption className="sr-only">
            견적서 목록: 견적 번호, 클라이언트명, 발행일, 유효기간, 상태, 링크
            복사
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col" className={headClass}>
                견적 번호
              </TableHead>
              <TableHead scope="col" className={headClass}>
                클라이언트명
              </TableHead>
              <TableHead scope="col" className={headClass}>
                발행일
              </TableHead>
              <TableHead scope="col" className={headClass}>
                유효기간
              </TableHead>
              <TableHead scope="col" className={headClass}>
                상태
              </TableHead>
              <TableHead scope="col" className={headClass}>
                링크 복사
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id} data-testid="estimate-row">
                <TableCell className={cn(cellClass, 'font-medium')}>
                  {item.quoteNumber ?? EMPTY}
                </TableCell>
                <TableCell
                  className={cn(
                    cellClass,
                    'max-w-0 min-w-40 break-words whitespace-normal'
                  )}
                >
                  {item.clientName ?? EMPTY}
                </TableCell>
                <TableCell className={cellClass}>
                  {item.issueDate ?? EMPTY}
                </TableCell>
                <TableCell className={cellClass}>
                  {item.validUntil ?? EMPTY}
                </TableCell>
                <TableCell className={cellClass}>
                  <StatusBadge label={item.statusLabel} />
                </TableCell>
                <TableCell className={cellClass}>
                  <ShareLinkCell item={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden" aria-label="견적서 목록">
        {items.map(item => (
          <li
            key={item.id}
            data-testid="estimate-card"
            className="bg-card space-y-3 rounded-xl border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium break-words">
                {item.quoteNumber ?? EMPTY}
              </p>
              <StatusBadge label={item.statusLabel} />
            </div>
            <p className="text-sm break-words">{item.clientName ?? EMPTY}</p>
            <dl className="text-muted-foreground grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt>발행일</dt>
              <dd>{item.issueDate ?? EMPTY}</dd>
              <dt>유효기간</dt>
              <dd>{item.validUntil ?? EMPTY}</dd>
            </dl>
            <ShareLinkCell item={item} />
          </li>
        ))}
      </ul>
    </>
  )
}
