import { env } from '@/lib/env'

// 발행자 정보. ISSUER_NAME, ISSUER_CONTACT 환경변수로 받는다.
// 환경변수가 없으면 자리표시자를 쓴다. 실제 운영 전에는 반드시 설정한다.
export function getIssuer(): { name: string; contact?: string } {
  return {
    name: env.ISSUER_NAME ?? '예시 발행자',
    contact: env.ISSUER_CONTACT ?? 'issuer@example.com',
  }
}
