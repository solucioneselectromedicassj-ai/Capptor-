-- Capptor — schema de producción cinematográfica
-- Cada escena tiene un scene_uuid (id) inmutable; scene_number es derivado del orden en Fountain.

create extension if not exists "pgcrypto";

-- Proyectos
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text check (type in ('short', 'feature', 'documentary', 'series')),
  status text default 'development',
  fountain_source text,
  created_by uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Miembros del equipo por proyecto
create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade,
  user_id uuid references auth.users,
  role text check (role in (
    'director', 'assistant_director', 'dp',
    'art_director', 'sound', 'production_manager',
    'script_supervisor', 'viewer'
  )),
  unique (project_id, user_id)
);

-- Escenas (UUID estable, número derivado)
create table if not exists scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade,
  scene_number int,
  int_ext text check (int_ext in ('INT', 'EXT', 'INT/EXT')),
  location text,
  time_of_day text,
  synopsis text,
  page_count numeric(5, 2) default 0,
  version int default 1,
  locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Elementos de desglose por escena
create table if not exists breakdown_elements (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid references scenes on delete cascade,
  category text check (category in (
    'cast', 'extras', 'props', 'costumes',
    'makeup', 'vehicles', 'sfx', 'vfx',
    'lighting', 'camera', 'sound', 'art', 'other'
  )),
  name text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'blocked')),
  assigned_to uuid references auth.users,
  notes text
);

-- Tomas (shots) por escena
create table if not exists shots (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid references scenes on delete cascade,
  shot_number int,
  shot_type text,
  camera_movement text,
  lens text,
  description text,
  status text default 'pending' check (status in ('pending', 'ok', 'ng', 'print', 'hold')),
  takes_done int default 0,
  best_take int,
  notes text,
  sort_order int default 0
);

-- Historial de cambios (dispara las notificaciones realtime)
create table if not exists scene_changes (
  id uuid primary key default gen_random_uuid(),
  scene_id uuid references scenes,
  project_id uuid references projects,
  changed_by uuid references auth.users,
  change_type text check (change_type in ('content', 'element', 'shot', 'lock')),
  field_changed text,
  old_value text,
  new_value text,
  created_at timestamptz default now()
);

-- Call sheets
create table if not exists call_sheets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects on delete cascade,
  shoot_date date,
  general_call time,
  location text,
  scenes_to_shoot uuid[] default '{}',
  weather text,
  notes text,
  published boolean default false,
  created_at timestamptz default now()
);

-- === RLS ===

alter table projects enable row level security;
alter table project_members enable row level security;
alter table scenes enable row level security;
alter table breakdown_elements enable row level security;
alter table shots enable row level security;
alter table scene_changes enable row level security;
alter table call_sheets enable row level security;

create or replace function is_project_member(target_project_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from project_members
    where project_id = target_project_id and user_id = auth.uid()
  );
$$;

create or replace function project_role(target_project_id uuid)
returns text
language sql
security definer
stable
as $$
  select role from project_members
  where project_id = target_project_id and user_id = auth.uid()
  limit 1;
$$;

-- projects: miembros leen/escriben; solo el creador o un director puede crear.
create policy "projects_select_members" on projects
  for select using (is_project_member(id) or created_by = auth.uid());

create policy "projects_insert_self" on projects
  for insert with check (created_by = auth.uid());

create policy "projects_update_non_viewers" on projects
  for update using (is_project_member(id) and project_role(id) <> 'viewer');

-- project_members: miembros del proyecto leen; producción/director gestionan.
create policy "members_select" on project_members
  for select using (is_project_member(project_id));

create policy "members_manage" on project_members
  for insert with check (project_role(project_id) in ('director', 'production_manager'));

create policy "members_update" on project_members
  for update using (project_role(project_id) in ('director', 'production_manager'));

create policy "members_delete" on project_members
  for delete using (project_role(project_id) in ('director', 'production_manager'));

-- scenes: miembros leen; viewers no escriben.
create policy "scenes_select" on scenes
  for select using (is_project_member(project_id));

create policy "scenes_write" on scenes
  for all using (is_project_member(project_id) and project_role(project_id) <> 'viewer')
  with check (is_project_member(project_id) and project_role(project_id) <> 'viewer');

-- breakdown_elements: por escena, heredando el proyecto de la escena.
create policy "breakdown_select" on breakdown_elements
  for select using (
    exists (select 1 from scenes where scenes.id = scene_id and is_project_member(scenes.project_id))
  );

create policy "breakdown_write" on breakdown_elements
  for all using (
    exists (
      select 1 from scenes
      where scenes.id = scene_id
        and is_project_member(scenes.project_id)
        and project_role(scenes.project_id) <> 'viewer'
    )
  );

-- shots
create policy "shots_select" on shots
  for select using (
    exists (select 1 from scenes where scenes.id = scene_id and is_project_member(scenes.project_id))
  );

create policy "shots_write" on shots
  for all using (
    exists (
      select 1 from scenes
      where scenes.id = scene_id
        and is_project_member(scenes.project_id)
        and project_role(scenes.project_id) <> 'viewer'
    )
  );

-- scene_changes: solo lectura para miembros; se insertan desde el cliente autenticado.
create policy "scene_changes_select" on scene_changes
  for select using (is_project_member(project_id));

create policy "scene_changes_insert" on scene_changes
  for insert with check (is_project_member(project_id));

-- call_sheets
create policy "call_sheets_select" on call_sheets
  for select using (is_project_member(project_id));

create policy "call_sheets_write" on call_sheets
  for all using (
    is_project_member(project_id)
    and project_role(project_id) in ('director', 'assistant_director', 'production_manager')
  );

-- Realtime
alter publication supabase_realtime add table scene_changes;
alter publication supabase_realtime add table shots;
