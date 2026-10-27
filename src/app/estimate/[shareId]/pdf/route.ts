import { renderToBuffer } from '@react-pdf/renderer'

import { EstimateDocument } from '@/components/pdf/estimate-document'
import { getIssuer } from '@/lib/estimate/issuer'
import { getPublishedQuote } from '@/lib/notion/get-published-quote'
import { registerPdfFonts } from '@/lib/pdf/register-fonts'

// PDF 생성은 react-pdf가 Node 런타임에서만 동작한다.
export const runtime = 'nodejs'

interface PdfRouteContext {
  params: Promise<{ shareId: string }>
}

// 발행 상태의 견적서만 PDF로 내려준다. 임시와 만료 견적서는 금액 없이 404다.
export async function GET(_request: Request, { params }: PdfRouteContext) {
  const { shareId } = await params
  const result = await getPublishedQuote(shareId)

  if (result.kind === 'error') {
    if (result.reason === 'rateLimited') {
      return new Response('Too Many Requests', { status: 429 })
    }
    return new Response('Internal Server Error', { status: 500 })
  }
  if (result.kind !== 'found') {
    return new Response('Not Found', { status: 404 })
  }

  try {
    registerPdfFonts()
    const buffer = await renderToBuffer(
      EstimateDocument({ quote: result.quote, issuer: getIssuer() })
    )

    const filename = `견적서_${result.quote.quoteNumber}.pdf`
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        // 한글 파일명은 RFC 5987 형식으로 인코딩한다. 구형 클라이언트용 ASCII 이름도 함께 준다.
        'Content-Disposition': `attachment; filename="estimate.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('[estimate-pdf] PDF 생성 실패', {
      shareId,
      kind: error instanceof Error ? error.name : 'unknown',
    })
    return new Response('Internal Server Error', { status: 500 })
  }
}
