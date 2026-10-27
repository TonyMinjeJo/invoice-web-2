# Development Guidelines (AI 에이전트 전용)

> 이 문서는 AI 에이전트가 이 저장소에서 작업할 때 따르는 **프로젝트 고유 규칙**만 담습니다.
> 일반 개발 지식과 기능 설명은 포함하지 않습니다. 사람용 안내는 `CLAUDE.md`, `docs/`를 봅니다.
> 기준일: 2026-10-24

---

## 1. 프로젝트 개요

- **목적**: 노션 견적서 DB 내용을 공유 링크로 웹에서 조회하고 PDF로 다운로드하는 **조회 전용 MVP**.
- **원본 데이터**: 노션 데이터베이스. 입력·수정은 노션에서만 한다. 웹은 읽기만 한다.
- **고정 스택**: Next.js 15.5.3 (App Router, Turbopack), React 19.1.0, TypeScript 5, TailwindCSS v4, shadcn/ui (`new-york`), Radix UI, lucide-react, react-hook-form, zod 4, sonner, next-themes, usehooks-ts.
- **설치 예정 (아직 미설치)**: `@notionhq/client@5.28.0` (Phase 1), `@react-pdf/renderer@4.9.0` (Phase 3).
- **현재 구현 상태**: `/` 홈에 안내 문구만 있다. 견적 조회 라우트, 노션 연동, PDF 기능 모두 없다.

---

## 2. 프로젝트 구조

### 2-1. 현재 존재하는 파일 (실제 확인됨)

```
src/app/
  layout.tsx            # 루트 레이아웃 (lang="ko", ThemeProvider, Toaster)
  page.tsx              # 홈 `/` (안내 문구)
  globals.css
  favicon.ico
src/components/
  layout/container.tsx, header.tsx, footer.tsx
  navigation/main-nav.tsx, mobile-nav.tsx   # navItems = [] (빈 배열)
  providers/theme-provider.tsx
  theme-toggle.tsx
  ui/                   # shadcn 컴포넌트 18종 (button, card, dialog, sheet, sonner 등)
src/lib/
  utils.ts              # cn()
  env.ts                # NODE_ENV, VERCEL_URL, NEXT_PUBLIC_APP_URL
docs/
  PRD.md                # ⚠️ PRD 생성 "프롬프트"만 있음. 기능 명세 아님. 상단 "확정된 전제"가 최우선 기준
  ROADMAP.md            # 작업 목록 (체크 기준)
  ROADMAP2.md
  guides/               # 기술 가이드 (일부 예시는 MVP와 불일치 — 3절 참조)
```

### 2-2. 아직 없는 파일 (ROADMAP 계획, 만들 때 이 경로를 따른다)

```
src/lib/notion/client.ts              # 서버 전용 Notion 클라이언트
src/lib/notion/estimate-schema.ts     # Zod: 노션 응답 → Estimate
src/lib/notion/get-estimate.ts        # 공유 식별자로 1건 조회
src/lib/estimate/calculate.ts         # 금액 계산 순수 함수 (단일 소스)
src/components/estimate/              # 뷰어 컴포넌트 (line-items-table.tsx 등)
src/components/pdf/estimate-document.tsx
src/app/<견적 동적 세그먼트>/page.tsx, loading.tsx, not-found.tsx, error.tsx
.env.example
```

- **경로 변경 금지**: 위 경로와 다르게 만들려면 먼저 ROADMAP에 이유를 남긴다.
- `src/hooks/`는 `components.json` alias에만 정의되어 있고 **폴더는 아직 없다**. 훅이 필요하면 이 폴더를 만든다.

---

## 3. 삭제된 파일과 무시할 예시

- **삭제됨 (되살리지 않는다)**: `src/app/login/`, `src/app/signup/`, `login-form.tsx`, `signup-form.tsx`, `src/components/sections/` (hero, features, cta), `public/*.svg` 기본 에셋.
- **무시할 예시**: `docs/guides/`의 로그인, 회원가입, 랜딩 섹션 예시는 MVP 전제(로그인 없음)와 다르다. 코드 작성에 참고하지 않는다.
- **인증 관련 코드 금지**: 세션, 쿠키 인증, 로그인 폼, 권한 가드를 추가하지 않는다.

---

## 4. 코드 규칙

### 4-1. 포맷 (`.prettierrc`, 자동 적용)

