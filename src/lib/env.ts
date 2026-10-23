import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  // 노션 변수는 선택 항목이다. 홈 화면 등 노션을 쓰지 않는 페이지가 설정 없이도 뜨도록 하고,
  // 실제 사용 전에 getNotionEnv()로 누락을 검사한다.
  NOTION_API_KEY: z.string().min(1).optional(),
  NOTION_DATABASE_ID: z.string().min(1).optional(),
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
})

export type Env = z.infer<typeof envSchema>

// 노션 연동 코드가 호출한다. 누락된 변수명만 메시지에 담고 값은 담지 않는다.
export function getNotionEnv() {
  const missing = (['NOTION_API_KEY', 'NOTION_DATABASE_ID'] as const).filter(
    name => !env[name]
  )

  if (missing.length > 0) {
    throw new Error(
      `노션 환경변수가 설정되지 않았습니다: ${missing.join(', ')}`
    )
  }

  return {
    apiKey: env.NOTION_API_KEY as string,
    databaseId: env.NOTION_DATABASE_ID as string,
  }
}
