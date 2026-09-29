import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CallSheetBuilder } from '@/components/callsheet/CallSheetBuilder'
import { CallSheetPDF } from '@/components/callsheet/CallSheetPDF'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectStore } from '@/stores/projectStore'
import { useScenesStore } from '@/stores/scenesStore'
import * as queries from '@/lib/supabase/queries'
import type { CallSheet } from '@/types'

export function CallSheetPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const currentProject = useProjectStore((s) => s.currentProject)
  const scenes = useScenesStore((s) => s.scenes)
  const [callSheets, setCallSheets] = useState<CallSheet[]>([])

  useEffect(() => {
    if (projectId) queries.listCallSheets(projectId).then(setCallSheets)
  }, [projectId])

  if (!projectId) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-3 text-lg font-semibold text-white">Call sheets</h1>
        <CallSheetBuilder
          projectId={projectId}
          scenes={scenes}
          onCreated={(cs) => setCallSheets((prev) => [cs, ...prev])}
        />
      </div>

      <div className="space-y-2">
        {callSheets.map((cs) => (
          <Card key={cs.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>{cs.shoot_date}</CardTitle>
              {currentProject ? (
                <CallSheetPDF
                  projectTitle={currentProject.title}
                  callSheet={cs}
                  scenes={scenes.filter((s) => cs.scenes_to_shoot.includes(s.id))}
                />
              ) : null}
            </CardHeader>
            <CardContent className="text-xs text-muted">
              {cs.location ?? 'Sin locación'} · {cs.scenes_to_shoot.length} escenas
            </CardContent>
          </Card>
        ))}
        {callSheets.length === 0 ? <p className="text-sm text-muted">Sin call sheets todavía.</p> : null}
      </div>
    </div>
  )
}
