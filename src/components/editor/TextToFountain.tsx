import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { textToFountain } from '@/lib/fountain/textConverter'
import { Sparkles } from 'lucide-react'

interface TextToFountainProps {
  onConverted: (fountain: string) => void
}

export function TextToFountain({ onConverted }: TextToFountainProps) {
  const [raw, setRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConvert() {
    if (!raw.trim()) return
    setLoading(true)
    setError(null)
    try {
      const fountain = await textToFountain(raw)
      onConverted(fountain)
      setRaw('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo convertir el texto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Pegá texto libre del guión y convertilo a formato Fountain…"
        rows={4}
      />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleConvert} disabled={loading || !raw.trim()}>
          <Sparkles /> {loading ? 'Convirtiendo…' : 'Convertir a Fountain'}
        </Button>
        {error ? <span className="text-xs text-ng">{error}</span> : null}
      </div>
    </div>
  )
}
