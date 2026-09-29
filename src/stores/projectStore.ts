import { create } from 'zustand'
import * as queries from '@/lib/supabase/queries'
import type { Project, ProjectMember } from '@/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  members: ProjectMember[]
  myRole: ProjectMember | null
  loading: boolean
  loadProjects: () => Promise<void>
  createProject: (input: Pick<Project, 'title' | 'type'>) => Promise<Project>
  loadProject: (id: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  members: [],
  myRole: null,
  loading: false,

  loadProjects: async () => {
    set({ loading: true })
    try {
      const projects = await queries.listProjects()
      set({ projects })
    } finally {
      set({ loading: false })
    }
  },

  createProject: async (input) => {
    const project = await queries.createProject(input)
    set((state) => ({ projects: [project, ...state.projects] }))
    return project
  },

  loadProject: async (id) => {
    set({ loading: true })
    try {
      const [project, members, myRole] = await Promise.all([
        queries.getProject(id),
        queries.listMembers(id),
        queries.getMyRole(id),
      ])
      set({ currentProject: project, members, myRole })
    } finally {
      set({ loading: false })
    }
  },
}))
