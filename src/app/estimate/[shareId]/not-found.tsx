import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

export default function EstimateNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container>
          <div className="py-24 text-center">
            <h1 className="text-2xl font-bold">견적서를 찾을 수 없습니다</h1>
            <p className="text-muted-foreground mt-4">
              링크가 올바른지 확인해 주세요.
            </p>
            <Button asChild className="mt-8">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
