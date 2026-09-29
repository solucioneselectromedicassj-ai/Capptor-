import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Login } from '@/pages/Login'
import { useAuth } from '@/hooks/useAuth'

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail').then((m) => ({ default: m.ProjectDetail })))
const SceneDetail = lazy(() => import('@/pages/SceneDetail').then((m) => ({ default: m.SceneDetail })))
const BreakdownPage = lazy(() => import('@/pages/BreakdownPage').then((m) => ({ default: m.BreakdownPage })))
const ShotListPage = lazy(() => import('@/pages/ShotListPage').then((m) => ({ default: m.ShotListPage })))
const CallSheetPage = lazy(() => import('@/pages/CallSheetPage').then((m) => ({ default: m.CallSheetPage })))
const TeamPage = lazy(() => import('@/pages/TeamPage').then((m) => ({ default: m.TeamPage })))

function PageFallback() {
  return <div className="p-4 text-sm text-muted">Cargando…</div>
}

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted">Cargando…</div>
  }

  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/projects/:projectId/breakdown" element={<BreakdownPage />} />
          <Route path="/projects/:projectId/shots" element={<ShotListPage />} />
          <Route path="/projects/:projectId/callsheet" element={<CallSheetPage />} />
          <Route path="/projects/:projectId/team" element={<TeamPage />} />
          <Route path="/projects/:projectId/scenes/:sceneId" element={<SceneDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
