import 'server-only'

import path from 'node:path'

import { Font } from '@react-pdf/renderer'

// PDF 한글 폰트는 Noto Sans KR로 통일한다 (SIL OFL 1.1, 라이선스 파일은 fonts 폴더에 있다).
export const PDF_FONT_FAMILY = 'NotoSansKR'

const FONT_DIR = path.join(process.cwd(), 'src', 'lib', 'pdf', 'fonts')

let registered = false

// 폰트는 프로세스당 한 번만 등록한다.
export function registerPdfFonts(): void {
  if (registered) return

  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      { src: path.join(FONT_DIR, 'NotoSansKR-Regular.ttf'), fontWeight: 400 },
      { src: path.join(FONT_DIR, 'NotoSansKR-Bold.ttf'), fontWeight: 700 },
    ],
  })

  // 한글은 띄어쓰기 없이 길게 이어질 수 있어, 한글 단어는 글자 단위로 줄바꿈을 허용한다.
  Font.registerHyphenationCallback(word =>
    /[ㄱ-힝]/.test(word) ? Array.from(word) : [word]
  )

  registered = true
}
