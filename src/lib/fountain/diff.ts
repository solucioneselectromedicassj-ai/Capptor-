import type { ParsedScene, Scene, SceneChange } from '@/types'
import { sceneMatchKey } from './parser'

export interface DiffResult {
  toCreate: ParsedScene[]
  toUpdate: Array<{ sceneId: string; parsed: ParsedScene; changed: boolean }>
  toDelete: Scene[]
  /** Change rows ready to insert. Rows for `toCreate` carry scene_id: '' — fill it in
   *  with the newly-inserted scene's id before persisting (see queries.applyScriptDiff). */
  changes: Array<Omit<SceneChange, 'id' | 'created_at'>>
}

/**
 * Matches scenes by (location + intExt + timeOfDay) so a scene's UUID survives
 * unrelated script edits. Never reassigns an existing scene's id.
 */
export function diffScenes(
  oldScenes: Scene[],
  newScenes: ParsedScene[],
  projectId: string,
  changedBy: string | null,
): DiffResult {
  const queues = new Map<string, Scene[]>()
  for (const scene of oldScenes) {
    const key = sceneMatchKey(scene.int_ext, scene.location, scene.time_of_day)
    const list = queues.get(key) ?? []
    list.push(scene)
    queues.set(key, list)
  }

  const toCreate: ParsedScene[] = []
  const toUpdate: DiffResult['toUpdate'] = []
  const changes: DiffResult['changes'] = []
  const matchedOldIds = new Set<string>()

  for (const parsed of newScenes) {
    const queue = queues.get(parsed.matchKey)
    const oldScene = queue?.shift()

    if (!oldScene) {
      toCreate.push(parsed)
      changes.push({
        scene_id: '',
        project_id: projectId,
        changed_by: changedBy,
        change_type: 'content',
        field_changed: 'created',
        old_value: null,
        new_value: `${parsed.intExt} ${parsed.location} - ${parsed.timeOfDay}`,
      })
      continue
    }

    matchedOldIds.add(oldScene.id)
    const contentChanged = (oldScene.synopsis ?? '') !== parsed.synopsis
    const numberChanged = oldScene.scene_number !== parsed.sceneNumber
    const pagesChanged = Math.abs((oldScene.page_count ?? 0) - parsed.pageEstimate) > 0.001
    toUpdate.push({
      sceneId: oldScene.id,
      parsed,
      changed: contentChanged || numberChanged || pagesChanged,
    })

    if (numberChanged) {
      changes.push({
        scene_id: oldScene.id,
        project_id: projectId,
        changed_by: changedBy,
        change_type: 'content',
        field_changed: 'scene_number',
        old_value: String(oldScene.scene_number),
        new_value: String(parsed.sceneNumber),
      })
    }
    if (contentChanged) {
      changes.push({
        scene_id: oldScene.id,
        project_id: projectId,
        changed_by: changedBy,
        change_type: 'content',
        field_changed: 'synopsis',
        old_value: oldScene.synopsis,
        new_value: parsed.synopsis,
      })
    }
  }

  const toDelete = oldScenes.filter((scene) => !matchedOldIds.has(scene.id))
  for (const scene of toDelete) {
    changes.push({
      scene_id: scene.id,
      project_id: projectId,
      changed_by: changedBy,
      change_type: 'content',
      field_changed: 'deleted',
      old_value: `${scene.int_ext} ${scene.location} - ${scene.time_of_day}`,
      new_value: null,
    })
  }

  return { toCreate, toUpdate, toDelete, changes }
}
