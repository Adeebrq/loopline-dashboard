import { useCallback, useId, useRef, useState } from 'react'
import { usePopover } from '../usePopover'
import { BellIcon } from './icons'

type Kind = 'done' | 'review' | 'ongoing' | 'hold' | 'info'
type Notification = { id: number; kind: Kind; text: string; ref?: string; time: string; unread: boolean }

// Sample notifications tied to the Recent Activity projects.
const initial: Notification[] = [
  { id: 1, kind: 'done', text: 'Atlas Labs approved Design System v2', ref: 'PR-018', time: '2h ago', unread: true },
  { id: 2, kind: 'review', text: 'Helios requested changes on App UI Redesign', ref: 'PR-019', time: '5h ago', unread: true },
  { id: 3, kind: 'hold', text: 'Orion Systems put Component Refactor on hold', ref: 'PR-021', time: 'Yesterday', unread: true },
  { id: 4, kind: 'info', text: 'Delivery Score rose 6.4% over the last 30 days', time: 'Yesterday', unread: false },
  { id: 5, kind: 'review', text: 'Vector AI left feedback on Dashboard Rebuild', ref: 'PR-022', time: '2d ago', unread: false },
  { id: 6, kind: 'ongoing', text: 'Nova Commerce kicked off Component Refactor', ref: 'PR-020', time: '3d ago', unread: false },
]

export function Notifications() {
  const [items, setItems] = useState(initial)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const wrap = useRef<HTMLDivElement>(null)
  const bell = useRef<HTMLButtonElement>(null)
  const uid = useId()
  usePopover(open, useCallback(() => setOpen(false), []), wrap, bell)

  const unread = items.filter((n) => n.unread).length
  const shown = tab === 'unread' ? items.filter((n) => n.unread) : items

  const markRead = (id: number) => setItems((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  const markAll = () => setItems((list) => list.map((n) => ({ ...n, unread: false })))

  return (
    <div className="notif" ref={wrap}>
      <button
        ref={bell}
        className="topbar__bell"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={uid}
        onClick={() => setOpen((o) => !o)}
      >
        <BellIcon />
        {unread > 0 && <span className="notif__badge" aria-hidden />}
      </button>

      {open && (
        <section id={uid} className="menu notif__panel" role="dialog" aria-label="Notifications">
          <header className="notif__head">
            <h2 className="notif__title">Notifications</h2>
            <button className="notif__markall" onClick={markAll} disabled={unread === 0}>
              Mark all as read
            </button>
          </header>

          <div className="segmented notif__tabs" role="tablist">
            {(['all', 'unread'] as const).map((t) => (
              <label key={t} className="segmented__opt">
                <input type="radio" name={`${uid}-tab`} checked={tab === t} onChange={() => setTab(t)} />
                <span>
                  {t === 'all' ? 'All' : 'Unread'}
                  {t === 'unread' && unread > 0 && <b className="notif__count">{unread}</b>}
                </span>
              </label>
            ))}
          </div>

          {shown.length ? (
            <ul className="notif__list">
              {shown.map((n) => (
                <li key={n.id}>
                  <button className={'notif__item' + (n.unread ? ' is-unread' : '')} onClick={() => markRead(n.id)}>
                    <span className={`notif__kind dot--${n.kind}`} aria-hidden>
                      <span className="status-dot" />
                    </span>
                    <span className="notif__body">
                      <span className="notif__text">{n.text}</span>
                      <span className="notif__meta">
                        {n.ref && <>{n.ref} · </>}
                        {n.time}
                      </span>
                    </span>
                    {n.unread && <span className="notif__unread" aria-label="Unread" />}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="notif__empty">You’re all caught up.</p>
          )}
        </section>
      )}
    </div>
  )
}
