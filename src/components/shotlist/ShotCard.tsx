import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShotStatusBadge } from './ShotStatusBadge'
import type { Shot, ShotStatus } from '@/types'

const STATUSES: ShotStatus[] = ['pending', 'ok', 'ng', 'print', 'hold']

interface ShotCardProps {
  shot: Shot
  onStatusChange: (status: ShotStatus) => void
}

export function ShotCard({ shot, onStatusChange }: ShotCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: shot.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <Card ref={setNodeRef} style={style} className="touch-none">
      <CardContent className="flex items-start gap-2 p-3">
        <button
          className="mt-1 cursor-grab text-muted active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Reordenar"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-white">
              Toma {shot.shot_number} {shot.shot_type ? `· ${shot.shot_type}` : ''}
            </span>
            <ShotStatusBadge status={shot.status} />
          </div>
          {shot.description ? <p className="text-xs text-muted">{shot.description}</p> : null}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
            {shot.camera_movement ? <span>{shot.camera_movement}</span> : null}
            {shot.lens ? <span>· {shot.lens}</span> : null}
            <span>· {shot.takes_done} tomas</span>
          </div>
          <Select value={shot.status} onValueChange={(v) => onStatusChange(v as ShotStatus)}>
            <SelectTrigger className="h-7 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status} className="text-xs">
                  {status.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
