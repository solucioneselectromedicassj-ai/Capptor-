export type ProjectType = 'short' | 'feature' | 'documentary' | 'series'
export type ProjectStatus = 'development' | 'pre-production' | 'production' | 'post-production' | 'wrapped'

export interface Project {
  id: string
  title: string
  type: ProjectType
  status: ProjectStatus
  fountain_source: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Role =
  | 'director'
  | 'assistant_director'
  | 'dp'
  | 'art_director'
  | 'sound'
  | 'production_manager'
  | 'script_supervisor'
  | 'viewer'

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: Role
  user_email?: string
}

export type IntExt = 'INT' | 'EXT' | 'INT/EXT'

export interface Scene {
  id: string
  project_id: string
  scene_number: number
  int_ext: IntExt
  location: string
  time_of_day: string
  synopsis: string | null
  page_count: number
  version: number
  locked: boolean
  created_at: string
  updated_at: string
}

export type BreakdownCategory =
  | 'cast'
  | 'extras'
  | 'props'
  | 'costumes'
  | 'makeup'
  | 'vehicles'
  | 'sfx'
  | 'vfx'
  | 'lighting'
  | 'camera'
  | 'sound'
  | 'art'
  | 'other'

export type BreakdownStatus = 'pending' | 'confirmed' | 'blocked'

export interface BreakdownElement {
  id: string
  scene_id: string
  category: BreakdownCategory
  name: string
  description: string | null
  status: BreakdownStatus
  assigned_to: string | null
  notes: string | null
}

export type ShotStatus = 'pending' | 'ok' | 'ng' | 'print' | 'hold'

export interface Shot {
  id: string
  scene_id: string
  shot_number: number
  shot_type: string | null
  camera_movement: string | null
  lens: string | null
  description: string | null
  status: ShotStatus
  takes_done: number
  best_take: number | null
  notes: string | null
  sort_order: number
}

export type SceneChangeType = 'content' | 'element' | 'shot' | 'lock'

export interface SceneChange {
  id: string
  scene_id: string
  project_id: string
  changed_by: string | null
  changed_by_email?: string
  change_type: SceneChangeType
  field_changed: string | null
  old_value: string | null
  new_value: string | null
  created_at: string
}

export interface CallSheet {
  id: string
  project_id: string
  shoot_date: string
  general_call: string | null
  location: string | null
  scenes_to_shoot: string[]
  weather: string | null
  notes: string | null
  published: boolean
  created_at: string
}

// --- Fountain parsing (not persisted directly) ---

export interface ParsedScene {
  tempId: string
  sceneNumber: number
  intExt: IntExt
  location: string
  timeOfDay: string
  synopsis: string
  characters: string[]
  rawText: string
  pageEstimate: number
  matchKey: string
}