- 세미콜론 없음 (`semi: false`).
- 작은따옴표 사용 (`'견적서'`).
- 들여쓰기 2칸, 줄 폭 80자, `trailingComma: "es5"`.
- 화살표 함수 인자 괄호 생략: `item => ...` (O), `(item) => ...` (X).
- Tailwind 클래스 순서는 `prettier-plugin-tailwindcss`에 맡긴다. 손으로 정렬하지 않는다.
- 커밋 전 `lint-staged`가 `eslint --fix`와 `prettier --write`를 실행한다 (`.husky/pre-commit`).

### 4-2. 네이밍과 export

- 파일명: **kebab-case** (`line-items-table.tsx`). 컴포넌트 함수명: **PascalCase** (`LineItemsTable`).
- **Named export를 기본으로 쓴다.**
- **default export는 Next.js 특수 파일에만 쓴다**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
- 같은 컴포넌트를 named와 default로 동시에 export하지 않는다.

### 4-3. Import

- 프로젝트 내부 import는 **`@/` alias**를 쓴다: `@/components/ui/button`, `@/lib/utils`.
- **상대 경로 금지**: `../../` 금지. 예외로 보이는 `header.tsx`의 `import { Container } from './container'`는 **정리 대상**이다. 새 코드에 같은 방식을 쓰지 않는다.
- import 순서: ① 외부 라이브러리 → ② `@/` 내부 모듈 → ③ 그 외.

### 4-4. 언어와 주석

- **주석과 UI 문구는 한국어**를 쓴다. 기존 예: `// 내비게이션 항목은 페이지를 구현할 때 추가합니다.`
- 변수명, 함수명, 타입명은 영어.
- 주석은 "왜"가 필요한 곳에만 쓴다. 코드를 그대로 번역한 주석은 쓰지 않는다.

### 4-5. 파일 크기

- 한 파일 300줄 이하. 넘으면 `components/<카테고리>/` 아래로 분리한다.

### 4-6. 클라이언트 경계

- `'use client'`는 **상호작용이 필요한 파일 최상단에만** 쓴다 (현재: `header.tsx`, `main-nav.tsx`, `mobile-nav.tsx`, `theme-toggle.tsx`).
- 견적 조회와 PDF 관련 컴포넌트는 기본적으로 **서버 컴포넌트**로 만든다.

---

## 5. 기능 구현 규칙

### 5-1. 데이터 흐름 (계획)

```
Notion DB
  → src/lib/notion/get-estimate.ts      (서버 전용, 조회)
  → src/lib/notion/estimate-schema.ts   (Zod 매핑 → Estimate 타입)
  → src/lib/estimate/calculate.ts       (금액 계산: 공급가액, 부가세 10%, 합계)
  → 뷰어 페이지 (서버 컴포넌트)  /  PDF Route Handler → @react-pdf/renderer
```

### 5-2. 노션 연동

- **MUST**: Notion 클라이언트는 `src/lib/notion/` 서버 모듈에서만 만든다 (ROADMAP 1-1).
- **MUST NOT**: `'use client'` 파일이나 클라이언트 컴포넌트에서 노션 모듈을 import 하지 않는다.
- **MUST NOT**: `NOTION_TOKEN`에 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.
- **MUST**: 노션 응답 속성은 `estimate-schema.ts`의 Zod 매핑을 거친 뒤 `Estimate` 타입으로만 UI와 PDF에 넘긴다.
- **MUST NOT**: UI나 PDF 컴포넌트에서 노션 원본 속성 이름을 직접 읽는다.
- 노션 환경변수를 추가하면 `src/lib/env.ts` 스키마와 `.env.example`을 **같은 작업에서** 함께 고친다.

### 5-3. 금액 계산

- **MUST**: 금액 계산은 `src/lib/estimate/calculate.ts`의 **순수 함수 하나**에서만 한다.
- **MUST**: 뷰어와 PDF는 이 함수의 결과만 쓴다.
- **MUST NOT**: 컴포넌트, 페이지, PDF 문서 안에서 합계나 부가세를 직접 계산하지 않는다.
- **MUST**: 부가세는 **10%** (PRD 확정 전제). 다른 세율을 쓰지 않는다.
- 반올림 규칙은 **Q5 미결정**. 확정 전에는 임의로 `Math.round`, `Math.floor` 등을 고르지 않는다.

### 5-4. 공유 링크와 조회 실패

