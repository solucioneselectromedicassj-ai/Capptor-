import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { BreakdownElement } from '@/types'

const STATUS_VARIANT: Record<BreakdownElement['status'], 'ok' | 'ng' | 'muted'> = {
  confirmed: 'ok',
  blocked: 'ng',
  pending: 'muted',
}

export function ElementCard({ element }: { element: BreakdownElement }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-white">{element.name}</span>
          <Badge variant={STATUS_VARIANT[element.status]}>{element.status}</Badge>
        </div>
        {element.description ? <p className="text-xs text-muted">{element.description}</p> : null}
        {element.notes ? <p className="text-xs italic text-muted">{element.notes}</p> : null}
      </CardContent>
    </Card>
  )
}
