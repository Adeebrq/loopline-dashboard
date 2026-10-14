import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { statusClass, type Activity } from '../data'

// Read-only details for one activity row. Escape, the backdrop or Close dismiss it.
export function DetailsDialog({ row, onClose }: { row: Activity; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('button')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [onClose])

  const fields: [string, React.ReactNode][] = [
    ['Client', row.client],
    ['Scope', row.scope],
    ['Status', <span className={`pill ${statusClass[row.status]}`}>{row.status}</span>],
    ['Last updated', row.updated],
  ]

  return createPortal(
    <div className="dialog__backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="card dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <p className="filter__heading">Project</p>
        <h2 id="dialog-title" className="dialog__title">
          {row.id}
        </h2>
        <dl className="dialog__fields">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <button className="btn dialog__close" onClick={onClose}>
          <span className="btn__label">Close</span>
        </button>
      </div>
    </div>,
    document.body,
  )
}
