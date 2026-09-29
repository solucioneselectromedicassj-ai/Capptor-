import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { subscribeToProjectChanges, unsubscribe } from '@/lib/supabase/realtime'
import type { Role, SceneChange } from '@/types'

const CAMERA_KEYWORDS = ['camera', 'cámara', 'lens', 'lente', 'lighting', 'iluminación', 'shot']
const ART_KEYWORDS = ['prop', 'vestuario', 'costume', 'art', 'arte']
const SOUND_KEYWORDS = ['sound', 'sonido']

function textMatches(change: SceneChange, keywords: string[]): boolean {
  const haystack = `${change.field_changed ?? ''} ${change.new_value ?? ''}`.toLowerCase()
  return keywords.some((k) => haystack.includes(k))
}

/** Role-based notification filter: each role only hears about the changes relevant to them. */
export function isRelevantToRole(change: SceneChange, role: Role): boolean {
  switch (role) {
    case 'director':
    case 'assistant_director':
    case 'production_manager':
      return true
    case 'dp':
      return change.change_type === 'shot' || textMatches(change, CAMERA_KEYWORDS)
    case 'art_director':
      return textMatches(change, ART_KEYWORDS)
    case 'sound':
      return textMatches(change, SOUND_KEYWORDS)
    case 'script_supervisor':
      return change.change_type === 'shot' || change.change_type === 'content'
    case 'viewer':
      return true
    default:
      return true
  }
}

interface NotifState {
  notifications: SceneChange[]
  unreadCount: number
  channel: RealtimeChannel | null
  connect: (projectId: string, role: Role | undefined) => void
  disconnect: () => void
  markAllRead: () => void
}

export const useNotifStore = create<NotifState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  channel: null,

  connect: (projectId, role) => {
    get().disconnect()
    const channel = subscribeToProjectChanges(projectId, (change) => {
      if (role && !isRelevantToRole(change, role)) return
      set((state) => ({
        notifications: [change, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1,
      }))
    })
    set({ channel })
  },

  disconnect: () => {
    const { channel } = get()
    if (channel) unsubscribe(channel)
    set({ channel: null })
  },

  markAllRead: () => set({ unreadCount: 0 }),
}))
