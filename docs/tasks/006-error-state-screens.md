# Task 006: 예외 상태 화면 구현

## 목표

견적서 상태별 안내 화면을 만든다. 없음(`not-found`), 조회 불가(임시 상태), 유효기간 만료 안내, 연동 오류(재시도 안내)를 더미 데이터로 확인할 수 있게 한다. 실제 노션 오류 판단은 Task 009·013에서 한다.

## 결정 사항

- 상태 안내는 `Quote.status`와 `validUntil`(오늘 날짜와 비교)로 결정한다. 판정 함수는 `src/lib/estimate/availability.ts`에 둔다.
- 유효기간 만료(Q6 임시 기본값): 조회는 허용하고 상단에 "유효기간 만료" 안내를 띄운다.
- 임시 상태(`draft`): 금액과 항목을 렌더링하지 않고 조회 불가 안내만 보인다 (TC-011-02 대비).
- 연동 오류 화면은 Task 002의 `error.tsx`를 재사용한다. 원본 오류 메시지는 표시하지 않는다.
- 더미 id: `dummy-draft`(임시), `dummy-expired`(유효기간 만료), `dummy-error`(연동 오류 시뮬레이션), 그 외 id는 `not-found`.
- Task 002에서 보류한 세그먼트 안의 `notFound()` 연결을 이 Task에서 처리한다.

## 변경 파일

| 파일                                        | 상태 | 내용                                                     |
| ------------------------------------------- | ---- | -------------------------------------------------------- |
| `src/lib/estimate/availability.ts`          | 신규 | 상태 판정 (`available`, `draft`, `expired`, `not-found`) |
| `src/app/estimate/[shareId]/not-found.tsx`  | 수정 | 문구와 레이아웃 정리, 홈 링크                            |
| `src/app/estimate/[shareId]/error.tsx`      | 수정 | 재시도 안내 문구 정리, 원본 오류 미노출                  |
| `src/components/estimate/status-notice.tsx` | 신규 | 조회 불가 / 유효기간 만료 안내 공통 컴포넌트             |
| `src/app/estimate/[shareId]/page.tsx`       | 수정 | 판정 결과에 따라 분기                                    |

## 수락 기준

- `dummy-draft` → 조회 불가 안내, 금액과 항목이 화면에 없음
- `dummy-expired` → 상세 내용과 함께 "유효기간 만료" 안내 표시
- 없는 id → `not-found` 화면, 홈 링크 동작
- 연동 오류 → 재시도 안내 표시, 오류 메시지 원문 없음
- 모든 상태 화면이 390×844에서 가로 스크롤 없음

## 구현 단계

1. `availability.ts` 작성 (날짜 비교는 `YYYY-MM-DD` 문자열 기준, 시간대 주의)
2. 상태 안내 컴포넌트와 `not-found`, `error` 화면 정리
3. `page.tsx` 분기 연결
4. `npm run check-all`, `npm run build`
5. Playwright MCP로 TC-006-01~06 실행

## 테스트 체크리스트

- [ ] TC-006-01 [정상] 상태별 더미 진입 → `dummy-basic`(정상), `dummy-expired`(만료), `dummy-draft`(임시) 각각 맞는 안내와 레이아웃 표시
  - 도구: `browser_navigate` → `browser_snapshot`
- [ ] TC-006-02 [예외] 존재하지 않는 id (`/estimate/unknown`) → `not-found` 화면, 홈 링크로 이동 가능
  - 도구: `browser_navigate` → `browser_click`
- [ ] TC-006-03 [예외] 연동 오류 상태(`dummy-error`) → 재시도 안내 표시, 원본 오류 메시지 미노출
  - 도구: `browser_snapshot`, `browser_console_messages`
- [ ] TC-006-04 [모바일] 390×844에서 각 상태 화면이 가로 스크롤 없이 표시
  - 도구: `browser_resize` → `browser_evaluate`
- [ ] TC-006-05 [경계] 유효기간이 오늘인 견적서 → 만료로 보지 않음
  - 사전 조건: 더미에 오늘 날짜 `validUntil` 항목을 추가하거나 `availability.ts` 단위 테스트로 확인
- [ ] TC-006-06 [회귀] TC-005-01 상세 화면이 그대로 정상 렌더링

## 결과 기록

실행 일시: 2026-10-27 (`next dev -p 3100`, 더미 데이터, 데스크톱과 390 뷰포트)

| TC        | 결과 | 비고                                                                                                                                                                                                                                   |
| --------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-006-01 | ✅   | 임시(`dummy-draft`), 만료(`dummy-expired`), 연동 오류(`dummy-error`), not-found 화면 모두 안내 문구와 레이아웃 확인                                                                                                                    |
| TC-006-02 | ✅   | `/estimate/no-such-id` → HTTP 404, "견적서를 찾을 수 없습니다", "홈으로 돌아가기" 클릭 시 `/`로 이동. 콘솔 에러 1건은 404 리소스 로드 메시지                                                                                           |
| TC-006-03 | ✅   | `dummy-error` 진입 → "견적서를 불러오지 못했습니다", "잠시 후 다시 시도해 주세요.", "다시 시도" 버튼 표시. 원본 오류 메시지 화면 미노출. 개발 모드에서는 HTTP 500 (error.tsx 표시), 운영 빌드에서는 `dummy-error`가 not-found로 처리됨 |
| TC-006-04 | ✅   | 390 뷰포트에서 임시, 만료, not-found 화면 모두 `scrollWidth` = `clientWidth` (390)                                                                                                                                                     |
| TC-006-05 | ✅   | 임시 스크립트(Q9): `validUntil`이 오늘이면 조회 가능, 어제면 만료, 내일이면 조회 가능 (`availability.ts`)                                                                                                                              |
| TC-006-06 | ✅   | TC-005-01 재확인: `dummy-basic` 정상 렌더링                                                                                                                                                                                            |

참고: 같은 시나리오의 2회 반복 실행은 수행하지 않음.
2026-10-27 재검증: `dummy-error`는 `page.tsx`에서 개발 모드일 때만 예외를 던지는 방식으로 추가했고, Task 013에서 실제 노션 오류 처리로 바뀌면 이 분기를 지운다.

남은 작업: 없음.
