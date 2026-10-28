import type {
  EstimateListItem,
  EstimateListStatusLabel,
} from '@/lib/estimate/types'

// 대시보드 상태 카드의 순서. 목록의 상태 표시와 같은 이름을 쓴다.
export const SUMMARY_LABELS: EstimateListStatusLabel[] = [
  '승인',
  '대기',
  '거절',
  '만료됨',
  '정보 누락',
]

export interface EstimateSummary {
  total: number
  counts: Record<EstimateListStatusLabel, number>
}

// 목록 결과에서 상태별 건수를 센다. 노션을 다시 조회하지 않는다.
export function summarizeEstimates(items: EstimateListItem[]): EstimateSummary {
  const counts = Object.fromEntries(
    SUMMARY_LABELS.map(label => [label, 0])
  ) as Record<EstimateListStatusLabel, number>

  for (const item of items) {
    counts[item.statusLabel] += 1
  }

  return { total: items.length, counts }
}
