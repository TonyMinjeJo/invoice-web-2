import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { QuoteIssuer } from '@/components/estimate/quote-header'
import { calculateLineAmount, calculateSummary } from '@/lib/estimate/calculate'
import type { Quote } from '@/lib/estimate/types'
import { PDF_FONT_FAMILY } from '@/lib/pdf/register-fonts'

interface EstimateDocumentProps {
  quote: Quote
  issuer: QuoteIssuer
}

const styles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 10,
    padding: 40,
    color: '#111827',
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
  muted: { color: '#6b7280', fontSize: 9 },
  infoBox: {
    marginTop: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoCell: { width: '50%', marginBottom: 8 },
  label: { color: '#6b7280', fontSize: 9, marginBottom: 2 },
  value: { fontSize: 10 },
  table: { marginTop: 22, borderTopWidth: 1, borderColor: '#111827' },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 6,
  },
  head: { fontWeight: 700, fontSize: 9, color: '#374151' },
  colName: { flex: 4, paddingRight: 8 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 2, textAlign: 'right' },
  colAmount: { flex: 2, textAlign: 'right' },
  summary: { marginTop: 14, alignSelf: 'flex-end', width: 220 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  total: {
    fontWeight: 700,
    fontSize: 12,
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 6,
  },
  note: { marginTop: 14, color: '#b91c1c', fontSize: 9 },
})

// 원 단위 표기. 금액 값은 calculate.ts 결과만 쓴다.
function won(value: number): string {
  return `₩${value.toLocaleString('ko-KR')}`
}

// 견적서 PDF 문서. 화면과 같은 데이터(Quote)와 계산 함수(calculate.ts) 결과만 쓴다.
// 발행 상태 판정은 호출하는 쪽(getPublishedQuote)이 한다.
export function EstimateDocument({ quote, issuer }: EstimateDocumentProps) {
  const { summary, excludedItemIds } = calculateSummary(quote.items)

  const rows = quote.items.flatMap(item => {
    const amount = calculateLineAmount(item.quantity, item.unitPrice)
    return amount === null ? [] : [{ ...item, amount }]
  })

  return (
    <Document
      title={`견적서 ${quote.quoteNumber}`}
      author={issuer.name}
      language="ko"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>견적서</Text>
        <Text style={styles.muted}>견적 번호 {quote.quoteNumber}</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoCell}>
            <Text style={styles.label}>발행자</Text>
            <Text style={styles.value}>{issuer.name}</Text>
            {issuer.contact ? (
              <Text style={styles.muted}>{issuer.contact}</Text>
            ) : null}
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.label}>수신자</Text>
            <Text style={styles.value}>{quote.clientName}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.label}>발행일</Text>
            <Text style={styles.value}>{quote.issueDate}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.label}>유효기간</Text>
            <Text style={styles.value}>{quote.validUntil}까지</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.head]}>
            <Text style={styles.colName}>항목명</Text>
            <Text style={styles.colQty}>수량</Text>
            <Text style={styles.colPrice}>단가</Text>
            <Text style={styles.colAmount}>금액</Text>
          </View>
          {rows.map(row => (
            <View key={row.id} style={styles.row} wrap={false}>
              <Text style={styles.colName}>{row.name}</Text>
              <Text style={styles.colQty}>
                {row.quantity.toLocaleString('ko-KR')}
              </Text>
              <Text style={styles.colPrice}>{won(row.unitPrice)}</Text>
              <Text style={styles.colAmount}>{won(row.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>공급가액</Text>
            <Text>{won(summary.supplyAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>부가세 (10%)</Text>
            <Text>{won(summary.vatAmount)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.total]}>
            <Text>총액</Text>
            <Text>{won(summary.totalAmount)}</Text>
          </View>
        </View>

        {excludedItemIds.length > 0 ? (
          <Text style={styles.note}>
            금액이 올바르지 않은 항목 {excludedItemIds.length}건은 합계에서
            제외되었습니다.
          </Text>
        ) : null}
      </Page>
    </Document>
  )
}
