import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './client'
import type { SceneChange } from '@/types'

/** Subscribes to every new scene_changes row for a project (INSERT-only stream). */
export function subscribeToProjectChanges(
  projectId: string,
  onSceneChange: (change: SceneChange) => void,
): RealtimeChannel {
  return supabase
    .channel(`project:${projectId}:changes`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'scene_changes',
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => onSceneChange(payload.new as SceneChange),
    )
    .subscribe()
}

/** Subscribes to shot status updates for live "OK/NG" badges across devices on set. */
export function subscribeToShotUpdates(
  projectId: string,
  onShotUpdate: (shotId: string) => void,
): RealtimeChannel {
  return supabase
    .channel(`project:${projectId}:shots`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'shots' },
      (payload) => onShotUpdate((payload.new as { id: string }).id),
    )
    .subscribe()
}

export function unsubscribe(channel: RealtimeChannel): void {
  void supabase.removeChannel(channel)
}
