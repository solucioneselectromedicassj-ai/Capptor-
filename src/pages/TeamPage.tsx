import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MemberManager } from '@/components/project/MemberManager'
import { usePermission } from '@/hooks/usePermission'
import { useProjectStore } from '@/stores/projectStore'

export function TeamPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const members = useProjectStore((s) => s.members)
  const loadProject = useProjectStore((s) => s.loadProject)
  const canManage = usePermission('team.manage')

  useEffect(() => {
    if (projectId) loadProject(projectId)
  }, [projectId, loadProject])

  if (!projectId) return null

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-white">Equipo</h1>
      <MemberManager
        projectId={projectId}
        members={members}
        onInvited={() => loadProject(projectId)}
        canManage={canManage}
      />
    </div>
  )
}
