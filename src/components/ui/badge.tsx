import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-surface-hover text-white border border-border',
      ok: 'bg-ok/15 text-ok border border-ok/40',
      ng: 'bg-ng/15 text-ng border border-ng/40',
      amber: 'bg-amber/15 text-amber border border-amber/40',
      muted: 'bg-transparent text-muted border border-border',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}
