import { useCallback, useEffect, useMemo, useState } from 'react'
import { activity, statusClass, statuses, type Activity, type Status } from '../data'
import { Button } from './Button'
import { DetailsDialog } from './DetailsDialog'
import { ExportDialog } from './ExportDialog'
import { FilterMenu } from './FilterMenu'
import { RowMenu } from './RowMenu'
import { notify, on } from '../events'
import { ExportIcon, FilterIcon, MoreIcon, SearchSmallIcon, SortIcon } from './icons'

type SortKey = 'id' | 'client' | 'scope' | 'status' | 'updated'
type Sort = { key: SortKey; dir: 'asc' | 'desc' } | null

// Header labels with the gap to their sort arrows and the arrow size, as drawn in Figma.
const cols: { key?: SortKey; label: string; sort?: { gap: number; w: number; arrowGap: number } }[] = [
  { key: 'id', label: 'ID', sort: { gap: 10.1, w: 8.35, arrowGap: 0.66 } },
  { key: 'client', label: 'Client', sort: { gap: 11.1, w: 8.35, arrowGap: 0.66 } },
  { key: 'scope', label: 'Scope', sort: { gap: 4.8, w: 6.54, arrowGap: 2.23 } },
  { key: 'status', label: 'Status', sort: { gap: 12, w: 7.9, arrowGap: 0.9 } },
  { key: 'updated', label: 'Last updated', sort: { gap: 19, w: 7.9, arrowGap: 0.9 } },
  { label: 'Actions' },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "Feb 02, 2026 · 4:18 PM" → sortable timestamp
function timestamp(s: string) {
  const m = s.match(/^(\w{3}) (\d+), (\d{4}) · (\d+):(\d+) (AM|PM)$/)
  if (!m) return 0
  const [, mon, d, y, hh, mm, ap] = m
  const h = (+hh % 12) + (ap === 'PM' ? 12 : 0)
  return new Date(+y, MONTHS.indexOf(mon), +d, h, +mm).getTime()
}

// Now, in the table's "Feb 02, 2026 · 4:18 PM" format
function formatNow(d = new Date()) {
  const h = d.getHours() % 12 || 12
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${MONTHS[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()} · ${h}:${mm} ${d.getHours() < 12 ? 'AM' : 'PM'}`
}

const sortValue = (a: Activity, key: SortKey): string | number =>
  key === 'updated' ? timestamp(a.updated) : key === 'status' ? statuses.indexOf(a.status) : a[key]

export function RecentActivity() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<Status>>(() => new Set())
  const [sort, setSort] = useState<Sort>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [items, setItems] = useState<Activity[]>(activity)
  const [rowMenu, setRowMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null)
  const [details, setDetails] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // The command palette can open a project's details from anywhere.
  useEffect(() => on('project:open', (id) => setDetails(id)), [])
  const closeRowMenu = useCallback(() => {
    rowMenu?.anchor.focus()
    setRowMenu(null)
  }, [rowMenu])

  const menuRow = rowMenu && items.find((r) => r.id === rowMenu.id)
  const detailsRow = details && items.find((r) => r.id === details)

  const setStatus = (id: string, status: Status) => {
    setItems((list) => list.map((r) => (r.id === id ? { ...r, status, updated: formatNow() } : r)))
    notify(`${id} marked ${status}`)
  }

  const remove = (id: string) => {
    const index = items.findIndex((r) => r.id === id)
    const removed = items[index]
    setItems((list) => list.filter((r) => r.id !== id))
    notify(`${id} deleted`, {
      label: 'Undo',
      run: () => setItems((list) => [...list.slice(0, index), removed, ...list.slice(index)]),
    })
  }

  const copyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      notify(`Copied ${id}`)
    } catch {
      notify(`Couldn't copy ${id}`)
    }
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const out = items.filter(
      (a) =>
        (selected.size === 0 || selected.has(a.status)) &&
        (!q || [a.id, a.client, a.scope, a.status, a.updated].some((v) => v.toLowerCase().includes(q))),
    )
    if (sort) {
      const k = sort.dir === 'asc' ? 1 : -1
      out.sort((x, y) => {
        const a = sortValue(x, sort.key)
        const b = sortValue(y, sort.key)
        return (typeof a === 'number' ? a - (b as number) : a.localeCompare(b as string)) * k
      })
    }
    return out
  }, [items, query, selected, sort])

  // Click cycles a column: ascending → descending → original order.
  const toggleSort = (key: SortKey) =>
    setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null))

  return (
    <section className="card activity">
      <header className="activity__head">
        <h2 className="card__title f-mono">Recent Activity</h2>
        <div className="activity__tools">
          <label className="search search--table">
            <SearchSmallIcon className="search__icon" />
            <input
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search recent activity"
            />
          </label>
          <div className="filter">
            <Button
              className={'activity__filter' + (selected.size ? ' is-active' : '')}
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <FilterIcon className="btn__icon" />
              <span className="btn__label ink f-inter">Filter</span>
              {selected.size > 0 && <span className="btn__count">{selected.size}</span>}
            </Button>
            {menuOpen && (
              <FilterMenu
                selected={selected}
                counts={Object.fromEntries(statuses.map((s) => [s, items.filter((a) => a.status === s).length]))}
                onChange={setSelected}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </div>
          <Button className="activity__export" onClick={() => setExporting(true)} aria-haspopup="dialog" disabled={items.length === 0}>
            <ExportIcon className="btn__icon" />
            <span className="btn__label ink f-inter">Export</span>
          </Button>
        </div>
      </header>

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              {cols.map((c) => {
                const dir = sort && c.key === sort.key ? sort.dir : undefined
                return (
                  <th key={c.label} scope="col" aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                    {c.key && c.sort ? (
                      <button className="table__sortbtn" onClick={() => toggleSort(c.key!)}>
                        <span className="f-mono">{c.label}</span>
                        <SortIcon className="table__sort" w={c.sort.w} gap={c.sort.arrowGap} dir={dir} style={{ marginLeft: c.sort.gap }} />
                      </button>
                    ) : (
                      <span className="f-mono">{c.label}</span>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td><span className="f-mono">{a.id}</span></td>
                <td><span className="f-mono">{a.client}</span></td>
                <td><span className="f-mono">{a.scope}</span></td>
                <td><span className={`pill ${statusClass[a.status]}`}>{a.status}</span></td>
                <td><span className="f-mono">{a.updated}</span></td>
                <td>
                  <button
                    className={'table__more' + (rowMenu?.id === a.id ? ' is-open' : '')}
                    aria-label={`Actions for ${a.id}`}
                    aria-haspopup="menu"
                    aria-expanded={rowMenu?.id === a.id}
                    onClick={(e) => {
                      const anchor = e.currentTarget
                      setRowMenu((m) => (m?.id === a.id ? null : { id: a.id, anchor }))
                    }}
                  >
                    <MoreIcon />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="table__empty" colSpan={cols.length}>
                  <span className="f-mono">No activity matches your filters.</span>
                  <button
                    className="table__reset"
                    onClick={() => {
                      setQuery('')
                      setSelected(new Set())
                    }}
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {menuRow && rowMenu && (
        <RowMenu
          row={menuRow}
          anchor={rowMenu.anchor}
          onClose={closeRowMenu}
          onView={() => {
            setDetails(menuRow.id)
            setRowMenu(null)
          }}
          onCopy={() => {
            copyId(menuRow.id)
            closeRowMenu()
          }}
          onStatus={(s) => {
            if (s !== menuRow.status) setStatus(menuRow.id, s)
            closeRowMenu()
          }}
          onDelete={() => {
            remove(menuRow.id)
            setRowMenu(null)
          }}
        />
      )}
      {detailsRow && <DetailsDialog row={detailsRow} onClose={() => setDetails(null)} />}
      {exporting && (
        <ExportDialog
          viewRows={rows}
          allRows={items}
          onClose={() => setExporting(false)}
          onExported={(summary) => {
            setExporting(false)
            notify(summary)
          }}
        />
      )}
    </section>
  )
}
