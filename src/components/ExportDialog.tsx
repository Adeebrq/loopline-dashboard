import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Activity } from '../data'
import { CheckIcon } from './icons'

type Format = 'csv' | 'json'
type Scope = 'view' | 'all'
type Column = { key: keyof Activity; label: string }

const COLUMNS: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'client', label: 'Client' },
  { key: 'scope', label: 'Scope' },
  { key: 'status', label: 'Status' },
  { key: 'updated', label: 'Last updated' },
]

function download(name: string, body: string, type: string) {
  const url = URL.createObjectURL(new Blob([body], { type }))
  Object.assign(document.createElement('a'), { href: url, download: name }).click()
  URL.revokeObjectURL(url)
}

function serialize(rows: Activity[], cols: Column[], format: Format) {
  if (format === 'json') {
    return JSON.stringify(
      rows.map((r) => Object.fromEntries(cols.map((c) => [c.key, r[c.key]]))),
      null,
      2,
    )
  }
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [cols.map((c) => c.label), ...rows.map((r) => cols.map((c) => r[c.key]))]
    .map((line) => line.map(esc).join(','))
    .join('\n')
}

// Export options for the Recent Activity table. Nothing downloads until "Export" is pressed.
export function ExportDialog({
  viewRows,
  allRows,
  onClose,
  onExported,
}: {
  viewRows: Activity[]
  allRows: Activity[]
  onClose: () => void
  onExported: (summary: string) => void
}) {
  const ref = useRef<HTMLFormElement>(null)
  const uid = useId()
  const [format, setFormat] = useState<Format>('csv')
  const [scope, setScope] = useState<Scope>(viewRows.length ? 'view' : 'all')
  const [cols, setCols] = useState<Set<keyof Activity>>(() => new Set(COLUMNS.map((c) => c.key)))
  const [name, setName] = useState('recent-activity')

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.querySelector<HTMLElement>('input')?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [onClose])

  const rows = scope === 'view' ? viewRows : allRows
  const chosen = COLUMNS.filter((c) => cols.has(c.key))
  const file = `${name.trim() || 'recent-activity'}.${format}`
  const canExport = rows.length > 0 && chosen.length > 0

  const toggleCol = (k: keyof Activity) =>
    setCols((s) => {
      const next = new Set(s)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canExport) return
    download(file, serialize(rows, chosen, format), format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json')
    onExported(`Exported ${rows.length} row${rows.length === 1 ? '' : 's'} as ${format.toUpperCase()}`)
  }

  return createPortal(
    <div className="dialog__backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        ref={ref}
        className="card dialog export"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        onSubmit={submit}
      >
        <p className="filter__heading">Recent Activity</p>
        <h2 id={`${uid}-title`} className="dialog__title">
          Export
        </h2>

        <fieldset className="export__group">
          <legend>Format</legend>
          <div className="segmented">
            {(['csv', 'json'] as Format[]).map((f) => (
              <label key={f} className="segmented__opt">
                <input type="radio" name={`${uid}-format`} checked={format === f} onChange={() => setFormat(f)} />
                <span>{f.toUpperCase()}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="export__group">
          <legend>Rows</legend>
          {(
            [
              ['view', 'Current view', 'Search, filters and sort applied', viewRows.length],
              ['all', 'All activity', 'Every row in the table', allRows.length],
            ] as const
          ).map(([v, title, hint, n]) => (
            <label key={v} className={'choice' + (n === 0 ? ' is-disabled' : '')}>
              <input
                type="radio"
                name={`${uid}-scope`}
                checked={scope === v}
                disabled={n === 0}
                onChange={() => setScope(v)}
              />
              <span className="choice__radio" />
              <span className="choice__text">
                <span>{title}</span>
                <small>{hint}</small>
              </span>
              <span className="choice__count">{n} rows</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="export__group">
          <legend>Columns</legend>
          <div className="export__cols">
            {COLUMNS.map((c) => (
              <label key={c.key} className="filter__option export__col">
                <input type="checkbox" checked={cols.has(c.key)} onChange={() => toggleCol(c.key)} />
                <span className="filter__check">{cols.has(c.key) && <CheckIcon />}</span>
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="export__group export__name">
          <span className="export__legend">File name</span>
          <span className="export__field">
            <input value={name} onChange={(e) => setName(e.target.value)} spellCheck={false} />
            <span className="export__ext">.{format}</span>
          </span>
        </label>

        <div className="dialog__actions">
          <button type="button" className="row-menu__ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn dialog__primary" disabled={!canExport}>
            <span className="btn__label">Export {rows.length} rows</span>
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
