// Supabase Edge Function (Deno). Deploy with: supabase functions deploy invite-member
// Uses the service role key (available automatically inside Edge Functions) to invite a
// teammate by email and add them to project_members — this must never run in the browser.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('No autenticado')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(supabaseUrl, serviceRoleKey)

    const requesterClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user: requester },
    } = await requesterClient.auth.getUser()
    if (!requester) throw new Error('No autenticado')

    const { projectId, email, role } = await req.json()
    if (!projectId || !email || !role) throw new Error('projectId, email y role son requeridos')

    const { data: membership } = await admin
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', requester.id)
      .maybeSingle()
    if (!membership || !['director', 'production_manager'].includes(membership.role)) {
      throw new Error('No tenés permisos para invitar miembros en este proyecto')
    }

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email)
    if (inviteError && !inviteError.message.includes('already been registered')) throw inviteError

    let userId = invited?.user?.id
    if (!userId) {
      const { data: existing } = await admin.auth.admin.listUsers()
      userId = existing.users.find((u) => u.email === email)?.id
    }
    if (!userId) throw new Error('No se pudo resolver el usuario invitado')

    const { error: upsertError } = await admin
      .from('project_members')
      .upsert({ project_id: projectId, user_id: userId, role }, { onConflict: 'project_id,user_id' })
    if (upsertError) throw upsertError

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
