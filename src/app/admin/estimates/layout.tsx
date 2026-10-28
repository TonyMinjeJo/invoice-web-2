import { requireAdminSession } from '@/lib/admin/session'

// 목록 화면 보호 (두 번째 겹). 로그인 화면은 이 레이아웃 밖에 있어 리디렉션이 반복되지 않는다.
export default async function AdminEstimatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdminSession()
  return children
}
