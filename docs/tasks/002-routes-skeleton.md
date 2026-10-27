# Task 002: 견적서 라우트 및 타입 골격 설계

## 목표

견적서 공유 페이지의 동적 라우트, 없음·오류 상태 파일, 타입 골격, 노션 환경변수 스키마를 준비한다. 노션 호출, 금액 계산, PDF는 포함하지 않는다.

## 결정 사항

- 라우트 위치: `src/app/estimate/[shareId]/` (shrimp-rules.md 2-2절에 세그먼트 이름이 없어 제안한 이름)
- 식별자 방식은 ROADMAP2 Q1 미결정이므로 파라미터 이름만 정하고 검증 로직은 넣지 않았다.
- 노션 환경변수는 `env.ts` 스키마에서 선택 항목으로 두었다. 홈 화면 등 노션을 쓰지 않는 페이지가 설정 없이도 뜨게 하기 위해서다. 사용하는 쪽은 `getNotionEnv()`로 누락을 검사하고, 오류 메시지에는 변수명만 담는다.

## 변경 파일

| 파일                                       | 상태 | 내용                                                                    |
| ------------------------------------------ | ---- | ----------------------------------------------------------------------- |
| `src/app/estimate/[shareId]/page.tsx`      | 신규 | 빈 안내 화면                                                            |
| `src/app/estimate/[shareId]/not-found.tsx` | 신규 | 견적서 없음 화면, 홈 링크                                               |
| `src/app/estimate/[shareId]/error.tsx`     | 신규 | 연동 오류 화면 (use client), 다시 시도 버튼, 원본 오류 미노출           |
| `src/app/estimate/[shareId]/loading.tsx`   | 신규 | Skeleton 로딩 화면                                                      |
| `src/lib/estimate/types.ts`                | 신규 | `Quote`, `QuoteItem`, `QuoteStatus`, `QuoteSummary`                     |
| `src/lib/env.ts`                           | 수정 | `NOTION_API_KEY`, `NOTION_DATABASE_ID` 선택 항목, `getNotionEnv()` 추가 |
| `.env.example`                             | 신규 | 노션 변수 이름만 있고 값은 비어 있음                                    |

## 수락 기준과 결과

| 기준                                              | 결과                                                                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/estimate/[shareId]` 접속 시 빈 안내 화면 렌더링 | 통과 (`next start`에서 HTTP 200, 안내 문구 확인)                                                                     |
| 존재하지 않는 경로에서 not-found 화면             | 보류. 현재 page는 항상 빈 화면을 렌더링하므로 `notFound()`를 호출하지 않는다. 식별자 조회는 Task 009·011에서 붙인다. |
| env 스키마에 두 변수, 누락 시 변수명 포함 오류    | 통과. `tsx`로 확인: 둘 다 없으면 두 이름, 하나만 없으면 없는 이름만 오류 메시지에 나온다                             |
| `npm run check-all` 통과                          | 통과 (Task 001에서 CRLF 정규화 후 재확인, exit 0)                                                                    |
| `npm run build` 통과                              | 통과 (`/estimate/[shareId]`가 동적 라우트로 생성됨)                                                                  |
| 390×844에서 가로 스크롤 없음                      | 통과 (`scrollWidth` 390 = `clientWidth` 390, 제목 "견적서" 렌더링 확인)                                              |
| 클라이언트 HTML에 노션 변수 없음                  | 통과 (`NOTION_API_KEY` 문자열 0건)                                                                                   |

### check-all 참고

- `npm run typecheck`, `npm run lint`: 통과
- `npm run format:check`: 기존 저장소 파일 다수에서 경고가 나온다 (Task 002 이전부터 있던 문제). 이번 작업에서 만든 파일과 수정한 `env.ts`는 Prettier 검사를 통과한다. 따라서 `check-all` 전체는 통과가 아니다.
- `.env.example`: `.gitignore`의 `.env*` 규칙에 `!.env.example` 예외를 추가해 커밋 대상이 되도록 했다.

### notFound 보류 이유

`page.tsx`는 조회 결과가 없을 때 `notFound()`를 호출하는 경로가 아직 없다. 식별자 검증(Q1)과 노션 조회(Task 009·011)가 붙어야 의미가 있으므로 `not-found.tsx`는 그때 연결한다. 그 전까지 공유 페이지는 빈 안내 화면만 보여 준다.

## 테스트 체크리스트

검증 환경: `next start`, Playwright MCP, 2026-10-26.

| 시나리오                                              | 결과                                                                               |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `/estimate/sample-id` 접속 시 빈 안내 화면 (HTTP 200) | ✅                                                                                 |
| 390×844 가로 스크롤 없음                              | ✅                                                                                 |
| 존재하지 않는 경로 `/estimate/x/y/z`                  | 보류. Next 기본 404 (라우트 세그먼트 밖). 세그먼트 안의 not-found는 위 사유로 보류 |
| env 누락 시 변수명 포함 오류                          | ✅ (`tsx` 실행, 세 경우 모두 확인)                                                 |
| `check-all`, `build`                                  | ✅                                                                                 |
| 클라이언트 HTML에 노션 변수 없음                      | ✅ (`NEXT_PUBLIC_NOTION` 소스 0건, HTML에 `NOTION_API_KEY` 0건)                    |
