import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_URL: z.string().optional(),
  // 공유 링크 기준 주소. 빈 문자열은 설정하지 않은 것으로 본다.
  NEXT_PUBLIC_APP_URL: z.preprocess(
    value => (value === '' ? undefined : value),
    z.string().url().optional()
  ),
  // 노션 변수는 선택 항목이다. 홈 화면 등 노션을 쓰지 않는 페이지가 설정 없이도 뜨도록 하고,
  // 실제 사용 전에 getNotionEnv()로 누락을 검사한다.
  NOTION_API_KEY: z.string().min(1).optional(),
  NOTION_DATABASE_ID: z.string().min(1).optional(),
  // 견적서 조회 캐시 유지 시간(초). 비우면 기본값 3600(Q5 확정: 반영 허용 1시간)을 쓴다.
  // 테스트에서 짧게 바꿀 때만 설정한다. 0이면 캐시하지 않는다.
  // 발행자 정보. 비워 두면 자리표시자를 쓴다 (src/lib/estimate/issuer.ts).
  ISSUER_NAME: z.string().min(1).optional(),
  ISSUER_CONTACT: z.string().min(1).optional(),
  // 테스트 전용. 비워 두면 노션 기본 주소를 쓴다. 가짜 노션 서버로 429와 타임아웃을 재현할 때만 설정한다.
  NOTION_BASE_URL: z.string().url().optional(),
  // 관리자 변수도 선택 항목이다. 공개 화면은 이 값 없이 떠야 하고, 관리자 코드가 getAdminEnv()로 검사한다.
  // 빈 문자열은 설정하지 않은 것으로 본다.
  ADMIN_PASSWORD: z.preprocess(
    value => (value === '' ? undefined : value),
    z.string().optional()
  ),
  ADMIN_SESSION_SECRET: z.preprocess(
    value => (value === '' ? undefined : value),
    z.string().optional()
  ),
  NOTION_CACHE_TTL_SECONDS: z.preprocess(
    value => (value === '' ? undefined : value),
    z.coerce.number().int().min(0).max(86400).optional()
  ),
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  ISSUER_NAME: process.env.ISSUER_NAME,
  ISSUER_CONTACT: process.env.ISSUER_CONTACT,
  NOTION_BASE_URL: process.env.NOTION_BASE_URL,
  NOTION_CACHE_TTL_SECONDS: process.env.NOTION_CACHE_TTL_SECONDS,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
})

// 기본 캐시 유지 시간(초). Q5 확정값이다.
const DEFAULT_NOTION_CACHE_TTL_SECONDS = 3600

export function getNotionCacheTtlSeconds(): number {
  return env.NOTION_CACHE_TTL_SECONDS ?? DEFAULT_NOTION_CACHE_TTL_SECONDS
}

export type Env = z.infer<typeof envSchema>

// 노션 연동 코드가 호출한다. 누락된 변수명만 메시지에 담고 값은 담지 않는다.
export function getNotionEnv() {
  const { NOTION_API_KEY: apiKey, NOTION_DATABASE_ID: databaseId } = env
  const missing = [
    ...(apiKey ? [] : ['NOTION_API_KEY']),
    ...(databaseId ? [] : ['NOTION_DATABASE_ID']),
  ]

  if (!apiKey || !databaseId) {
    throw new Error(
      `노션 환경변수가 설정되지 않았습니다: ${missing.join(', ')}`
    )
  }

  return { apiKey, databaseId }
}

// 세션 시크릿 최소 길이
export const ADMIN_SESSION_SECRET_MIN_LENGTH = 32

// 관리자 설정에서 빠졌거나 올바르지 않은 변수 이름 목록. 값은 담지 않는다.
export function getAdminEnvIssues(): string[] {
  const issues: string[] = []
  if (!env.ADMIN_PASSWORD) issues.push('ADMIN_PASSWORD')
  if (
    !env.ADMIN_SESSION_SECRET ||
    env.ADMIN_SESSION_SECRET.length < ADMIN_SESSION_SECRET_MIN_LENGTH
  ) {
    issues.push('ADMIN_SESSION_SECRET')
  }
  return issues
}

// 관리자 코드가 호출한다. 문제가 있는 변수명만 메시지에 담고 값은 담지 않는다.
export function getAdminEnv() {
  const issues = getAdminEnvIssues()
  const { ADMIN_PASSWORD: password, ADMIN_SESSION_SECRET: sessionSecret } = env

  if (issues.length > 0 || !password || !sessionSecret) {
    throw new Error(`관리자 환경변수가 올바르지 않습니다: ${issues.join(', ')}`)
  }

  return { password, sessionSecret }
}
