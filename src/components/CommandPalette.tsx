import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { activity, statusClass } from '../data'
import { emit, on } from '../events'
import { routes } from '../nav'
import { shortcutLabel } from '../shortcut'
import { SearchIcon } from './icons'

type Result =
  | { kind: 'page'; key: string; label: string; slug: string; Icon: (typeof routes)[number]['Icon'] }
  | { kind: 'project'; key: string; label: string; id: string; sub: string; status: (typeof activity)[number]['status'] }


function search(q: string): Result[] {
  const s = q.trim().toLowerCase()
  const match = (...fields: string[]) => !s || fields.some((f) => f.toLowerCase().includes(s))
  const pages: Result[] = routes
    .filter((r) => match(r.label, r.slug))
    .map((r) => ({ kind: 'page', key: `page-${r.slug}`, label: r.label, slug: r.slug, Icon: r.Icon }))
  const projects: Result[] = activity
    .filter((a) => match(a.id, a.client, a.scope, a.status))
    .map((a) => ({ kind: 'project', key: `project-${a.id}`, label: a.id, id: a.id, sub: `${a.client} · ${a.scope}`, status: a.status }))
  return [...pages, ...projects]
}

// ⌘K / Ctrl+K (or the sidebar search box) opens a palette to jump to pages and projects.
export function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    const off = on('palette:open', () => setOpen(true))
    return () => {
      document.removeEventListener('keydown', onKey)
      off()
    }
  }, [])

  return open ? <Palette onClose={() => setOpen(false)} /> : null
}

function Palette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const results = useMemo(() => search(query), [query])

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    input.current?.focus()
    return () => prev?.focus()
  }, [])
  useEffect(() => setActive(0), [query])
  useEffect(() => {
    list.current?.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (r: Result | undefined) => {
    if (!r) return
    onClose()
    if (r.kind === 'page') {
      location.hash = r.slug
    } else {
      location.hash = 'overview'
      // Let the Overview mount before asking the table to open the project.
      setTimeout(() => emit('project:open', r.id), 60)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActive((i) => Math.min(results.length - 1, i + 1))
    else if (e.key === 'ArrowUp') setActive((i) => Math.max(0, i - 1))
    else if (e.key === 'Enter') choose(results[active])
    else if (e.key === 'Escape') onClose()
    else return
    e.preventDefault()
  }

  const pages = results.filter((r) => r.kind === 'page')
  const projects = results.filter((r) => r.kind === 'project')
  const row = (r: Result) => {
    const i = results.indexOf(r)
    return (
      <li
        key={r.key}
        id={r.key}
        role="option"
        aria-selected={i === active}
        className={'palette__item' + (i === active ? ' is-active' : '')}
        onPointerMove={() => setActive(i)}
        onClick={() => choose(r)}
      >
        {r.kind === 'page' ? (
          <>
            <span className="palette__icon">
              <r.Icon />
            </span>
            <span className="palette__label">{r.label}</span>
            <span className="palette__hint">Page</span>
          </>
        ) : (
          <>
            <span className={`palette__icon ${statusClass[r.status].replace('pill--', 'dot--')}`}>
              <span className="status-dot" />
            </span>
            <span className="palette__label">
              <span className="palette__id">{r.label}</span>
              <span className="palette__sub">{r.sub}</span>
            </span>
            <span className="palette__hint">{r.status}</span>
          </>
        )}
      </li>
    )
  }

  return createPortal(
    <div className="dialog__backdrop palette__backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card palette" role="dialog" aria-modal="true" aria-label="Search">
        <label className="palette__search">
          <SearchIcon />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages and projects…"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[active]?.key}
            spellCheck={false}
          />
          <kbd>Esc</kbd>
        </label>
        <ul id="palette-list" ref={list} className="palette__list" role="listbox">
          {pages.length > 0 && <li className="filter__heading palette__group">Pages</li>}
          {pages.map(row)}
          {projects.length > 0 && <li className="filter__heading palette__group">Projects</li>}
          {projects.map(row)}
          {results.length === 0 && <li className="notif__empty">No results for “{query}”</li>}
        </ul>
        <footer className="palette__foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
          <span><kbd>↵</kbd> to open</span>
          <span className="palette__shortcut"><kbd>{shortcutLabel}</kbd> to toggle</span>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
