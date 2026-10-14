import { useEffect, useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { KpiStrip } from './components/KpiStrip'
import { UsageChart } from './components/UsageChart'
import { CountryBreakdown } from './components/CountryBreakdown'
import { RecentActivity } from './components/RecentActivity'
import { ComingSoon } from './components/ComingSoon'
import { CommandPalette } from './components/CommandPalette'
import { ToastHost } from './components/ToastHost'
import { DEFAULT_ROUTE } from './nav'
import { useRoute } from './useRoute'

const DRAWER_QUERY = '(max-width: 900px)'

export default function App() {
  // Desktop: the sidebar can collapse to an icon rail. Below 900px it becomes a drawer.
  const [collapsed, setCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const route = useRoute()

  useEffect(() => {
    document.title = `${route.label} · Loopline`
  }, [route])

  useEffect(() => {
    const mq = window.matchMedia(DRAWER_QUERY)
    const close = () => setDrawerOpen(false)
    mq.addEventListener('change', close)
    return () => mq.removeEventListener('change', close)
  }, [])

  const toggleSidebar = () => {
    if (window.matchMedia(DRAWER_QUERY).matches) setDrawerOpen(false)
    else setCollapsed((c) => !c)
  }

  return (
    <div className={'app' + (collapsed ? ' is-collapsed' : '') + (drawerOpen ? ' is-drawer-open' : '')}>
      <Sidebar active={route} onToggle={toggleSidebar} onNavigate={() => setDrawerOpen(false)} />
      <div className="app__backdrop" onClick={() => setDrawerOpen(false)} />
      <Topbar title={route.label} onMenu={() => setDrawerOpen(true)} />
      {route === DEFAULT_ROUTE ? (
        <main className="panel">
          <KpiStrip />
          <div className="panel__row">
            <UsageChart />
            <CountryBreakdown />
          </div>
          <RecentActivity />
        </main>
      ) : (
        <main className="panel panel--soon" key={route.slug}>
          <ComingSoon route={route} />
        </main>
      )}
      <CommandPalette />
      <ToastHost />
    </div>
  )
}
