# Task 020: 관리자 인증과 접근 보호

## 명세

- 환경변수 `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`(32자 이상)을 `src/lib/env.ts`에 선택 항목으로 추가하고 `getAdminEnv()`(누락 시 변수명만 알림)와 `getAdminEnvIssues()`를 둔다. `.env.example`도 함께 고쳤다(`NEXT_PUBLIC_APP_URL` 포함).
- 로그인 `src/app/admin/login/page.tsx`: 네이티브 `<form>` + Server Action(`actions.ts`). 비밀번호는 HMAC 해시 후 `timingSafeEqual`로 비교한다. 실패하면 1초 고정 지연 후 같은 문구로 `?error=1` 리디렉션(G5). 입력값은 응답에 담지 않는다.
- 세션: `src/lib/admin/session-token.ts`(서명·검증, HMAC-SHA256, 12시간)와 `session.ts`(쿠키, `requireAdminSession`). 쿠키 `admin_session`: `httpOnly`, `sameSite=lax`, `path=/admin`, 운영에서 `secure`.
- 보호 2겹: `src/middleware.ts`(Node 런타임, matcher `/admin`, `/admin/:path*`)와 `src/app/admin/estimates/layout.tsx`의 `requireAdminSession()`. 관리자 응답에 `Cache-Control: private, no-store`.
- 로그아웃 Server Action은 쿠키를 만료시킨다. 헤더에는 로그인 상태일 때만 로그아웃 버튼이 보인다.
- `next` 파라미터는 `/admin` 아래 내부 경로만 허용한다(`sanitizeNextPath`).

## 설계 결정

- Next 15.5의 Node 런타임 middleware(`config.runtime = 'nodejs'`)를 써서 `node:crypto`를 그대로 사용한다. 추가 패키지 없음.
- 레이아웃은 로그인 화면도 감싸므로 `admin/layout.tsx`에서는 리디렉션하지 않고, 보호는 `admin/estimates/layout.tsx`와 Task 022의 데이터 함수 호출부에서 한다. 라우트 그룹은 쓰지 않았다.
- 서명 토큰 로직은 middleware가 `next/headers` 없이 쓸 수 있게 `session-token.ts`로 분리했다.

## 변경 파일

- 추가: `src/middleware.ts`, `src/lib/admin/{session,session-token}.ts`, `src/app/admin/login/{page.tsx,actions.ts}`, `src/app/admin/estimates/layout.tsx`
- 수정: `src/lib/env.ts`, `.env.example`, `src/app/admin/layout.tsx`

## 테스트 결과 (2026-10-28, 개발 서버, 테스트용 비밀번호·시크릿을 셸 환경변수로만 주입, Playwright MCP)

| TC        | 결과 | 확인 내용                                                                                                                                                                                                                                |
| --------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-020-01 | ✅   | 올바른 비밀번호 → `/admin/estimates` 진입(`next` 반영). 로그아웃 → `/admin/login`, 이후 `/admin/estimates`는 다시 로그인으로 이동                                                                                                        |
| TC-020-02 | ✅   | 틀린 비밀번호 → "비밀번호가 올바르지 않습니다." 고정 문구, 소요 약 1.3초, 입력 필드와 HTML에 입력값 없음, `admin_session` 쿠키 없음, 로그인 POST 응답에 Set-Cookie 없음                                                                  |
| TC-020-03 | ✅   | 비로그인 `/admin/estimates` → 307 `/admin/login?next=%2Fadmin%2Festimates`, 목록 행 0, 응답 HTML에 `INV-2026` 문자열 없음                                                                                                                |
| TC-020-04 | ✅   | 서명 틀린 쿠키, 만료 쿠키, 형식이 깨진 쿠키 → 모두 로그인으로 이동. 올바른 서명·유효 쿠키 → 목록 진입                                                                                                                                    |
| TC-020-05 | ✅   | `ADMIN_SESSION_SECRET` 없이 기동 → 로그인 화면에 "관리자 설정이 완료되지 않았습니다: ADMIN_SESSION_SECRET"(변수명만), 폼 없음. 공개 `/` 200, `/estimate/zzz` 404 정상                                                                    |
| TC-020-06 | ✅   | 쿠키 `httpOnly: true`, `sameSite: Lax`, `path: /admin`, 유효 12시간. `document.cookie`에서 보이지 않음. 페이지 HTML에 비밀번호·시크릿 문자열 없음. `secure`는 개발(http)에서 false이고 코드는 운영에서만 true(운영 확인은 Task 025 범위) |
| TC-020-07 | ✅   | 공개 홈 200·404 정상. 로그인 쿠키 없는 요청으로 실제 노션 공개 상세 200, PDF 200(`application/pdf`, `%PDF`) — middleware가 공개 경로를 가로채지 않음(Task 022에서 실행). "비로그인 목록 노출 없음"은 TC-020-03으로 대체 확인             |
| TC-020-08 | ✅   | 390×844 로그인 화면 `scrollWidth` 390 = `clientWidth` 390                                                                                                                                                                                |

## 완료 판정

TC-020-01~08 ✅(TC-020-07의 공개 상세·PDF는 Task 022에서 실행). `npm run check-all`, `npm run build` 통과(2026-10-28). Phase 7 착수 조건(비로그인 목록 노출 없음) 충족.
