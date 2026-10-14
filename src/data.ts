import usFlag from './assets/img/us.svg'
import ukFlag from './assets/img/uk.svg'
import nlFlag from './assets/img/nl.svg'
import deFlag from './assets/img/de.svg'
import frFlag from './assets/img/fr.svg'
import caFlag from './assets/img/ca.svg'
import inFlag from './assets/img/in.svg'
import auFlag from './assets/img/au.svg'
import brFlag from './assets/img/br.svg'

export type Kpi = {
  title: string
  value: string
  sans?: boolean // the design sets every figure in Roboto Slab except "92.6%"
  trend: 'up' | 'down'
  change: string
  note: string
}

export const kpis: Kpi[] = [
  { title: 'Delivery Score', value: '92.6%', sans: true, trend: 'up', change: '6.4%', note: 'last 30 days' },
  { title: 'Active Projects', value: '18', trend: 'up', change: '3 new', note: 'last 30 days' },
  { title: 'System Coverage', value: '74', trend: 'up', change: '12', note: 'last 30 days' },
  { title: 'Avg. Turnaround', value: '4.2 days', trend: 'down', change: '18%', note: 'last 30 days' },
]

export type Country = { name: string; flag: string; value: string; share: number }

export const countries: Country[] = [
  { name: 'United States', flag: usFlag, value: '12,628 (80%)', share: 45 / 80 },
  { name: 'United Kingdom', flag: ukFlag, value: '12,628 (80%)', share: 45 / 80 },
  { name: 'Netherlands', flag: nlFlag, value: '12,628 (80%)', share: 45 / 80 },
]

export const statuses = ['Completed', 'In Review', 'Ongoing', 'On hold'] as const
// Full list behind "View all". The top three match the card; the rest are sample
// figures so that every country adds up to the card's 67,546 total.
export type CountryRow = { code: string; name: string; value: number; flag?: string }
export const allCountries: CountryRow[] = [
  { code: 'US', name: 'United States', value: 12628, flag: usFlag },
  { code: 'GB', name: 'United Kingdom', value: 12628, flag: ukFlag },
  { code: 'NL', name: 'Netherlands', value: 12628, flag: nlFlag },
  { code: 'DE', name: 'Germany', value: 8412, flag: deFlag },
  { code: 'FR', name: 'France', value: 6905, flag: frFlag },
  { code: 'CA', name: 'Canada', value: 5310, flag: caFlag },
  { code: 'IN', name: 'India', value: 4286, flag: inFlag },
  { code: 'AU', name: 'Australia', value: 2764, flag: auFlag },
  { code: 'BR', name: 'Brazil', value: 1985, flag: brFlag },
]
export const countryTotal = allCountries.reduce((n, c) => n + c.value, 0)

export type Status = (typeof statuses)[number]

export const statusClass: Record<Status, string> = {
  Completed: 'pill--done',
  'In Review': 'pill--review',
  Ongoing: 'pill--ongoing',
  'On hold': 'pill--hold',
}

export type Activity = { id: string; client: string; scope: string; status: Status; updated: string }

export const activity: Activity[] = [
  { id: 'PR-018', client: 'Atlas Labs', scope: 'Design System v2', status: 'Completed', updated: 'Feb 02, 2026 · 4:18 PM' },
  { id: 'PR-019', client: 'Helios', scope: 'App UI Redesign', status: 'In Review', updated: 'Feb 01, 2026 · 6:42 PM' },
  { id: 'PR-020', client: 'Nova Commerce', scope: 'Component Refactor', status: 'Ongoing', updated: 'Jan 31, 2026 · 2:09 PM' },
  { id: 'PR-021', client: 'Orion Systems', scope: 'Component Refactor', status: 'On hold', updated: 'Jan 29, 2026 · 11:54 AM' },
  { id: 'PR-022', client: 'Vector AI', scope: 'Dashboard Rebuild', status: 'In Review', updated: 'Jan 28, 2026 · 5:31 PM' },
  { id: 'PR-023', client: 'Polaris', scope: 'Motion System', status: 'Completed', updated: 'Jan 27, 2026 · 1:46 PM' },
]

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
