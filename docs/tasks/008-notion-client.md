# Task 008: 노션 API 클라이언트 설정

## 목표

서버 전용 노션 클라이언트를 만든다. 환경변수는 `getNotionEnv()`로 읽고, 키 값은 서버 밖으로 나가지 않는다.

## 변경 파일

| 파일                       | 상태 | 내용                                                                     |
| -------------------------- | ---- | ------------------------------------------------------------------------ |
| `src/lib/notion/client.ts` | 생성 | `server-only`, `getNotionClient()`(첫 호출 때 환경변수를 읽는 지연 생성) |
| `package.json`             | 수정 | `@notionhq/client` 5.28.0, `server-only` 0.0.1 (`^` 없이 고정)           |

## 설치한 SDK 확인 결과 (node_modules 타입 기준)

- 기본 `Notion-Version`은 `2025-09-03`이다. `client.ts`에 같은 값을 명시했다.
- 쿼리 메서드는 `databases.query`가 없고 `dataSources.query`만 있다. 호출에는 `data_source_id`가 필요하다.
- 옵션: `timeoutMs`, `retry: { maxRetries, initialRetryDelayMs, maxRetryDelayMs }`, `notionVersion`.
- 자동 재시도 기본값은 2회다. 429와 529는 모든 메서드에서, 500과 503은 GET과 DELETE에서만 재시도된다.

## 실연결 검증 (2026-10-27, 읽기 전용 호출)

- 노션 DB 조회: 200. 데이터 소스 1개. 속성은 `견적서 번호`(title), `클라이언트명`(rich_text), `발행일`·`유효기간`(date), `상태`(status), `총 금액`(number), `항목`(relation, 데이터 소스 ID 있음).
- 항목 DB 속성: `항목명`(title), `수량`·`단가`(number), `금액`(formula), `invoices`(relation).
- 잘못된 키 → 401 `unauthorized`. 키 값은 기록하지 않았다.

## 테스트 체크리스트 결과

| TC        | 결과 | 비고                                                                                                                                                                                           |
| --------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-008-01 | ✅   | 실제 키로 `getNotionClient()` 초기화 후 DB 조회 200 (Task 009 검증에서 같은 경로 사용)                                                                                                         |
| TC-008-02 | ✅   | 환경변수를 비운 상태에서 `NOTION_API_KEY, NOTION_DATABASE_ID` 이름만 담긴 오류                                                                                                                 |
| TC-008-03 | ✅   | 잘못된 키로 401 응답                                                                                                                                                                           |
| TC-008-04 | ✅   | `.next` 전체(캐시 제외)와 `.next/cache`에서 `NOTION_API_KEY` 값 검색 결과 0건. 키 값은 기록하지 않음                                                                                           |
| TC-008-05 | ✅   | `check-all` 통과(typecheck, lint, format), `npm run build` 성공. 프로덕션 서버에서 `/` 200, `/estimate/dummy-basic`·`dummy-single`·`dummy-many`·`dummy-draft`·`dummy-expired` 200, 없는 키 404 |

`/estimate/dummy-error`는 프로덕션 빌드에서 404다. 연동 오류 시뮬레이션 분기가 개발 모드에서만 동작하도록 되어 있기 때문이며, 이는 Task 011에서 제거될 예정이다.

화면 회귀는 HTTP 상태 코드와 제목 확인까지만 했다. 001~007 화면의 레이아웃과 다크 모드를 눈으로 다시 확인하지는 않았다.

## 완료 판정

TC-008-01~05 모두 통과하여 완료로 판정한다.

## 참고

- `server-only`는 `client.ts`와 `get-estimate.ts`에서 import된다. 클라이언트 컴포넌트에서 import하면 빌드가 실패하도록 막는다.
