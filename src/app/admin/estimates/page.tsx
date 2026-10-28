import type { Metadata } from 'next'

import { EstimateList } from '@/components/admin/estimate-list'
import { Container } from '@/components/layout/container'
import { requireAdminSession } from '@/lib/admin/session'
import { listEstimates } from '@/lib/notion/list-estimates'

export const metadata: Metadata = { title: '견적서 목록' }

// 노션 수정이 바로 보여야 하므로 캐시하지 않는다 (G3).
export const dynamic = 'force-dynamic'

export default async function AdminEstimatesPage() {
  await requireAdminSession('/admin/estimates')
  const result = await listEstimates()

  // 연동 오류는 error.tsx가 보여준다. 원본 오류 메시지는 화면에 나가지 않는다.
  if (result.kind === 'error' && result.reason === 'unavailable') {
    throw new Error('견적서 목록 조회 실패')
  }

  return (
    <Container size="lg">
      <div className="space-y-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight">견적서 목록</h1>
        {result.kind === 'ok' ? (
          <>
            <p className="text-muted-foreground text-sm">
              총 {result.items.length}건 · 발행일 최신순
            </p>
            <EstimateList items={result.items} />
          </>
        ) : (
          <p role="alert" className="rounded-xl border p-6 text-sm">
            요청이 많아 목록을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.
          </p>
        )}
      </div>
    </Container>
  )
}
