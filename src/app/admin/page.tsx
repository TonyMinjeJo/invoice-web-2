import type { Metadata } from 'next'
import Link from 'next/link'

import { EstimateList } from '@/components/admin/estimate-list'
import { SummaryCards } from '@/components/admin/summary-cards'
import { Container } from '@/components/layout/container'
import { requireAdminSession } from '@/lib/admin/session'
import { summarizeEstimates } from '@/lib/estimate/summary'
import { listEstimates } from '@/lib/notion/list-estimates'

export const metadata: Metadata = { title: '대시보드' }

// 노션 수정이 바로 보여야 하므로 캐시하지 않는다 (G3).
export const dynamic = 'force-dynamic'

const RECENT_COUNT = 5

// 대시보드는 목록과 같은 노션 조회 결과로 집계한다. 추가 노션 호출은 없다.
export default async function AdminDashboardPage() {
  await requireAdminSession('/admin')
  const result = await listEstimates()

  // 연동 오류는 error.tsx가 보여준다. 원본 오류 메시지는 화면에 나가지 않는다.
  if (result.kind === 'error' && result.reason === 'unavailable') {
    throw new Error('대시보드 조회 실패')
  }

  return (
    <Container size="lg">
      <div className="space-y-8 py-10">
        <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
        {result.kind === 'ok' ? (
          <>
            <SummaryCards summary={summarizeEstimates(result.items)} />
            <section className="space-y-3" aria-labelledby="recent-title">
              <div className="flex items-center justify-between gap-4">
                <h2 id="recent-title" className="text-lg font-semibold">
                  최근 견적서
                </h2>
                <Link
                  href="/admin/estimates"
                  className="text-sm font-medium hover:underline"
                >
                  전체 목록 보기
                </Link>
              </div>
              <EstimateList items={result.items.slice(0, RECENT_COUNT)} />
            </section>
          </>
        ) : (
          <p role="alert" className="rounded-xl border p-6 text-sm">
            요청이 많아 대시보드를 불러오지 못했습니다. 잠시 후 새로고침해
            주세요.
          </p>
        )}
      </div>
    </Container>
  )
}
