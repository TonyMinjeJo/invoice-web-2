# Task 019: 관리자 레이아웃과 견적서 목록 골격 (더미 데이터)

## 명세

- 관리자 레이아웃 `src/app/admin/layout.tsx`: 공개 헤더와 분리된 관리자 헤더(서비스명, 메뉴 "견적서 목록", 테마 토글, 로그아웃 자리), `robots: noindex, nofollow`.
- `/admin` → `/admin/estimates` 리디렉션. 목록은 `src/app/admin/estimates/page.tsx`.
- 목록 UI: 데스크톱 표(열 6개), 모바일(md 미만) 카드. 편집·삭제 버튼 없음(R-02).
- 더미 데이터 `EstimateListItem`을 `src/lib/estimate/types.ts`에 추가. 더미 목록은 `src/lib/estimate/dummy-list.ts`(Task 022에서 제거).
- `loading.tsx`(Skeleton), `error.tsx`, 빈 목록 안내, `not-found.tsx`.

## 변경 파일

- 추가: `src/app/admin/{layout,page,not-found}.tsx`, `src/app/admin/estimates/{page,loading,error}.tsx`, `src/components/admin/{admin-header,estimate-list,status-badge,share-link-cell}.tsx`, `src/lib/estimate/dummy-list.ts`
- 수정: `src/lib/estimate/types.ts` (`EstimateListItem`, 상태 타입)

## 설계 메모

- `EstimateListItem`에 `statusLabel`(승인/대기/거절/만료됨/정보 누락)을 두어 Badge 문구를 결정한다. 대기·거절은 둘 다 표시 상태 `draft`다.
- 더미 건수는 `?count=0..5`로 줄여 빈 상태를 확인했다(더미 단계 한정).

## 테스트 결과 (2026-10-28, 개발 서버 localhost:3100, 더미 데이터, Playwright MCP)

| TC        | 결과 | 확인 내용                                                                                                                                                                                                  |
| --------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-019-01 | ✅   | 표 열 6개(견적 번호, 클라이언트명, 발행일, 유효기간, 상태, 링크 복사), 행 5개 = 더미 5건, `meta[name=robots]` = `noindex, nofollow`, 콘솔 에러 0                                                           |
| TC-019-02 | ✅   | `?count=0` → 표 없음, 빈 상태 안내 문구 표시                                                                                                                                                               |
| TC-019-03 | ✅   | `/admin/unknown` → HTTP 404, Next 기본 404 화면(루트에 not-found가 없어 세그먼트 not-found는 쓰이지 않음, MVP와 동일). 콘솔은 HTTP 404 리소스 로그 1건뿐이고 앱 에러 없음. 인증 전 단계라 로그인 없이 확인 |
| TC-019-04 | ✅   | 390×844: `scrollWidth` 375 = `clientWidth` 375(스크롤바 제외), 카드 5개 표시, 표 숨김                                                                                                                      |
| TC-019-05 | ✅   | 공개 홈 `/` 헤더에 관리자 링크 0개. 공개 상세 `/estimate/[id]` 회귀는 Task 022에서 실제 ID로 재확인(TC-022-06)                                                                                             |

## 완료 판정

TC-019-01~05 ✅. `npm run check-all`, `npm run build` 통과(Task 020과 함께 실행, 2026-10-28).