- 로그인 없이 공유 링크로만 접근한다.
- 식별자 방식은 ROADMAP2 **Q1**이며, 임시 기본값은 노션 페이지 ID(하이픈 유무와 무관하게 32자리 16진수로 정규화)다. 순차 ID나 추측 가능한 값을 쓰지 않는다.
- 존재하지 않는 식별자 → `not-found.tsx`.
- 노션 API 오류 → `error.tsx`.
- 로딩 상태 → `loading.tsx` (shadcn `Skeleton` 사용).

### 5-5. PDF

- **MUST**: 다운로드 Route Handler 파일에 `export const runtime = 'nodejs'`를 명시한다 (ROADMAP 3-6).
- **MUST**: `Content-Disposition`의 한글 파일명은 인코딩한다.
- **MUST**: PDF는 뷰어와 같은 `calculate.ts` 결과를 쓴다.
- 한글 폰트는 **Q14 미결정**. 폰트 파일을 임의로 내려받아 넣지 않는다.

### 5-6. 조회 전용 원칙

- **MUST NOT**: 견적서를 생성, 수정, 삭제하는 UI, Server Action, API를 만들지 않는다.
- **MUST NOT**: 폼을 만들지 않는다. 입력 기능이 없으므로 react-hook-form은 현재 쓸 곳이 없다.

---

## 6. 프레임워크와 라이브러리 규칙

### 6-1. Next.js 15

- **MUST**: `params`와 `searchParams`는 `Promise`다. 사용 전에 `await` 한다.
- **MUST**: Next.js 버전(15.5.3 고정 vs 15.5.28 패치)은 **Q11 미결정**. 결정 전에는 `package.json`의 `next` 버전을 바꾸지 않는다.

### 6-2. shadcn/ui

- **MUST**: 새 컴포넌트는 CLI로 추가한다: `npx shadcn@latest add <name>`. 스타일은 `new-york`, 아이콘은 `lucide`, 기준 색은 `neutral` (`components.json`).
- `src/components/ui/`에는 **순수 UI만** 둔다. 비즈니스 로직과 노션 호출을 넣지 않는다.
- 토스트는 `sonner`를 쓴다. `layout.tsx`에 `<Toaster />`가 이미 있다.

### 6-3. 버전 고정 패키지

- **MUST**: 노션 SDK와 PDF 라이브러리는 **정확한 버전**으로 설치한다: `npm install @notionhq/client@5.28.0`, `npm install @react-pdf/renderer@4.9.0`. `^`를 붙이지 않는다.
- **MUST NOT**: ROADMAP에 없는 라이브러리를 추가하지 않는다. 필요하면 ROADMAP 항목으로 먼저 기록한다.
- **MUST NOT**: 테스트 러너를 임의로 설치하지 않는다 (Q9 미결정).

### 6-4. 테마, 아이콘, 훅

- 테마는 `next-themes`(`ThemeProvider`, `useTheme`)만 쓴다. `localStorage`로 테마를 직접 다루지 않는다.
- 아이콘은 `lucide-react`만 쓴다.
- 훅은 `usehooks-ts`를 우선 쓴다 (`header.tsx`의 `useMediaQuery` 예).

---

## 7. 워크플로우

### 7-1. 작업 순서

1. **작업 전**: `docs/ROADMAP.md`에서 해당 항목(예: 2-1, 1-4)과 **DoD(완료 기준)**를 읽는다.
2. **미결정 항목 확인**: 작업이 Q 항목(Q2~Q16)에 걸리면 9절 결정 트리를 따른다.
3. **구현**: 5절과 6절 규칙을 따른다.
4. **검사**: `npm run check-all` → `npm run build` 순서로 실행하고 **둘 다 통과**해야 완료로 본다.
5. **로드맵 갱신**: 완료한 항목은 `docs:update-roadmap` 스킬로 `- [x]`로 바꾼다. 요구 ID 추적표(5절)의 상태도 같이 갱신한다.

### 7-2. 완료 보고 형식

- 실행한 검사 명령과 결과를 적는다 (`check-all` 통과 여부, `build` 통과 여부).
- 실행하지 못한 검사는 **"실행하지 않음"**이라고 밝힌다. 통과한 것처럼 쓰지 않는다.

### 7-3. 커밋 (사용자가 요청할 때만)

- 커밋 제목 형식: `이모지 type: 설명` (예: `✨ feat: ...`, `📝 docs: ...`, `🔧 chore: ...`). 기존 히스토리를 따른다.

---

## 8. 핵심 파일 연동 규칙

한 파일을 바꾸면 아래 파일도 **같은 작업에서** 확인한다.

