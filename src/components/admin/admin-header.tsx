import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { ThemeToggle } from '@/components/theme-toggle'

// 공개 헤더와 분리된 관리자 헤더. 메뉴는 견적서 목록 하나뿐이다.
// children에는 로그아웃 버튼이 들어온다 (로그인 상태일 때만).
export function AdminHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container size="lg">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-base font-bold sm:text-xl">
              견적서 웹 뷰어 <span className="font-normal">관리자</span>
            </span>
            <nav aria-label="관리자 메뉴" className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm font-medium hover:underline"
              >
                대시보드
              </Link>
              <Link
                href="/admin/estimates"
                className="text-sm font-medium hover:underline"
              >
                견적서 목록
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            {children}
          </div>
        </div>
      </Container>
    </header>
  )
}
