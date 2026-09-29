import { supabase } from './client'
import { diffScenes } from '@/lib/fountain/diff'
import type {
  BreakdownElement,
  CallSheet,
  ParsedScene,
  Project,
  ProjectMember,
  Scene,
  SceneChange,
  Shot,
} from '@/types'

// --- Projects ---

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').order('updated_at', { ascending: false })
  if (error) throw error
  return data as Project[]
}

export async function getProject(id: string): Promise<Project> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) throw error
  return data as Project
}

export async function createProject(input: Pick<Project, 'title' | 'type'>): Promise<Project> {
  const { data: userData } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('projects')
    .insert({ title: input.title, type: input.type, created_by: userData.user?.id })
    .select()
    .single()
  if (error) throw error

  if (userData.user) {
    await supabase
      .from('project_members')
      .insert({ project_id: data.id, user_id: userData.user.id, role: 'director' })
  }
  return data as Project
}

// --- Members ---

export async function listMembers(projectId: string): Promise<ProjectMember[]> {
  const { data, error } = await supabase.from('project_members').select('*').eq('project_id', projectId)
  if (error) throw error
  return data as ProjectMember[]
}

/** Invites a teammate by email via the `invite-member` Edge Function (needs the service role to look up/create the auth user). */
export async function inviteMember(projectId: string, email: string, role: ProjectMember['role']): Promise<void> {
  const { error } = await supabase.functions.invoke('invite-member', {
    body: { projectId, email, role },
  })
  if (error) throw error
}

export async function getMyRole(projectId: string): Promise<ProjectMember | null> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null
  const { data, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (error) throw error
  return data as ProjectMember | null
}

// --- Scenes ---

export async function listScenes(projectId: string): Promise<Scene[]> {
  const { data, error } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', projectId)
    .order('scene_number', { ascending: true })
  if (error) throw error
  return data as Scene[]
}

/**
 * Persists a re-parsed script: creates new scenes, updates matched ones, deletes
 * removed ones, and logs every change to scene_changes (drives realtime notifications).
 */
export async function applyScriptDiff(
  projectId: string,
  fountainSource: string,
  parsedScenes: ParsedScene[],
): Promise<void> {
  const [{ data: userData }, oldScenes] = await Promise.all([
    supabase.auth.getUser(),
    listScenes(projectId),
  ])
  const changedBy = userData.user?.id ?? null
  const diff = diffScenes(oldScenes, parsedScenes, projectId, changedBy)

  const pendingChanges: Array<Omit<SceneChange, 'id' | 'created_at'>> = []

  for (const parsed of diff.toCreate) {
    const { data: created, error } = await supabase
      .from('scenes')
      .insert({
        project_id: projectId,
        scene_number: parsed.sceneNumber,
        int_ext: parsed.intExt,
        location: parsed.location,
        time_of_day: parsed.timeOfDay,
        synopsis: parsed.synopsis,
        page_count: parsed.pageEstimate,
      })
      .select()
      .single()
    if (error) throw error
    pendingChanges.push({
      scene_id: created.id,
      project_id: projectId,
      changed_by: changedBy,
      change_type: 'content',
      field_changed: 'created',
      old_value: null,
      new_value: `${parsed.intExt} ${parsed.location} - ${parsed.timeOfDay}`,
    })
  }

  for (const { sceneId, parsed, changed } of diff.toUpdate) {
    if (!changed) continue
    const { error } = await supabase
      .from('scenes')
      .update({
        scene_number: parsed.sceneNumber,
        synopsis: parsed.synopsis,
        page_count: parsed.pageEstimate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sceneId)
    if (error) throw error
  }
  pendingChanges.push(...diff.changes.filter((c) => c.field_changed !== 'created'))

  for (const scene of diff.toDelete) {
    const { error } = await supabase.from('scenes').delete().eq('id', scene.id)
    if (error) throw error
  }

  if (pendingChanges.length > 0) {
    const { error } = await supabase.from('scene_changes').insert(pendingChanges)
    if (error) throw error
  }

  const { error: projectError } = await supabase
    .from('projects')
    .update({ fountain_source: fountainSource, updated_at: new Date().toISOString() })
    .eq('id', projectId)
  if (projectError) throw projectError
}

// --- Breakdown elements ---

export async function listBreakdownElements(sceneId: string): Promise<BreakdownElement[]> {
  const { data, error } = await supabase.from('breakdown_elements').select('*').eq('scene_id', sceneId)
  if (error) throw error
  return data as BreakdownElement[]
}

export async function upsertBreakdownElement(
  element: Partial<BreakdownElement> & { scene_id: string; category: BreakdownElement['category']; name: string },
): Promise<BreakdownElement> {
  const { data, error } = await supabase.from('breakdown_elements').upsert(element).select().single()
  if (error) throw error
  return data as BreakdownElement
}

export async function deleteBreakdownElement(id: string): Promise<void> {
  const { error } = await supabase.from('breakdown_elements').delete().eq('id', id)
  if (error) throw error
}

// --- Shots ---

export async function listShots(sceneId: string): Promise<Shot[]> {
  const { data, error } = await supabase
    .from('shots')
    .select('*')
    .eq('scene_id', sceneId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data as Shot[]
}

export async function upsertShot(shot: Partial<Shot> & { scene_id: string }): Promise<Shot> {
  const { data, error } = await supabase.from('shots').upsert(shot).select().single()
  if (error) throw error

  if (shot.id && shot.status) {
    const [{ data: userData }, { data: sceneRow }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('scenes').select('project_id').eq('id', shot.scene_id).single(),
    ])
    if (sceneRow) {
      await supabase.from('scene_changes').insert({
        scene_id: shot.scene_id,
        project_id: sceneRow.project_id,
        changed_by: userData.user?.id ?? null,
        change_type: 'shot',
        field_changed: 'status',
        new_value: shot.status,
      })
    }
  }
  return data as Shot
}

export async function reorderShots(shots: Array<{ id: string; sort_order: number }>): Promise<void> {
  const { error } = await supabase.from('shots').upsert(shots)
  if (error) throw error
}

// --- Call sheets ---

export async function listCallSheets(projectId: string): Promise<CallSheet[]> {
  const { data, error } = await supabase
    .from('call_sheets')
    .select('*')
    .eq('project_id', projectId)
    .order('shoot_date', { ascending: false })
  if (error) throw error
  return data as CallSheet[]
}

export async function upsertCallSheet(callSheet: Partial<CallSheet> & { project_id: string }): Promise<CallSheet> {
  const { data, error } = await supabase.from('call_sheets').upsert(callSheet).select().single()
  if (error) throw error
  return data as CallSheet
}
