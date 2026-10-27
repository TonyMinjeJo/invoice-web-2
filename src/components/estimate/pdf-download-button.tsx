'use client'

import { Download, LoaderCircle } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

interface PdfDownloadButtonProps {
  shareId: string
  className?: string
}

type Status = 'idle' | 'loading' | 'error'

// 발행 상태 견적서 화면에서만 렌더링된다. 서버가 PDF를 만들고 브라우저가 파일로 저장한다.
export function PdfDownloadButton({
  shareId,
  className,
}: PdfDownloadButtonProps) {
  const [status, setStatus] = useState<Status>('idle')

  async function handleClick() {
    setStatus('loading')
    try {
      const response = await fetch(
        `/estimate/${encodeURIComponent(shareId)}/pdf`
      )
      if (!response.ok) throw new Error(`PDF 응답 ${response.status}`)

      // 서버의 Content-Disposition에서 한글 파일명을 꺼낸다.
      const disposition = response.headers.get('Content-Disposition') ?? ''
      const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/)?.[1]
      const fileName = encodedName
        ? decodeURIComponent(encodedName)
        : 'estimate.pdf'

      const url = URL.createObjectURL(await response.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setStatus('idle')
    } catch {
      // 원본 오류 내용은 화면에 보여주지 않는다.
      setStatus('error')
    }
  }

  const loading = status === 'loading'

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={handleClick}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <LoaderCircle aria-hidden="true" className="animate-spin" />
        ) : (
          <Download aria-hidden="true" />
        )}
        {loading ? 'PDF 준비 중' : 'PDF 다운로드'}
      </Button>
      {status === 'error' ? (
        <p role="alert" className="text-destructive mt-2 text-sm">
          PDF를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      ) : null}
    </div>
  )
}
