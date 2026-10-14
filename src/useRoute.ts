import { useEffect, useState } from 'react'
import { DEFAULT_ROUTE, routes, type Route } from './nav'

const fromHash = (): Route | undefined => routes.find((r) => r.slug === location.hash.slice(1))

// Hash routing: `#overview`, `#projects`, … An empty or unknown hash lands on #overview.
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => fromHash() ?? DEFAULT_ROUTE)

  useEffect(() => {
    const sync = () => {
      const r = fromHash()
      if (!r) history.replaceState(null, '', `#${DEFAULT_ROUTE.slug}`)
      setRoute(r ?? DEFAULT_ROUTE)
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  return route
}
