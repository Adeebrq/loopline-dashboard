import type { ComponentType, SVGProps } from 'react'
import {
  ClientsIcon,
  DeliveryIcon,
  DesignSystemsIcon,
  HomeIcon,
  ProjectsIcon,
  SettingsIcon,
  TargetsIcon,
} from './components/icons'

export type Route = {
  slug: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  // Positions in the 1280×832 design frame: icon centre (ix, iy) and label cap-top (ty).
  // The Figma file spaces the rows unevenly, so the values are kept as drawn.
  ix: number
  iy: number
  ty: number
}

export const routes: Route[] = [
  { slug: 'overview', label: 'Overview', Icon: HomeIcon, ix: 36, iy: 100.5, ty: 96.8 },
  { slug: 'projects', label: 'Projects', Icon: ProjectsIcon, ix: 36.5, iy: 134.5, ty: 130.8 },
  { slug: 'design-systems', label: 'Design systems', Icon: DesignSystemsIcon, ix: 36.5, iy: 170.5, ty: 165.8 },
  { slug: 'delivery', label: 'Delivery', Icon: DeliveryIcon, ix: 35.5, iy: 203.5, ty: 198.8 },
  { slug: 'targets', label: 'Targets', Icon: TargetsIcon, ix: 36.5, iy: 236.5, ty: 233 },
  { slug: 'clients', label: 'Clients', Icon: ClientsIcon, ix: 36, iy: 270, ty: 266.8 },
  { slug: 'settings', label: 'Settings', Icon: SettingsIcon, ix: 35.5, iy: 304.5, ty: 300.8 },
]

export const DEFAULT_ROUTE = routes[0]
