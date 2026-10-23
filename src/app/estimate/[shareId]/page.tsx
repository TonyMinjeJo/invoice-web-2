import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

// 공유 식별자 검증과 노션 조회는 Q1 확정 후 Task 009·011에서 붙인다.
// 지금은 라우트가 빈 안내 화면으로 렌더링되는지만 확인한다.
export default function EstimatePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container>
          <div className="py-24 text-center">
            <h1 className="text-2xl font-bold">견적서</h1>
            <p className="text-muted-foreground mt-4">
              견적서 조회 기능은 아직 구현되지 않았습니다.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
