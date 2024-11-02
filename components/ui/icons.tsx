'use client'

import { cn } from '@/lib/utils'

function IconLogo({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('text-2xl font-bold', className)} {...props}>
      AIVY
    </div>
  )
}

export { IconLogo }