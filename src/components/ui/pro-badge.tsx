import { cn } from '@/utils/cn'

interface ProBadgeProps {
  className?: string
  variant?: 'default' | 'small'
}

export function ProBadge({ className, variant = 'default' }: ProBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold',
        'bg-gradient-to-r from-amber-500 to-orange-600',
        'text-white border border-amber-600',
        variant === 'small' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1',
        className
      )}
    >
      PRO
    </span>
  )
}
