import { useState } from 'react'
import { Clapperboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'

export function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setBusy(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({ email: email.trim() })
      if (authError) throw authError
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar el enlace.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-2">
          <Clapperboard className="size-6 text-amber" />
          <span className="text-lg font-semibold text-white">Capptor</span>
        </div>

        {sent ? (
          <p className="text-sm text-muted">
            Te enviamos un enlace de acceso a <span className="text-white">{email}</span>. Revisá tu correo.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Enviando…' : 'Enviar enlace de acceso'}
            </Button>
            {error ? <p className="text-xs text-ng">{error}</p> : null}
          </form>
        )}
      </div>
    </div>
  )
}
