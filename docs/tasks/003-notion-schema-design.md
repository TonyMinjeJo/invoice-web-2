# Task 003: 노션 데이터베이스 스키마 설계 (구현 제외)

## 목표

노션 견적서 DB의 속성 목록을 확정하고, 속성 → `Quote` 타입 매핑표와 Zod 스키마 초안을 작성한다. 설계 문서와 `src/lib/estimate/types.ts` 갱신까지만 한다. `@notionhq/client` 설치, API 호출, `src/lib/notion/` 코드는 Phase 3 범위이므로 만들지 않는다.

## Q4 확정 상태

| 항목               | 상태            | 근거                                                                    |
| ------------------ | --------------- | ----------------------------------------------------------------------- |
| invoices 속성 이름 | 확정 (CSV 기준) | 내보내기 파일 2종에서 같은 이름 확인                                    |
| Items 속성 이름    | 확정 (CSV 기준) | 같은 방식                                                               |
| 속성 노션 타입     | 미확정          | CSV에는 타입이 없음. Task 008·009에서 API 응답으로 확인                 |
| 상태 옵션 '발행'   | 미존재          | 현재 옵션은 '대기' 하나뿐. 사용자가 노션에 추가해야 함                  |
| 항목 순서 속성     | 없음            | Items에 순서 속성이 없음. 노션 기본 정렬을 가정하고 Task 009에서 재확인 |

Q4는 **부분 확정**이다. 속성 이름과 상태 규칙은 확정했고, 속성 타입과 '발행' 옵션은 확인 전이다.

## 노션 DB 속성 목록

확인에 쓴 자료는 `invoices`와 `Items` 내보내기 CSV다. 샘플 행은 테스트 값 1건이다.

### invoices (견적서)

| 속성명       | 노션 타입 (가정)    | 샘플 값                        | 필수   |
| ------------ | ------------------- | ------------------------------ | ------ |
| 견적서 번호  | Title 또는 Text     | `1`                            | 예     |
| 클라이언트명 | Text                | (테스트 값)                    | 예     |
| 발행일       | Date                | `2026년 10월 19일` (API는 ISO) | 예     |
| 유효기간     | Date                | `2026년 10월 27일`             | 예     |
| 상태         | Status 또는 Select  | `대기`                         | 예     |
| 총 금액      | Number 또는 Formula | `₩500,000`                     | 아니오 |
| 항목         | Relation → Items    | 항목 1건                       | 예     |

### Items (항목)

| 속성명   | 노션 타입 (가정)    | 샘플 값     | 필수                       |
| -------- | ------------------- | ----------- | -------------------------- |
| 항목명   | Title               | (테스트 값) | 예                         |
| 수량     | Number              | `1`         | 예                         |
| 단가     | Number (원)         | `₩100,000`  | 예                         |
| 금액     | Formula             | `₩100,000`  | 사용 안 함 (웹에서 재계산) |
| invoices | Relation → invoices | 견적서 1건  | 예 (역관계, 조회 키)       |

CSV에는 빈 Items 행이 2개 있다. 항목명·수량·단가가 모두 비어 있고 금액만 ₩0이다. 정제 규칙으로 제외한다 (아래 참고).

## 속성 → Quote 매핑표

| 노션 속성 (출처)   | Quote 필드            | 변환 규칙                                                             |
| ------------------ | --------------------- | --------------------------------------------------------------------- |
| page.id (invoices) | `id`                  | 그대로 사용. 공유 식별자 방식은 Q1 (노션 페이지 ID)                   |
| 견적서 번호        | `quoteNumber`         | 문자열로 변환, 공백 제거                                              |
| 클라이언트명       | `clientName`          | 공백 제거. 빈 값이면 검증 실패                                        |
| 발행일             | `issueDate`           | 노션 date의 `start`를 `YYYY-MM-DD` 문자열로 사용                      |
| 유효기간           | `validUntil`          | 같은 규칙. 만료 여부 판단은 화면(Task 006)에서 한다 (Q6)              |
| 상태               | `status`              | `발행` → `issued`, 그 외(`대기` 포함) → `draft`                       |
| 총 금액            | `notionTotalAmount`   | 정수 원. 값이 없으면 `null`. 계산에 쓰지 않고 불일치 시 로그만 남긴다 |
| 항목 (relation)    | `items`               | Items 페이지들을 조회해 `QuoteItem[]`로 변환 (아래 정제 규칙)         |
| page.id (Items)    | `QuoteItem.id`        | 그대로 사용 (React key)                                               |
| 항목명 (Items)     | `QuoteItem.name`      | 공백 제거. 빈 값이면 행 제외                                          |
| 수량 (Items)       | `QuoteItem.quantity`  | 0 이상 정수. 값이 없으면 행 제외                                      |
| 단가 (Items)       | `QuoteItem.unitPrice` | 0 이상 정수 (원). 값이 없으면 행 제외                                 |
| 금액 (Items)       | (저장하지 않음)       | 수량 × 단가로 Task 004에서 계산                                       |

`QuoteSummary`는 노션 속성과 직접 연결하지 않는다. Task 004에서 항목으로부터 계산한다.

### 항목 정제 규칙

1. 항목명·수량·단가가 모두 비어 있으면 행을 버린다 (CSV의 빈 행 2개가 해당).
2. 일부만 비어 있으면 검증 실패로 본다. 조용히 버리지 않는다.
3. 수량과 단가는 0 이상 정수다. 소수나 음수는 실패로 본다.

## 금액 규칙

- 공급가액 = Σ(수량 × 단가)로 항목에서 직접 계산한다 (사용자 결정, 2026-10-26).
- 노션 `총 금액`과 계산값이 다르면 웹은 계산값을 쓰고 서버 로그에 경고를 남긴다.
  - 샘플 데이터에서 노션 `총 금액` ₩500,000과 항목 합계 ₩100,000이 달랐다. 이 경우에 해당한다.
