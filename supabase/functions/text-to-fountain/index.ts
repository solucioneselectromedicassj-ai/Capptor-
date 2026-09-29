// Supabase Edge Function (Deno). Deploy with: supabase functions deploy text-to-fountain
// Requires the secret ANTHROPIC_API_KEY (supabase secrets set ANTHROPIC_API_KEY=...).
// Keeping the Anthropic key server-side avoids shipping it to the browser bundle.

const SYSTEM_PROMPT = `Convertí el siguiente texto a formato Fountain estándar.
Reglas:
- Encabezados de escena: INT./EXT. LOCACIÓN - MOMENTO siempre en mayúsculas
- Nombres de personaje antes de diálogo: en mayúsculas, centrado
- Acción: texto normal
- Transiciones: mayúsculas con dos puntos (CORTE A:, FUNDIDO A:)
- Si hay ambigüedad, preferí INT. y DÍA
- Responde SOLO con el texto Fountain, sin explicaciones`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  try {
    const { rawText } = await req.json()
    if (!rawText || typeof rawText !== 'string') {
      return new Response(JSON.stringify({ error: 'rawText requerido' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY no configurada en el proyecto de Supabase')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: rawText }],
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`Anthropic API error: ${response.status} ${detail}`)
    }

    const data = await response.json()
    const fountain = data.content?.[0]?.text ?? ''

    return new Response(JSON.stringify({ fountain }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
