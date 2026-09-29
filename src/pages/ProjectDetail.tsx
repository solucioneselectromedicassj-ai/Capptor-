import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { EditorFountain } from '@/components/editor/EditorFountain'
import { TextToFountain } from '@/components/editor/TextToFountain'
import { Stripboard } from '@/components/project/Stripboard'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/hooks/usePermission'
import { useProjectStore } from '@/stores/projectStore'
import { useScenesStore } from '@/stores/scenesStore'

export function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>()
  const currentProject = useProjectStore((s) => s.currentProject)
  const loadProject = useProjectStore((s) => s.loadProject)
  const scenes = useScenesStore((s) => s.scenes)
  const loadScenes = useScenesStore((s) => s.loadScenes)
  const saveScript = useScenesStore((s) => s.saveScript)
  const saving = useScenesStore((s) => s.saving)
  const canEdit = usePermission('scenes.edit')

  const [draft, setDraft] = useState('')

  useEffect(() => {
    if (!projectId) return
    loadProject(projectId)
    loadScenes(projectId)
  }, [projectId, loadProject, loadScenes])

  useEffect(() => {
    setDraft(currentProject?.fountain_source ?? '')
  }, [currentProject?.fountain_source])

  if (!projectId) return null

  async function handleSave() {
    await saveScript(projectId!, draft)
  }

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Guión (Fountain)</h2>
          {canEdit ? (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar y desglosar'}
            </Button>
          ) : null}
        </div>
        {canEdit ? <TextToFountain onConverted={(f) => setDraft((prev) => `${prev}\n\n${f}`.trim())} /> : null}
        <div className="min-h-0 flex-1">
          <EditorFountain value={draft} onChange={setDraft} />
        </div>
      </div>
      <div className="flex min-h-0 flex-col gap-3">
        <h2 className="text-sm font-semibold text-white">Stripboard</h2>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Stripboard projectId={projectId} scenes={scenes} />
        </div>
      </div>
    </div>
  )
}
