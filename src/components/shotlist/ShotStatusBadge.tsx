import { Badge } from '@/components/ui/badge'
import type { ShotStatus } from '@/types'

const STATUS_META: Record<ShotStatus, { label: string; variant: 'default' | 'ok' | 'ng' | 'amber' | 'muted' }> = {
  pending: { label: 'Pendiente', variant: 'muted' },
  ok: { label: 'OK', variant: 'ok' },
  ng: { label: 'NG', variant: 'ng' },
  print: { label: 'PRINT', variant: 'amber' },
  hold: { label: 'HOLD', variant: 'default' },
}

export function ShotStatusBadge({ status }: { status: ShotStatus }) {
  const meta = STATUS_META[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}
