import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import type { Project, ProjectType } from '@/types'

const TYPE_LABEL: Record<ProjectType, string> = {
  short: 'Cortometraje',
  feature: 'Largometraje',
  documentary: 'Documental',
  series: 'Serie',
}

export function ProjectDashboard({ projects }: { projects: Project[] }) {
  const createProject = useProjectStore((s) => s.createProject)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<ProjectType>('short')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleCreate() {
    if (!title.trim()) return
    setBusy(true)
    try {
      await createProject({ title: title.trim(), type })
      setTitle('')
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Proyectos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus /> Nuevo proyecto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo proyecto</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Select value={type} onValueChange={(v) => setType(v as ProjectType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(TYPE_LABEL) as ProjectType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleCreate} disabled={busy || !title.trim()} className="w-full">
                {busy ? 'Creando…' : 'Crear proyecto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} to={`/projects/${project.id}`}>
            <Card className="h-full transition-colors hover:border-amber">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{project.title}</CardTitle>
                  <Badge variant="amber">{TYPE_LABEL[project.type]}</Badge>
                </div>
                <CardDescription>{project.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted">
                  Actualizado {new Date(project.updated_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {projects.length === 0 ? (
          <p className="text-sm text-muted">No tenés proyectos todavía. Creá el primero.</p>
        ) : null}
      </div>
    </div>
  )
}
