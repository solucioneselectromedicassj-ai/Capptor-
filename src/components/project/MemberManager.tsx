import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import * as queries from '@/lib/supabase/queries'
import type { ProjectMember, Role } from '@/types'

const ROLES: Role[] = [
  'director',
  'assistant_director',
  'dp',
  'art_director',
  'sound',
  'production_manager',
  'script_supervisor',
  'viewer',
]

const ROLE_LABEL: Record<Role, string> = {
  director: 'Director/a',
  assistant_director: 'Asistente de dirección',
  dp: 'Dirección de fotografía',
  art_director: 'Dirección de arte',
  sound: 'Sonido',
  production_manager: 'Producción',
  script_supervisor: 'Script',
  viewer: 'Solo lectura',
}

interface MemberManagerProps {
  projectId: string
  members: ProjectMember[]
  onInvited: () => void
  canManage: boolean
}

export function MemberManager({ projectId, members, onInvited, canManage }: MemberManagerProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('viewer')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleInvite() {
    if (!email.trim()) return
    setBusy(true)
    setError(null)
    try {
      await queries.inviteMember(projectId, email.trim(), role)
      setEmail('')
      onInvited()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo invitar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {canManage ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="email@equipo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-56"
          />
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleInvite} disabled={busy || !email.trim()}>
            {busy ? 'Invitando…' : 'Invitar'}
          </Button>
          {error ? <span className="text-xs text-ng">{error}</span> : null}
        </div>
      ) : null}

      <div className="space-y-2">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <span className="text-sm text-white">{member.user_email ?? member.user_id}</span>
            <Badge variant="amber">{ROLE_LABEL[member.role]}</Badge>
          </div>
        ))}
        {members.length === 0 ? <p className="text-sm text-muted">Sin miembros todavía.</p> : null}
      </div>
    </div>
  )
}
