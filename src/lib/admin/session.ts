import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { env, getAdminEnv, getAdminEnvIssues } from '@/lib/env'
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from '@/lib/admin/session-token'

// 세션 쿠키는 /admin 아래에서만 전송된다. 공개 경로에는 쿠키가 가지 않는다.
const COOKIE_PATH = '/admin'

// 로그인 후 돌아갈 경로. /admin 아래의 내부 경로만 허용해 외부 주소로의 이동을 막는다.
export function sanitizeNextPath(next: string | null | undefined): string {
  const fallback = '/admin/estimates'
  if (!next || !next.startsWith('/admin') || next.startsWith('//')) {
    return fallback
  }
  if (next === '/admin/login' || next.startsWith('/admin/login?')) {
    return fallback
  }
  return next
}

export async function hasAdminSession(): Promise<boolean> {
  if (getAdminEnvIssues().length > 0) return false
  const store = await cookies()
  return verifySessionToken(
    store.get(ADMIN_COOKIE_NAME)?.value,
    env.ADMIN_SESSION_SECRET
  )
}

// middleware만 믿지 않고 레이아웃과 데이터 함수에서도 호출한다.
export async function requireAdminSession(next?: string): Promise<void> {
  if (await hasAdminSession()) return
  const target = sanitizeNextPath(next)
  redirect(`/admin/login?next=${encodeURIComponent(target)}`)
}

export async function startAdminSession(): Promise<void> {
  const { sessionSecret } = getAdminEnv()
  const store = await cookies()
  store.set(ADMIN_COOKIE_NAME, createSessionToken(sessionSecret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: COOKIE_PATH,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  })
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies()
  store.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: COOKIE_PATH,
    maxAge: 0,
  })
}
