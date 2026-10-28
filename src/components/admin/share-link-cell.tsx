import { CopyLinkButton } from '@/components/admin/copy-link-button'
import { Button } from '@/components/ui/button'
import { env } from '@/lib/env'
import { getShareLinkPolicy } from '@/lib/estimate/share-link'
import type { EstimateListItem } from '@/lib/estimate/types'

interface ShareLinkCellProps {
  item: EstimateListItem
}

// 상태별 복사 허용 (G4). 비활성 이유와 만료 경고는 색이 아니라 문구로 보여준다.
export function ShareLinkCell({ item }: ShareLinkCellProps) {
  const policy = getShareLinkPolicy(item)
  const label = item.quoteNumber ?? '견적서'

  if (!policy.canCopy) {
    return (
      <div className="space-y-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          aria-label={`${label} 링크 복사 (불가)`}
        >
          링크 복사
        </Button>
        <p className="text-muted-foreground max-w-48 text-xs">
          {policy.reason}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <CopyLinkButton
        pageId={item.id}
        appUrl={env.NEXT_PUBLIC_APP_URL ?? null}
        label={label}
      />
      {policy.warning ? (
        <p className="text-muted-foreground max-w-48 text-xs">
          {policy.warning}
        </p>
      ) : null}
    </div>
  )
}
