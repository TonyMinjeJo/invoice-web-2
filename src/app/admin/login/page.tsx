import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginAction } from '@/app/admin/login/actions'
import { hasAdminSession, sanitizeNextPath } from '@/lib/admin/session'
import { getAdminEnvIssues } from '@/lib/env'

export const metadata: Metadata = { title: '로그인' }

interface AdminLoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>
}

// 관리자 로그인. 입력이 하나뿐이라 네이티브 form + Server Action을 쓴다.
export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { next, error } = await searchParams
  const safeNext = sanitizeNextPath(next)

  if (await hasAdminSession()) redirect(safeNext)

  // 설정 오류에는 변수 이름만 보여주고 값은 보여주지 않는다.
  const issues = getAdminEnvIssues()

  return (
    <Container size="sm">
      <div className="mx-auto max-w-sm py-16">
        <h1 className="text-2xl font-bold tracking-tight">관리자 로그인</h1>

        {issues.length > 0 ? (
          <p role="alert" className="text-destructive mt-6 text-sm">
            관리자 설정이 완료되지 않았습니다: {issues.join(', ')}
          </p>
        ) : (
          <form action={loginAction} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={safeNext} />
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            {error ? (
              <p role="alert" className="text-destructive text-sm">
                비밀번호가 올바르지 않습니다.
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
        )}
      </div>
    </Container>
  )
}
