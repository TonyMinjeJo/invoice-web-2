// 공유 링크 조합과 복사 가능 상태 판정. 순수 함수만 둔다 (버튼 컴포넌트에 로직을 넣지 않는다).
import type { EstimateListItem } from '@/lib/estimate/types'

// 링크 형식: {기준 주소}/estimate/{노션 페이지 ID}. 노션이 주는 하이픈 포함 형식을 그대로 쓴다.
export function buildShareLink(baseUrl: string, pageId: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/estimate/${pageId}`
}

// 복사 허용 규칙 (G4). 승인은 복사, 만료됨은 경고 후 복사, 대기·거절·정보 누락은 비활성이다.
export type ShareLinkPolicy =
  | { canCopy: true; warning: string | null }
  | { canCopy: false; reason: string }

export function getShareLinkPolicy(
  item: Pick<EstimateListItem, 'status' | 'statusLabel'>
): ShareLinkPolicy {
  switch (item.status) {
    case 'issued':
      return { canCopy: true, warning: null }
    case 'expired':
      return {
        canCopy: true,
        warning: '만료됨: 클라이언트에게 만료 안내가 보입니다',
      }
    case 'incomplete':
      return {
        canCopy: false,
        reason: '정보 누락: 노션에서 필수 값을 채워 주세요',
      }
    case 'draft':
      return {
        canCopy: false,
        reason:
          item.statusLabel === '거절'
            ? '거절된 견적서는 복사할 수 없습니다'
            : '승인 후 복사할 수 있습니다',
      }
  }
}
