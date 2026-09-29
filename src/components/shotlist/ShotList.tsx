import { useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ShotCard } from './ShotCard'
import * as queries from '@/lib/supabase/queries'
import type { Shot, ShotStatus } from '@/types'

interface ShotListProps {
  sceneId: string
  shots: Shot[]
  onShotsChange: (shots: Shot[]) => void
  canEdit: boolean
}

export function ShotList({ sceneId, shots, onShotsChange, canEdit }: ShotListProps) {
  const [busy, setBusy] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  async function handleStatusChange(shot: Shot, status: ShotStatus) {
    const updated = { ...shot, status }
    onShotsChange(shots.map((s) => (s.id === shot.id ? updated : s)))
    await queries.upsertShot({ id: shot.id, scene_id: sceneId, status })
  }

  async function handleAddShot() {
    setBusy(true)
    try {
      const nextNumber = shots.length + 1
      const created = await queries.upsertShot({
        scene_id: sceneId,
        shot_number: nextNumber,
        status: 'pending',
        takes_done: 0,
        sort_order: shots.length,
      })
      onShotsChange([...shots, created])
    } finally {
      setBusy(false)
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = shots.findIndex((s) => s.id === active.id)
    const newIndex = shots.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(shots, oldIndex, newIndex).map((s, i) => ({ ...s, sort_order: i }))
    onShotsChange(reordered)
    await queries.reorderShots(reordered.map((s) => ({ id: s.id, sort_order: s.sort_order })))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Shot list</h3>
        {canEdit ? (
          <Button size="sm" variant="secondary" onClick={handleAddShot} disabled={busy}>
            <Plus /> Toma
          </Button>
        ) : null}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={shots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {shots.map((shot) => (
              <ShotCard key={shot.id} shot={shot} onStatusChange={(status) => handleStatusChange(shot, status)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {shots.length === 0 ? <p className="text-sm text-muted">Sin tomas todavía.</p> : null}
    </div>
  )
}
