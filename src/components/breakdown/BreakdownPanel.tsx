import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ElementCard } from './ElementCard'
import * as queries from '@/lib/supabase/queries'
import type { BreakdownCategory, BreakdownElement } from '@/types'

const CATEGORIES: BreakdownCategory[] = [
  'cast',
  'extras',
  'props',
  'costumes',
  'makeup',
  'vehicles',
  'sfx',
  'vfx',
  'lighting',
  'camera',
  'sound',
  'art',
  'other',
]

interface BreakdownPanelProps {
  sceneId: string
  elements: BreakdownElement[]
  onElementsChange: (elements: BreakdownElement[]) => void
  canEdit: boolean
}

export function BreakdownPanel({ sceneId, elements, onElementsChange, canEdit }: BreakdownPanelProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<BreakdownCategory>('props')
  const [busy, setBusy] = useState(false)

  async function handleAdd() {
    if (!name.trim()) return
    setBusy(true)
    try {
      const created = await queries.upsertBreakdownElement({ scene_id: sceneId, category, name: name.trim() })
      onElementsChange([...elements, created])
      setName('')
    } finally {
      setBusy(false)
    }
  }

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    items: elements.filter((e) => e.category === cat),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="space-y-4">
      {canEdit ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Nuevo elemento…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-48"
          />
          <Select value={category} onValueChange={(v) => setCategory(v as BreakdownCategory)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleAdd} disabled={busy || !name.trim()}>
            Agregar
          </Button>
        </div>
      ) : null}

      {grouped.length === 0 ? (
        <p className="text-sm text-muted">Sin elementos de desglose todavía.</p>
      ) : (
        grouped.map(({ category: cat, items }) => (
          <div key={cat} className="space-y-2">
            <h4 className="text-xs font-semibold uppercase text-muted">{cat}</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((element) => (
                <ElementCard key={element.id} element={element} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
