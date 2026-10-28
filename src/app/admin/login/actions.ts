'use server'

import { redirect } from 'next/navigation'

import { getAdminEnv, getAdminEnvIssues } from '@/lib/env'
import { isPasswordMatch } from '@/lib/admin/session-token'
import {
  endAdminSession,
  sanitizeNextPath,
  startAdminSession,
} from '@/lib/admin/session'

// 실패 시 고정 지연 (G5). 서버리스에서 신뢰할 수 있는 시도 횟수 제한이 없어 지연만 둔다.
const FAILURE_DELAY_MS = 1000

export async function loginAction(formData: FormData): Promise<void> {
  const next = sanitizeNextPath(String(formData.get('next') ?? ''))
  const nextQuery = `next=${encodeURIComponent(next)}`

  if (getAdminEnvIssues().length > 0) {
    redirect(`/admin/login?${nextQuery}`)
  }

  const input = formData.get('password')
  const { password } = getAdminEnv()

  if (typeof input !== 'string' || !isPasswordMatch(input, password)) {
    await new Promise(resolve => setTimeout(resolve, FAILURE_DELAY_MS))
    // 입력값은 응답에 담지 않고 고정 오류 표시만 남긴다.
    redirect(`/admin/login?error=1&${nextQuery}`)
  }

  await startAdminSession()
  redirect(next)
}

export async function logoutAction(): Promise<void> {
  await endAdminSession()
  redirect('/admin/login')
}
