import { NextResponse, type NextRequest } from 'next/server'

import {
  ADMIN_COOKIE_NAME,
  verifySessionToken,
} from '@/lib/admin/session-token'
import { env, getAdminEnvIssues } from '@/lib/env'

// Node 런타임을 쓴다. 세션 서명이 node:crypto(HMAC-SHA256)를 쓰기 때문이다.
// /admin 아래만 대상이다. 공개 경로(/estimate/*, PDF, /)는 matcher에서 제외된다.
export const config = {
  runtime: 'nodejs',
  matcher: ['/admin', '/admin/:path*'],
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isLogin = pathname === '/admin/login'

  const authenticated =
    getAdminEnvIssues().length === 0 &&
    verifySessionToken(
      request.cookies.get(ADMIN_COOKIE_NAME)?.value,
      // 시크릿이 짧으면 레이아웃의 requireAdminSession이 같은 기준으로 막는다.
      env.ADMIN_SESSION_SECRET
    )

  if (!authenticated && !isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    const redirect = NextResponse.redirect(url)
    redirect.headers.set('Cache-Control', 'private, no-store')
    return redirect
  }

  // 관리자 응답은 공유 캐시에 저장하지 않는다.
  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
