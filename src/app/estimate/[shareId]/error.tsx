'use client'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

interface EstimateErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// 원본 오류 메시지는 화면에 보여주지 않는다.
export default function EstimateError({ reset }: EstimateErrorProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container>
          <div className="py-24 text-center">
            <h1 className="text-2xl font-bold">견적서를 불러오지 못했습니다</h1>
            <p className="text-muted-foreground mt-4">
              잠시 후 다시 시도해 주세요.
            </p>
            <Button className="mt-8" onClick={() => reset()}>
              다시 시도
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
