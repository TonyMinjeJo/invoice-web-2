# Task 001: 프로젝트 기본 세팅 및 공통 레이아웃 구성 (검증 및 마무리)

## 목표

Next.js 15.5.3 App Router, TailwindCSS v4, shadcn/ui, 루트 레이아웃, 헤더, 푸터, 메인·모바일 내비게이션, 테마 provider와 토글, 공통 UI 컴포넌트가 이미 구현되어 있는지 확인하고, 빠진 부분만 보완한다. 새 기능은 추가하지 않는다.

## 확인 결과

| 항목                                                                             | 결과                                                                                       |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/app/layout.tsx` (ThemeProvider, Toaster)                                    | 있음                                                                                       |
| `src/components/layout/header.tsx`, `footer.tsx`, `container.tsx`                | 있음                                                                                       |
| `src/components/navigation/main-nav.tsx`, `mobile-nav.tsx`                       | 있음. `navItems`는 빈 배열 (메뉴 임의 추가 금지)                                           |
| `src/components/providers/theme-provider.tsx`, `src/components/theme-toggle.tsx` | 있음. `next-themes`만 사용                                                                 |
| `src/components/ui/` shadcn 컴포넌트 (button, card, badge, table 등)             | 있음 (alert, avatar, badge, button, card, checkbox, dialog, dropdown-menu, form, input 외) |
| `package.json` Next.js 버전                                                      | `15.5.3` 고정 확인 (변경하지 않음)                                                         |
| 아이콘                                                                           | `lucide-react`만 사용                                                                      |

빠진 부분은 없었다. 기능 코드는 수정하지 않았다.

## 보완 작업 (검사 통과용)

`npm run check-all`의 `format:check`가 CRLF 줄바꿈 파일 때문에 실패했다. 프로젝트 `.prettierrc`는 `endOfLine: lf`다. Windows의 `core.autocrlf=true` 환경에서 작업 트리에 CRLF로 저장된 파일이 원인이다. 아래 파일을 Prettier로 정규화했다. 줄바꿈과 포맷만 바뀌었고, 기능 코드 변경은 없다.

- `.claude/agents/`, `.claude/commands/` 하위 Markdown
- `docs/guides/*.md` (표 정렬 등 포맷만 변경)
- `src/`의 모든 파일, 설정 파일 (`tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`, `.prettierrc`, `.vscode/*`)
- `.mcp.json`, `shrimp_data/tasks.json` (포맷만 변경)

## 테스트 체크리스트

| 시나리오                               | 결과                                        | 실행       |
| -------------------------------------- | ------------------------------------------- | ---------- |
| `npm run check-all` 통과               | ✅ exit 0                                   | 2026-10-26 |
| `npm run build` 통과                   | ✅ exit 0, `/`와 `/estimate/[shareId]` 생성 | 2026-10-26 |
| 데스크톱(1280×800) 홈 가로 스크롤 없음 | ✅ `scrollWidth` = `clientWidth`            | 2026-10-26 |
| 모바일(390×844) 홈 가로 스크롤 없음    | ✅ `scrollWidth` 390 = `clientWidth` 390    | 2026-10-26 |
| 테마 토글 다크 전환                    | ✅ `<html class="dark">`                    | 2026-10-26 |
| 테마 토글 라이트 전환                  | ✅ `<html class="light">`                   | 2026-10-26 |
| 헤더 테마 토글 버튼 노출 (`테마 전환`) | ✅ 메뉴(라이트·다크·시스템) 표시 확인       | 2026-10-26 |

검증 환경: `next start` (프로덕션 빌드), `http://localhost:3100/`, Playwright MCP.
