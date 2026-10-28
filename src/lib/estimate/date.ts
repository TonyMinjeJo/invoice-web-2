// 서울 기준 오늘 날짜(YYYY-MM-DD). 공개 조회와 관리자 목록이 같은 기준을 쓴다.
export function todayInSeoul(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
}
