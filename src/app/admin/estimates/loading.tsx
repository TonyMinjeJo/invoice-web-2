import { Container } from '@/components/layout/container'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminEstimatesLoading() {
  return (
    <Container size="lg">
      <div
        className="space-y-4 py-10"
        role="status"
        aria-label="견적서 목록을 불러오는 중"
      >
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </Container>
  )
}
