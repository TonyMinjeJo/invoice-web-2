import type { Metadata } from 'next'

import { logoutAction } from '@/app/admin/login/actions'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { hasAdminSession } from '@/lib/admin/session'

// 관리자 화면은 검색 엔진에 노출하지 않는다.
export const metadata: Metadata = {
  title: { default: '관리자 | 견적서 웹 뷰어', template: '%s | 관리자' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const signedIn = await hasAdminSession()

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader>
        {signedIn ? (
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              로그아웃
            </Button>
          </form>
        ) : null}
      </AdminHeader>
      <main className="flex-1">{children}</main>
    </div>
  )
}
