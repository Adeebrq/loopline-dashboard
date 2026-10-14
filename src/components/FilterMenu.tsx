import { useEffect, useRef } from 'react'
import { statusClass, statuses, type Status } from '../data'
import { CheckIcon } from './icons'

export function FilterMenu({
  selected,
  counts,
  onChange,
  onClose,
}: {
  selected: Set<Status>
  counts: Record<string, number>
  onChange: (s: Set<Status>) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click or Escape. The toggle button lives in the same `.filter` wrapper.
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const toggle = (s: Status) => {
    const next = new Set(selected)
    if (next.has(s)) next.delete(s)
    else next.add(s)
    onChange(next)
  }

  return (
    <div className="filter__menu" ref={ref} role="menu" aria-label="Filter by status">
      <p className="filter__heading">Status</p>
      {statuses.map((s) => (
        <label key={s} className="filter__option" role="menuitemcheckbox" aria-checked={selected.has(s)}>
          <input type="checkbox" checked={selected.has(s)} onChange={() => toggle(s)} />
          <span className="filter__check">{selected.has(s) && <CheckIcon />}</span>
          <span className={`pill ${statusClass[s]}`}>{s}</span>
          <span className="filter__count">{counts[s]}</span>
        </label>
      ))}
      <div className="filter__foot">
        <button className="filter__clear" onClick={() => onChange(new Set())} disabled={selected.size === 0}>
          Clear
        </button>
        <button className="filter__done" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  )
}
