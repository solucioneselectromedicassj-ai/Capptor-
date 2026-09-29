import { useEffect } from 'react'
import { Bell } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChangeNotification } from './ChangeNotification'
import { useNotifStore } from '@/stores/notifStore'
import { useProjectStore } from '@/stores/projectStore'

export function NotifBell() {
  const projectId = useProjectStore((s) => s.currentProject?.id)
  const role = useProjectStore((s) => s.myRole?.role)
  const { notifications, unreadCount, connect, disconnect, markAllRead } = useNotifStore()

  useEffect(() => {
    if (!projectId) return
    connect(projectId, role)
    return () => disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, role])

  return (
    <DropdownMenu onOpenChange={(open) => open && markAllRead()}>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-md p-2 text-muted hover:bg-surface hover:text-white" aria-label="Notificaciones">
          <Bell className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-ng text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted">Sin cambios recientes.</p>
          ) : (
            notifications.map((change) => <ChangeNotification key={change.id} change={change} />)
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
