import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { statusClass, statuses, type Activity, type Status } from '../data'
import { CheckIcon } from './icons'

const MENU_W = 184

// Row actions for the Recent Activity table. Rendered in a portal with fixed
// positioning so the table card's overflow never clips it; it opens below the
// ⋯ button, or above when there isn't room.
export function RowMenu({
  row,
  anchor,
  onClose,
  onView,
  onCopy,
  onStatus,
  onDelete,
}: {
  row: Activity
  anchor: HTMLElement
  onClose: () => void
  onView: () => void
  onCopy: () => void
  onStatus: (s: Status) => void
  onDelete: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number; up: boolean } | null>(null)
  const [confirming, setConfirming] = useState(false)

  useLayoutEffect(() => {
    const place = () => {
      const a = anchor.getBoundingClientRect()
      const h = ref.current?.offsetHeight ?? 0
      const up = a.bottom + 6 + h > window.innerHeight - 8 && a.top - 6 - h > 8
      setPos({
        left: Math.max(8, Math.min(a.right - MENU_W, window.innerWidth - MENU_W - 8)),
        top: up ? a.top - 6 - h : a.bottom + 6,
        up,
      })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [anchor, confirming])

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus()
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!ref.current?.contains(t) && !anchor.contains(t)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    // The table scrolls horizontally on small screens; close rather than drift.
    const onScroll = (e: Event) => !ref.current?.contains(e.target as Node) && onClose()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [anchor, onClose])

  // Up/down arrows move between items
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...(ref.current?.querySelectorAll<HTMLElement>('[role=menuitem],[role=menuitemradio]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  return createPortal(
    <div
      ref={ref}
      className={'menu row-menu' + (pos?.up ? ' is-up' : '')}
      role="menu"
      aria-label={`Actions for ${row.id}`}
      style={{ position: 'fixed', width: MENU_W, left: pos?.left ?? -9999, top: pos?.top ?? 0 }}
      onKeyDown={onKeyDown}
    >
      <p className="filter__heading">{row.id}</p>
      <button className="row-menu__item" role="menuitem" onClick={onView}>
        View details
      </button>
      <button className="row-menu__item" role="menuitem" onClick={onCopy}>
        Copy ID
      </button>

      <div className="row-menu__sep" />
      <p className="filter__heading">Set status</p>
      {statuses.map((s) => (
        <button
          key={s}
          className={`row-menu__item row-menu__status ${statusClass[s].replace('pill--', 'dot--')}`}
          role="menuitemradio"
          aria-checked={s === row.status}
          onClick={() => onStatus(s)}
        >
          <span className="row-menu__label">
            <span className="status-dot" aria-hidden />
            {s}
          </span>
          {s === row.status && <CheckIcon className="range-menu__check" />}
        </button>
      ))}

      <div className="row-menu__sep" />
      {confirming ? (
        <div className="row-menu__confirm">
          <span>Delete {row.id}?</span>
          <button className="row-menu__ghost" onClick={() => setConfirming(false)}>
            Cancel
          </button>
          <button className="row-menu__danger" role="menuitem" onClick={onDelete} autoFocus>
            Delete
          </button>
        </div>
      ) : (
        <button className="row-menu__item row-menu__item--danger" role="menuitem" onClick={() => setConfirming(true)}>
          Delete
        </button>
      )}
    </div>,
    document.body,
  )
}
