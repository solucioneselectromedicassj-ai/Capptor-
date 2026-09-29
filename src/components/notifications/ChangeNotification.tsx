import { Badge } from '@/components/ui/badge'
import type { SceneChange } from '@/types'

const TYPE_META: Record<SceneChange['change_type'], { label: string; variant: 'ng' | 'amber' | 'ok' }> = {
  content: { label: '🔴 Guión', variant: 'ng' },
  element: { label: '🟡 Desglose', variant: 'amber' },
  shot: { label: '🟢 Toma', variant: 'ok' },
  lock: { label: '🔒 Bloqueo', variant: 'amber' },
}

export function ChangeNotification({ change }: { change: SceneChange }) {
  const meta = TYPE_META[change.change_type] ?? TYPE_META.content
  return (
    <div className="flex flex-col gap-1 border-b border-border px-3 py-2 last:border-0">
      <div className="flex items-center justify-between">
        <Badge variant={meta.variant}>{meta.label}</Badge>
        <span className="text-[11px] text-muted">{new Date(change.created_at).toLocaleTimeString()}</span>
      </div>
      <p className="text-sm text-white">
        {change.field_changed ? <span className="font-medium">{change.field_changed}: </span> : null}
        {change.new_value ?? '—'}
      </p>
      {change.changed_by_email ? <p className="text-xs text-muted">por {change.changed_by_email}</p> : null}
    </div>
  )
}