- 부가세와 반올림은 **Q2 미확정**이다. ROADMAP2 임시 제안은 "원 단위 정수, 부가세는 내림"이다. 이 문서에서는 기록만 하고 확정하지 않는다.

## 상태와 조회 조건

| 노션 상태 | QuoteStatus | 공유 링크 조회 | 비고                                 |
| --------- | ----------- | -------------- | ------------------------------------ |
| 발행      | `issued`    | 가능           | 옵션 추가 필요 (미존재)              |
| 대기      | `draft`     | 불가           | 임시 상태. 견적서 없음 화면으로 응답 |
| 그 외     | `draft`     | 불가           | 알 수 없는 값도 조회 불가로 처리     |

- 유효기간이 지난 `issued` 견적서는 조회를 허용하고 "유효기간 만료" 안내를 표시한다 (Q6 임시 제안, Task 006·011).
- 조회 가능 여부 판단은 Task 009에서 한다. 이 문서는 조건만 정의한다.

## Zod 스키마 초안 (문서 전용, 실제 파일 아님)

아래 코드는 `src/lib/notion/estimate-schema.ts`가 생기면 옮길 초안이다. Phase 3 전에는 파일을 만들지 않는다.

```ts
import { z } from 'zod'

// 노션 날짜는 ISO `YYYY-MM-DD` 문자열이어야 한다
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

// 노션 상태 값. 그 외 값은 draft로 처리한다 (조회 불가)
const toQuoteStatus = (notionStatus: string) =>
  notionStatus === '발행' ? 'issued' : 'draft'

// Items 한 행. 값이 없는 행은 정제 단계에서 걸러낸다
const notionItemRow = z.object({
  id: z.string().min(1),
  name: z.string().trim(),
  quantity: z.number().int().min(0).nullable(),
  unitPrice: z.number().int().min(0).nullable(),
})

// 빈 행은 이 스키마 전에 걸러낸다. 여기서는 일부만 채워진 행을 실패로 만든다
const isEmptyRow = (row: z.infer<typeof notionItemRow>) =>
  row.name === '' && row.quantity === null && row.unitPrice === null

export const quoteItemSchema = notionItemRow
  .refine(
    row =>
      !isEmptyRow(row) &&
      row.name !== '' &&
      row.quantity !== null &&
      row.unitPrice !== null,
    { message: 'partially filled or empty row' }
  )
  .transform(row => ({
    id: row.id,
    name: row.name,
    quantity: row.quantity as number,
    unitPrice: row.unitPrice as number,
  }))

export const quoteSchema = z.object({
  id: z.string().min(1),
  quoteNumber: z.string().trim().min(1),
  clientName: z.string().trim().min(1),
  issueDate: isoDate,
  validUntil: isoDate,
  status: z.string().transform(toQuoteStatus),
  notionTotalAmount: z.number().int().min(0).nullable(),
  items: z.array(notionItemRow),
})
```

빈 행을 제외하는 처리는 `items` 배열 단계에서 한다. 실제 구현에서는 `isEmptyRow`로 빈 행을 먼저 버린 뒤 `quoteItemSchema`를 각 행에 적용한다.

검증 결과 (2026-10-26, 임시 스크립트를 scratchpad에서 실행 후 삭제):

- 샘플 항목 1건 + 빈 행 2건 → 빈 행 2건 제외, 나머지 1건 통과
- `대기` → `draft`, `발행` → `issued`
- 항목명만 있고 수량·단가가 없는 행은 거부
- 노션 날짜 형식이 `2026년 10월 19일`이면 거부 (ISO 변환 필요)

## 용어 확인 필요

- `shrimp-rules.md`는 노션 응답 타입을 `Estimate`라고 쓴다. ROADMAP2와 기존 코드는 `Quote`를 쓴다. 이 작업은 `Quote`를 유지한다. `shrimp-rules.md`의 `Estimate` 표현은 Phase 3 전에 맞춘다.

## 변경 파일

- `docs/tasks/003-notion-schema-design.md` (신규, 이 문서)
- `src/lib/estimate/types.ts` (수정): `recipientName` → `clientName`, `QuoteItem.id` 추가, `Quote.notionTotalAmount` 추가, 상태 주석 갱신
- `docs/ROADMAP2.md`: Task 003 ✅, Q4 행에 부분 확정 결과 기록

## 보안과 개인정보

- API 키, 데이터베이스 ID, 실제 고객 정보는 이 문서에 적지 않았다.
- 샘플 값은 테스트 값이며 실제 고객 이름이 아니다.

## 테스트 체크리스트

| 시나리오                                               | 결과                |
| ------------------------------------------------------ | ------------------- |
| 매핑표의 모든 `Quote`/`QuoteItem` 필드에 출처가 있다   | ✅                  |
| 상태별 조회 가능 여부가 명시되어 있다                  | ✅                  |
| Q4 확정 여부가 표시되어 있다 (부분 확정)               | ✅                  |
| 문서에 API 키나 고객 정보가 없다                       | ✅                  |
| `src/lib/notion/`이 생성되지 않았다                    | ✅                  |
| Zod 초안이 CSV 샘플(항목 1건 + 빈 행 2건)에서 동작한다 | ✅ (아래 검증 결과) |
| `npm run check-all`, `npm run build` 통과              | ✅ (아래 검증 결과) |

검증 결과 (2026-10-26):

- `npm run check-all`: exit 0
- `npm run build`: exit 0
- `rg recipientName src`: 0건 (`types.ts`에서 `clientName`으로 교체)
