# Task 021: 노션 견적서 목록 조회 함수

## 명세

- `src/lib/notion/list-estimates.ts`(`server-only`): 견적서 데이터 소스를 `발행일` 내림차순으로 조회하고 `start_cursor`로 100건 단위 전체 행을 모은다.
- 데이터 소스 ID는 `get-estimate.ts`의 `resolveDataSourceIds`(이번에 `export`만 추가)를 재사용한다. 행 매핑은 `mapInvoiceFields`, 상태는 `toQuoteStatus`(매핑 내부)와 `getQuoteAvailability`를 재사용한다. 복사본 없음.
- 매핑에 실패한 행은 `incomplete`로 남기고 누락 필드명만 서버 로그(`estimate_list_incomplete`)에 기록한다. 읽을 수 있는 번호·클라이언트명·날짜는 표시용으로 담는다.
- `todayInSeoul`을 `get-published-quote.ts`에서 `src/lib/estimate/date.ts`로 옮겼다. `classifyError`는 목록과 공유하려고 `export`했다.
- 목록은 캐시하지 않는다(G3), 금액은 조회하지 않는다(G2). 노션 호출은 데이터 소스 쿼리 `ceil(N/100)`회이다.
- 함수 첫 줄에서 `requireAdminSession()`을 호출해 데이터 함수에서도 인증을 확인한다.
- `EstimateListItem`: `id`(하이픈 포함 노션 페이지 ID), `quoteNumber`, `clientName`, `issueDate`, `validUntil`, `status`(`issued`/`draft`/`expired`/`incomplete`), `statusLabel`(승인/대기/거절/만료됨/정보 누락), `missingFields`. 노션 `거절`은 대기와 구분해 `statusLabel`만 다르다(둘 다 `draft`).

## 변경 파일

- 추가: `src/lib/notion/list-estimates.ts`, `src/lib/estimate/date.ts`
- 수정: `src/lib/notion/get-estimate.ts`(export 추가), `src/lib/notion/get-published-quote.ts`(`todayInSeoul` 이동, `classifyError` export)

## 테스트 환경

함수에는 단독 호출 경로가 없어 Task 022의 목록 화면을 통해 확인했다. 가짜 노션 서버(`NOTION_BASE_URL`, 저장소 밖 임시 스크립트)가 요청을 로그로 남겼다. 실제 노션(읽기 전용 호출)은 TC-021-06·07과 Task 022에서 사용했다.

## 테스트 결과 (2026-10-28, 개발 서버, Playwright MCP)

| TC        | 결과 | 확인 내용                                                                                                                                                                                                                                                                                         |
| --------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-021-01 | ✅   | 가짜 서버 5건(승인 만료경계 2, 대기, 거절, 번호 누락). 정상 3건 구간은 별도 시나리오 없이 5건에 포함해 확인. 결과 5건이 서버 응답 순서(발행일 내림차순)로 표시. 쿼리 본문에 `sorts: 발행일 descending`, 한 화면 로드당 `dataSources.query` 1회. 실제 노션 6건도 직접 API 호출 결과와 순서·값 일치 |
| TC-021-02 | ✅   | 번호 누락 행이 `정보 누락`으로 남음. 서버 로그 `{"event":"estimate_list_incomplete","fields":["quoteNumber"],"id":"00000000"}`로 필드명과 ID 앞 8자리만 기록. 나머지 행 정상                                                                                                                      |
| TC-021-03 | ✅   | 429: 노션 호출 3회(1+재시도 2) 후 "요청이 많아 목록을 불러오지 못했습니다" 안내. 응답 없음(타임아웃): 약 10초 후 연동 오류 화면. 이 경로에서 원본 오류 문구 미노출                                                                                                                                |
| TC-021-04 | ✅   | 0건 → 빈 배열(빈 상태 문구). 101건 → `start_cursor` 2페이지 조회(2회), 화면 101행, 마지막 GEN-101                                                                                                                                                                                                 |
| TC-021-05 | ✅   | 유효기간 2026-10-28(서울 오늘) → 승인, 2026-10-27 → 만료됨                                                                                                                                                                                                                                        |
| TC-021-06 | ✅   | 실제 노션 `TEST-PRICE-001` 공개 상세: 공급가액 2,400,000, 부가세 240,000, 총액 2,640,000. PDF 200 `%PDF`. 대기·정보누락 페이지는 기존 안내 그대로                                                                                                                                                 |
| TC-021-07 | ✅   | `/admin/login`, 공개 상세, `/`의 HTML과 스크립트 62개에서 노션 키 값, `list-estimates`, `NOTION_API_KEY`, 시크릿·비밀번호 문자열 검색 0건                                                                                                                                                         |

## 완료 판정

TC-021-01~07 ✅. `npm run check-all`, `npm run build` 통과(2026-10-28).
