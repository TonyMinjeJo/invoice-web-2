// 세션 토큰 서명과 검증 (Node crypto HMAC-SHA256). 외부 인증 패키지는 쓰지 않는다 (G1).
// middleware와 서버 코드가 함께 쓰므로 쿠키나 next/headers에 의존하지 않는다.
import { createHmac, timingSafeEqual } from 'node:crypto'

export const ADMIN_COOKIE_NAME = 'admin_session'
// 유효 시간 12시간 (G1)
export const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

// 만료 시각(ms)을 담은 토큰을 만든다. 형식: base64url(JSON).서명
export function createSessionToken(secret: string, now = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: now + ADMIN_SESSION_MAX_AGE_SECONDS * 1000 })
  ).toString('base64url')
  return `${payload}.${sign(payload, secret)}`
}

// 서명이 맞고 만료되지 않았으면 true. 형식이 틀리면 예외 없이 false다.
export function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now()
): boolean {
  if (!token || !secret) return false

  const [payload, signature, ...rest] = token.split('.')
  if (!payload || !signature || rest.length > 0) return false

  const expected = Buffer.from(sign(payload, secret))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length) return false
  if (!timingSafeEqual(expected, actual)) return false

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof exp === 'number' && exp > now
  } catch {
    return false
  }
}

// 비밀번호 비교. 길이가 달라도 시간이 새지 않도록 해시를 만들어 비교한다.
export function isPasswordMatch(input: string, expected: string): boolean {
  const hash = (value: string) =>
    createHmac('sha256', 'admin-password-compare').update(value).digest()
  return timingSafeEqual(hash(input), hash(expected))
}
