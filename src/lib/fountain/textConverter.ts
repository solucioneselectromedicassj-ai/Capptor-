import { supabase } from '@/lib/supabase/client'

/**
 * Converts free-form text to Fountain via the `text-to-fountain` Supabase Edge Function,
 * which holds the Anthropic API key server-side (see supabase/functions/text-to-fountain).
 * Never call the Anthropic API directly from the browser — that would ship the key to clients.
 */
export async function textToFountain(rawText: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ fountain: string }>('text-to-fountain', {
    body: { rawText },
  })
  if (error) throw error
  if (!data?.fountain) throw new Error('El servicio no devolvió texto Fountain.')
  return data.fountain
}
