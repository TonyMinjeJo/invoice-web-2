import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { Header } from '@/components/layout/header'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Container>
          <div className="py-24 text-center">
            <h1 className="text-3xl font-bold">견적서 웹 뷰어</h1>
            <p className="text-muted-foreground mt-4">
              견적서 조회 페이지는 아직 구현되지 않았습니다.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
