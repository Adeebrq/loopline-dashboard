import { emit } from '../events'
import { routes, type Route } from '../nav'
import { shortcutLabel } from '../shortcut'
import { CollapseIcon, LogoIcon, SearchIcon } from './icons'

const ROW_H = 25
const ROW_X = 18

export function Sidebar({
  active,
  onToggle,
  onNavigate,
}: {
  active: Route
  onToggle: () => void
  onNavigate: () => void
}) {
  return (
    <aside className="sidebar">
      <a className="brand" href="#overview" aria-label="Loopline home" onClick={onNavigate}>
        <LogoIcon className="sidebar__logo" />
        <span className="brand__name">Loopline</span>
      </a>
      <button className="sidebar__collapse" aria-label="Toggle sidebar" onClick={onToggle}>
        <CollapseIcon />
      </button>

      {/* Looks like the Figma search field; opens the ⌘K command palette. */}
      <button
        className="search search--sidebar"
        title={`Search (${shortcutLabel})`}
        aria-keyshortcuts={shortcutLabel.includes('⌘') ? 'Meta+K' : 'Control+K'}
        onClick={() => {
          onNavigate()
          emit('palette:open')
        }}
      >
        <SearchIcon className="search__icon" />
        <span className="search__placeholder">Search</span>
      </button>

      <nav className="nav">
        {routes.map((r) => {
          const { slug, label, Icon, ix, iy, ty } = r
          const top = Math.round(iy - ROW_H / 2)
          const current = r === active
          return (
            <a
              key={slug}
              href={`#${slug}`}
              className={'nav__item' + (current ? ' is-active' : '')}
              aria-current={current ? 'page' : undefined}
              style={{ top }}
              title={label}
              onClick={onNavigate}
            >
              <span className="nav__icon" style={{ left: ix - ROW_X, top: iy - top }}>
                <Icon />
              </span>
              <span className="nav__label" style={{ top: ty - top }}>
                {label}
              </span>
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
