import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BreakdownPanel } from '@/components/breakdown/BreakdownPanel'
import { ShotList } from '@/components/shotlist/ShotList'
import { usePermission } from '@/hooks/usePermission'
import { useScenesStore } from '@/stores/scenesStore'
import * as queries from '@/lib/supabase/queries'
import type { BreakdownElement, Shot } from '@/types'

export function SceneDetail() {
  const { sceneId } = useParams<{ sceneId: string }>()
  const scene = useScenesStore((s) => s.scenes.find((sc) => sc.id === sceneId))
  const [elements, setElements] = useState<BreakdownElement[]>([])
  const [shots, setShots] = useState<Shot[]>([])
  const canEditBreakdown = usePermission('breakdown.view')
  const canEditShots = usePermission('shots.edit')

  useEffect(() => {
    if (!sceneId) return
    queries.listBreakdownElements(sceneId).then(setElements)
    queries.listShots(sceneId).then(setShots)
  }, [sceneId])

  if (!sceneId || !scene) return <p className="text-sm text-muted">Cargando escena…</p>

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-white">
          #{scene.scene_number} {scene.int_ext} {scene.location} — {scene.time_of_day}
        </h1>
        {scene.synopsis ? <p className="text-sm text-muted">{scene.synopsis}</p> : null}
      </div>

      <Tabs defaultValue="breakdown">
        <TabsList>
          <TabsTrigger value="breakdown">Desglose</TabsTrigger>
          <TabsTrigger value="shots">Shot list</TabsTrigger>
        </TabsList>
        <TabsContent value="breakdown">
          <BreakdownPanel
            sceneId={sceneId}
            elements={elements}
            onElementsChange={setElements}
            canEdit={canEditBreakdown}
          />
        </TabsContent>
        <TabsContent value="shots">
          <ShotList sceneId={sceneId} shots={shots} onShotsChange={setShots} canEdit={canEditShots} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
