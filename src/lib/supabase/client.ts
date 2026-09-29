import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    'Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Configurá tu archivo .env (ver .env.example). ' +
      'La app se sirve igual, pero ninguna llamada a Supabase va a funcionar hasta que lo configures.',
  )
}

// Falls back to a syntactically valid placeholder so createClient doesn't throw and crash the
// whole app before React even mounts when the env vars are missing (e.g. first local run).
export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key')
