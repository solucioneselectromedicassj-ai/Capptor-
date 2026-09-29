import { create } from 'zustand'
import * as queries from '@/lib/supabase/queries'
import { parseFountainToScenes } from '@/lib/fountain/parser'
import type { ParsedScene, Scene } from '@/types'

interface ScenesState {
  scenes: Scene[]
  loading: boolean
  saving: boolean
  loadScenes: (projectId: string) => Promise<void>
  previewParse: (fountainSource: string) => ParsedScene[]
  saveScript: (projectId: string, fountainSource: string) => Promise<void>
}

export const useScenesStore = create<ScenesState>((set) => ({
  scenes: [],
  loading: false,
  saving: false,

  loadScenes: async (projectId) => {
    set({ loading: true })
    try {
      const scenes = await queries.listScenes(projectId)
      set({ scenes })
    } finally {
      set({ loading: false })
    }
  },

  previewParse: (fountainSource) => parseFountainToScenes(fountainSource),

  saveScript: async (projectId, fountainSource) => {
    set({ saving: true })
    try {
      const parsed = parseFountainToScenes(fountainSource)
      await queries.applyScriptDiff(projectId, fountainSource, parsed)
      const scenes = await queries.listScenes(projectId)
      set({ scenes })
    } finally {
      set({ saving: false })
    }
  },
}))