| 변경 내용                | 함께 확인하거나 수정할 파일                                                       |
| ------------------------ | --------------------------------------------------------------------------------- |
| 노션 환경변수 추가       | `src/lib/env.ts`, `.env.example`, ROADMAP 0-6 / 4-5                               |
| 노션 DB 속성 변경        | `src/lib/notion/estimate-schema.ts` (Zod 매핑만 수정), ROADMAP 1-2                |
| 금액 규칙 변경           | `src/lib/estimate/calculate.ts` 한 곳만 수정 → 뷰어와 PDF 금액 대조 (ROADMAP 3-8) |
| 내비게이션 항목 추가     | `main-nav.tsx`의 `navItems`와 `mobile-nav.tsx` 둘 다 확인                         |
| 새 페이지 라우트 추가    | 해당 `loading.tsx`, `not-found.tsx`, `error.tsx` 필요 여부 확인, ROADMAP 체크     |
| 페이즈 완료              | ROADMAP 체크 표시, `check-all`, `build`                                           |
| 레이아웃 메타데이터 변경 | `layout.tsx`의 `metadata`, 페이지별 `title` (ROADMAP 2-7)                         |
| shadcn 컴포넌트 추가     | `components.json` 설정과 일치 확인, 생성된 `ui/` 파일만 추가                      |

---

## 9. 모호할 때의 결정 트리

위에서부터 순서대로 적용한다.

1. **PRD 확정 전제와 충돌하는가?** (`docs/PRD.md` 상단 "확정된 전제")
   → 전제를 따른다. 로그인, 관리 화면, 견적 승인·서명, 이메일 발송은 **항상 제외**다.
2. **ROADMAP의 미결정 Q 항목이 작업을 막는가?**
   → 추측으로 구현하지 않는다. 막힌 기능만 보류하고 나머지를 끝낸다. 완료 보고에 막힌 Q 번호를 적는다.
3. **버전이 충돌하는가?** (예: Next.js 15.5.3 vs 15.5.28)
   → `package.json`을 바꾸지 않는다. Q11로 보고한다.
4. **기존 코드와 `docs/guides/` 예시가 충돌하는가?**
   → 현재 코드와 PRD 전제를 따른다. 예시는 무시한다.
5. **새 라이브러리나 새 폴더가 필요한가?**
   → ROADMAP에 명시되어 있으면 추가한다. 없으면 ROADMAP에 먼저 항목을 기록하고 진행하거나, 보류한다.
6. **메뉴 항목이 필요한가?**
   → PRD에 메뉴 구조가 없으므로(Q1) `navItems`는 빈 배열로 둔다. 메뉴를 임의로 추가하지 않는다.

---

## 10. 금지 사항

- ❌ 견적서 생성, 수정, 삭제 UI나 API 추가
- ❌ 로그인, 회원가입, 세션, 인증 가드 추가
- ❌ 발행자 관리 화면, 승인·서명, 이메일 발송 추가
- ❌ `NEXT_PUBLIC_` 접두사가 붙은 노션 토큰 또는 DB ID
- ❌ 클라이언트 컴포넌트에서 노션 모듈 import
- ❌ 컴포넌트나 PDF 안에서 금액 계산 (부가세 10% 이외의 세율 포함)
- ❌ 추측 가능한 순차 ID나 식별자로 견적서 조회
- ❌ PRD에 없는 메뉴 항목 추가
- ❌ 상대 경로 import (`../../`) 추가
- ❌ 페이지 파일 외 default export 추가
- ❌ 삭제된 `login`, `signup`, `sections` 파일 복원
- ❌ 미결정 Q 항목을 임의로 확정해서 코드나 문서에 기록
- ❌ `check-all` 또는 `build`를 실행하지 않고 완료 보고
- ❌ ROADMAP에 없는 테스트 러너, 폼 라이브러리, 상태 관리 라이브러리 설치
- ❌ 노션 SDK, PDF 라이브러리의 `^` 범위 버전 설치

---

## 11. 갱신 규칙

- 이 문서는 프로젝트 구조, 스택, 확정 전제가 바뀌면 **같은 작업에서** 갱신한다.
- Q 항목이 확정되면 해당 규칙을 고친 뒤 ROADMAP 7절의 Q 항목을 함께 정리한다.
- 삭제된 파일이나 경로를 규칙에 남기지 않는다. 존재하지 않는 경로를 규칙에 적으면 즉시 제거한다.
