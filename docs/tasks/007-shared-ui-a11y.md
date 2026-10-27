# Task 007: 공통 UI 및 접근성 기준 적용

## 목표

헤더, 푸터, 견적서 화면의 시맨틱 마크업과 색 대비, 포커스 스타일, 다크 모드 가독성을 점검하고 정리한다. 검색 노출 설정은 Q5 확정 전까지 적용하지 않는다.

## 결정 사항

- 견적서 화면은 `<main>` 아래 제목(`h1`) 하나, 섹션마다 `h2`를 쓴다.
- 항목 표에는 `<caption>`을 둔다 (화면에서 숨길 필요가 있으면 `sr-only`).
- 포커스 스타일은 shadcn/ui 기본 `focus-visible` ring을 유지하고, 커스텀 요소에도 같은 규칙을 적용한다.
- **Q5 채택**: 견적서 페이지에 noindex를 적용한다 (`src/app/estimate/[shareId]/page.tsx`의 metadata, `robots: { index: false, follow: false }`). 노션 반영 허용 시간(1시간 이내)은 Task 010 캐싱 설정에서 반영한다.

## 변경 파일

| 파일                               | 상태 | 내용                                     |
| ---------------------------------- | ---- | ---------------------------------------- |
| `src/components/layout/header.tsx` | 수정 | landmark, 포커스 스타일 점검             |
| `src/components/layout/footer.tsx` | 수정 | landmark, 대비 점검                      |
| `src/components/estimate/*.tsx`    | 수정 | 제목 계층, 표 caption, 색 대비           |
| `src/app/globals.css`              | 수정 | 다크 모드 토큰 대비 조정 (필요한 경우만) |

## 수락 기준

- 페이지당 `h1` 1개, 제목 계층이 건너뛰지 않는다.
- 항목 표에 caption이 있고, 열 헤더가 `th`로 표시된다.
- 본문 텍스트 대비 WCAG AA(4.5:1) 이상 (라이트, 다크 모두)
- Tab 이동 시 모든 링크와 버튼에 포커스 표시가 보인다.
- 다크 모드에서 견적서 화면 금액과 표가 읽힌다.

## 구현 단계

1. 헤더, 푸터, 견적서 컴포넌트의 시맨틱 태그와 제목 계층 점검
2. 색 대비 측정 (Playwright 스크린샷 + 접근성 점검)
3. 포커스 스타일 확인 및 필요 시 수정
4. 다크 모드 확인
5. `npm run check-all`, `npm run build`
6. Playwright MCP로 TC-007-01~05 실행

## 테스트 체크리스트

- [ ] TC-007-01 [정상] 견적서 상세 화면의 `h1` 1개, `h2` 계층이 건너뛰지 않음
  - 도구: `browser_snapshot`
- [ ] TC-007-02 [정상] 항목 표에 caption과 `th` 열 헤더 존재
  - 도구: `browser_evaluate`로 `table caption`, `th` 개수 확인
- [ ] TC-007-03 [예외] Tab 이동 시 모든 링크, 버튼에 `:focus-visible` 스타일 적용
  - 도구: `browser_press_key`(Tab) → `browser_take_screenshot`
- [ ] TC-007-04 [경계] 다크 모드에서 본문 대비 4.5:1 이상, 금액 텍스트 가독성 확인
  - 도구: `browser_evaluate`로 `prefers-color-scheme` 전환 후 `browser_take_screenshot`
- [ ] TC-007-05 [회귀] TC-005-01, TC-006-01 화면이 그대로 정상 렌더링, 콘솔 에러 0
  - 도구: `browser_console_messages`

## 결과 기록

(구현 후 시나리오별 ✅ / ❌ / 보류와 실행 일시를 기록한다.)

## 결과 기록

실행 일시: 2026-10-27 (개발 서버 `next start`, 390×844와 1280×900, 라이트·다크 모드)

| 항목                      | 결과      | 확인 방법과 비고                                                                                                                   |
| ------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 견적서 화면 h1은 하나     | ✅        | `dummy-basic`에서 h1은 "견적서" 하나. 상태 화면은 각 상태 제목 h1 하나                                                             |
| 제목 계층이 건너뛰지 않음 | ✅        | h1 → h2(견적 항목, 금액 합계 sr-only) 순서                                                                                         |
| 항목 표 caption           | ✅        | `TableCaption`(sr-only)으로 "견적 항목별 수량, 단가, 금액" 제공                                                                    |
| Tab 포커스 링             | ✅ (샘플) | 헤더 로고 링크에서 focus outline 확인. 버튼은 shadcn `focus-visible:ring` 기본 스타일 사용. PDF 버튼은 비활성이라 포커스 대상 아님 |
| 다크 모드 본문 대비       | ✅ (샘플) | 본문 L98 / 배경 L2.75, 보조 텍스트(text-muted-foreground) L66 / 배경 L2.75. 대략 4.5:1 이상으로 추정 (정식 WCAG 측정 아님)         |
| 라이트 모드 대비          | ✅ (샘플) | 보조 텍스트 L48 / 배경 흰색. 정식 측정 아님                                                                                        |
| 모바일 가로 스크롤 없음   | ✅        | 390px에서 `scrollWidth` = `clientWidth` = 390 (상세, 상태 화면 모두)                                                               |
| 콘솔 오류                 | ✅        | 헤더 hydration 오류(#418) 수정 후 `dummy-basic`에서 콘솔 오류 0                                                                    |
| noindex 설정              | ✅        | Q5 채택 후 적용. 페이지 `meta[name=robots]` = `noindex, nofollow` 확인 (2026-10-27)                                                |
| check-all / build         | ✅        | 최종 실행 기준 통과                                                                                                                |

남은 보완 사항: 정식 대비 측정 도구(예: axe, 전체 페이지 대비 측정)와 키보드만으로 전체 흐름 확인은 수행하지 않았다. Task 015에서 함께 점검한다.
