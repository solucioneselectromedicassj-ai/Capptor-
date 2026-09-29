import { useEffect } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { ProjectDashboard } from '@/components/project/ProjectDashboard'

export function Dashboard() {
  const projects = useProjectStore((s) => s.projects)
  const loadProjects = useProjectStore((s) => s.loadProjects)

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return <ProjectDashboard projects={projects} />
}
