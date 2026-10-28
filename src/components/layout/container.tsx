import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

// 모든 페이지가 같은 폭을 쓰도록 기본값을 sm(max-w-3xl)으로 둔다.
// 가이드 페이지 폭에 맞추려면 이 기본값만 바꾸면 된다.
export function Container({
  children,
  className,
  size = 'sm',
}: ContainerProps) {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1400px]',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        sizes[size],
        className
      )}
    >
      {children}
    </div>
  )
}
