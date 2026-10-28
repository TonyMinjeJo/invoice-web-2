import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { EstimateListStatusLabel } from '@/lib/estimate/types'

interface StatusBadgeProps {
  label: EstimateListStatusLabel
  className?: string
}

// 색은 토큰만 쓰고, 상태는 항상 텍스트로도 구분한다 (WCAG 1.4.1).
const variants: Record<
  EstimateListStatusLabel,
  { variant: 'default' | 'secondary' | 'outline'; className?: string }
> = {
  승인: { variant: 'default' },
  대기: { variant: 'secondary' },
  거절: { variant: 'outline', className: 'text-destructive' },
  만료됨: { variant: 'outline', className: 'text-muted-foreground' },
  '정보 누락': { variant: 'outline', className: 'text-destructive' },
}

export function StatusBadge({ label, className }: StatusBadgeProps) {
  const config = variants[label]
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {label}
    </Badge>
  )
}
