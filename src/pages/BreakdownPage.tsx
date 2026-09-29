import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useScenesStore } from '@/stores/scenesStore'

export function BreakdownPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const scenes = useScenesStore((s) => s.scenes)
  const loadScenes = useScenesStore((s) => s.loadScenes)

  useEffect(() => {
    if (projectId) loadScenes(projectId)
  }, [projectId, loadScenes])

  return (
    <div className="space-y-3">
      <h1 className="text-lg font-semibold text-white">Desglose por escena</h1>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {scenes.map((scene) => (
          <Link key={scene.id} to={`/projects/${projectId}/scenes/${scene.id}`}>
            <Card className="h-full hover:border-amber">
              <CardHeader>
                <CardTitle>
                  #{scene.scene_number} {scene.location}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted">
                {scene.int_ext} · {scene.time_of_day}
              </CardContent>
            </Card>
          </Link>
        ))}
        {scenes.length === 0 ? <p className="text-sm text-muted">Sin escenas todavía.</p> : null}
      </div>
    </div>
  )
}
