import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'

export default function AdminNotFound() {
  return (
    <Container size="lg">
      <div className="py-24 text-center">
        <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground mt-4">
          요청하신 관리자 페이지가 존재하지 않습니다.
        </p>
        <Button asChild className="mt-8">
          <Link href="/admin/estimates">견적서 목록으로</Link>
        </Button>
      </div>
    </Container>
  )
}
