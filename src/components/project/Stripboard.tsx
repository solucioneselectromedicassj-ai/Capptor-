import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { Scene } from '@/types'

function stripColor(scene: Scene): string {
  const isExt = scene.int_ext === 'EXT'
  const isNight = /noche/i.test(scene.time_of_day)
  if (isExt && isNight) return 'border-l-4 border-l-blue-500'
  if (isExt) return 'border-l-4 border-l-amber'
  if (isNight) return 'border-l-4 border-l-purple-500'
  return 'border-l-4 border-l-ok'
}

export function Stripboard({ projectId, scenes }: { projectId: string; scenes: Scene[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border">
      {scenes.map((scene) => (
        <Link
          key={scene.id}
          to={`/projects/${projectId}/scenes/${scene.id}`}
          className={cn(
            'flex items-center gap-3 border-b border-border bg-surface px-3 py-2 text-sm last:border-0 hover:bg-surface-hover',
            stripColor(scene),
          )}
        >
          <span className="w-10 font-mono text-muted">#{scene.scene_number}</span>
          <span className="w-16 font-semibold text-white">{scene.int_ext}</span>
          <span className="flex-1 truncate text-white">{scene.location}</span>
          <span className="w-20 text-muted">{scene.time_of_day}</span>
          <span className="w-16 text-right text-muted">{scene.page_count} pág.</span>
          {scene.locked ? <span className="text-xs text-ng">🔒</span> : null}
        </Link>
      ))}
      {scenes.length === 0 ? <p className="p-4 text-sm text-muted">Sin escenas todavía. Cargá un guión.</p> : null}
    </div>
  )
}
