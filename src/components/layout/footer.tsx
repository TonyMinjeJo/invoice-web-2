import { Container } from './container'

export function Footer() {
  return (
    <footer className="border-t">
      <Container>
        <div className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              © 2026 견적서 웹 뷰어.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
