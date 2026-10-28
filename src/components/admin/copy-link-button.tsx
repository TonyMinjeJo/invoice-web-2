'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { buildShareLink } from '@/lib/estimate/share-link'

interface CopyLinkButtonProps {
  pageId: string
  // NEXT_PUBLIC_APP_URL. 없으면 현재 접속 origin을 쓴다 (G4).
  appUrl: string | null
  label: string
}

// 복사 동작만 담당한다. 복사 가능 여부는 호출하는 쪽이 share-link.ts로 판정한다. 노션 호출은 없다.
export function CopyLinkButton({ pageId, appUrl, label }: CopyLinkButtonProps) {
  const [fallbackLink, setFallbackLink] = useState<string | null>(null)

  async function handleCopy() {
    const link = buildShareLink(appUrl ?? window.location.origin, pageId)
    try {
      await navigator.clipboard.writeText(link)
      setFallbackLink(null)
      toast.success('공유 링크를 복사했습니다')
    } catch {
      // 권한 거부나 비보안 컨텍스트. 직접 선택해 복사할 수 있도록 링크를 보여준다.
      setFallbackLink(link)
      toast.error('복사하지 못했습니다. 표시된 링크를 직접 복사해 주세요')
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        aria-label={`${label} 링크 복사`}
      >
        링크 복사
      </Button>
      {fallbackLink ? (
        <Input
          readOnly
          value={fallbackLink}
          aria-label={`${label} 공유 링크`}
          onFocus={event => event.currentTarget.select()}
          className="h-8 min-w-48 text-xs"
        />
      ) : null}
    </div>
  )
}
