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
| env 스키마에 두 변수, 누락 시 변수명 포함 오류    | 통과 (`getNotionEnv()`가 누락된 변수명만 담은 오류를 던지도록 구현. 실행 검증은 Task 008에서 진행)                   |
| `npm run check-all` 통과                          | 아래 참고                                                                                                            |
| `npm run build` 통과                              | 통과 (`/estimate/[shareId]`가 동적 라우트로 생성됨)                                                                  |
| 390×844에서 가로 스크롤 없음                      | 미실행 (Playwright 점검 전). 구조상 Container와 반응형 클래스만 사용했다.                                            |
| 클라이언트 HTML에 노션 변수 없음                  | 통과 (`NOTION_API_KEY` 문자열 0건)                                                                                   |

### check-all 참고

- `npm run typecheck`, `npm run lint`: 통과
- `npm run format:check`: 기존 저장소 파일 다수에서 경고가 나온다 (Task 002 이전부터 있던 문제). 이번 작업에서 만든 파일과 수정한 `env.ts`는 Prettier 검사를 통과한다.

## 테스트 체크리스트

이 Task는 노션 연동과 비즈니스 로직을 포함하지 않으므로 Playwright 시나리오는 실행하지 않았다. 390×844 확인은 Task 005 이후 화면이 생길 때 같이 진행한다.
