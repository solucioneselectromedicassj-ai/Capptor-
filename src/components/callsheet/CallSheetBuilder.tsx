import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import * as queries from '@/lib/supabase/queries'
import type { CallSheet, Scene } from '@/types'

interface CallSheetBuilderProps {
  projectId: string
  scenes: Scene[]
  onCreated: (callSheet: CallSheet) => void
}

export function CallSheetBuilder({ projectId, scenes, onCreated }: CallSheetBuilderProps) {
  const [shootDate, setShootDate] = useState('')
  const [generalCall, setGeneralCall] = useState('')
  const [location, setLocation] = useState('')
  const [weather, setWeather] = useState('')
  const [notes, setNotes] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

  function toggleScene(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleCreate() {
    if (!shootDate) return
    setBusy(true)
    try {
      const created = await queries.upsertCallSheet({
        project_id: projectId,
        shoot_date: shootDate,
        general_call: generalCall || null,
        location: location || null,
        weather: weather || null,
        notes: notes || null,
        scenes_to_shoot: Array.from(selected),
        published: false,
      })
      onCreated(created)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <div>
          <Label htmlFor="shoot-date">Fecha de rodaje</Label>
          <Input id="shoot-date" type="date" value={shootDate} onChange={(e) => setShootDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="general-call">Llamado general</Label>
          <Input id="general-call" type="time" value={generalCall} onChange={(e) => setGeneralCall(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="location">Locación</Label>
          <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="weather">Clima</Label>
          <Input id="weather" value={weather} onChange={(e) => setWeather(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="notes">Notas</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button onClick={handleCreate} disabled={busy || !shootDate}>
          {busy ? 'Guardando…' : 'Crear call sheet'}
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Escenas a rodar</Label>
        <div className="max-h-80 space-y-1 overflow-y-auto rounded-md border border-border p-2">
          {scenes.map((scene) => (
            <label key={scene.id} className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-surface-hover">
              <input type="checkbox" checked={selected.has(scene.id)} onChange={() => toggleScene(scene.id)} />
              <span>
                #{scene.scene_number} {scene.int_ext} {scene.location} — {scene.time_of_day}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
