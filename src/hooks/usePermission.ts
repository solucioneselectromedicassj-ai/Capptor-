import { useMemo } from 'react'
import type { Role } from '@/types'
import { useProjectStore } from '@/stores/projectStore'

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  director: ['all'],
  assistant_director: ['scenes.edit', 'shots.edit', 'callsheet.create', 'breakdown.view'],
  dp: ['shots.edit', 'breakdown.edit:camera', 'breakdown.edit:lighting'],
  art_director: ['breakdown.edit:props', 'breakdown.edit:costumes', 'breakdown.edit:art'],
  sound: ['breakdown.edit:sound'],
  production_manager: ['callsheet.all', 'breakdown.view', 'team.manage'],
  script_supervisor: ['scenes.view', 'shots.edit:status', 'shots.edit:notes'],
  viewer: ['*.view'],
}

function matches(granted: string, action: string): boolean {
  if (granted === 'all') return true
  if (granted === action) return true
  if (granted === '*.view' && action.endsWith('.view')) return true
  return false
}

/** Reads the current user's role on the active project and checks it against ROLE_PERMISSIONS. */
export function usePermission(action: string): boolean {
  const role = useProjectStore((s) => s.myRole?.role)
  return useMemo(() => {
    if (!role) return false
    const granted = ROLE_PERMISSIONS[role] ?? []
    return granted.some((g) => matches(g, action))
  }, [role, action])
}
