'use client'

import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'

interface AdminEstimatesErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// 원본 오류 메시지는 화면에 보여주지 않는다.
export default function AdminEstimatesError({
  reset,
}: AdminEstimatesErrorProps) {
  return (
    <Container size="lg">
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold">
          견적서 목록을 불러오지 못했습니다
        </h1>
        <p className="text-muted-foreground mt-4">
          잠시 후 다시 시도해 주세요.
        </p>
        <Button className="mt-8" onClick={() => reset()}>
          다시 시도
        </Button>
      </div>
    </Container>
  )
}
