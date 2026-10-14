import { useCallback, useEffect, useId, useRef, useState } from 'react'
import avatar from '../assets/img/avatar.svg'
import { emit, notify } from '../events'
import { useTheme, type ThemePref } from '../theme'
import { usePopover } from '../usePopover'

// Placeholder identity until real auth is wired up.
const user = { name: 'Lando Norris', email: 'lando@loopline.studio', role: 'Design Lead' }

export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const uid = useId()
  const close = useCallback(() => setOpen(false), [])
  const [theme, setTheme] = useTheme()
  usePopover(open, close, wrap, trigger)

  // Move focus into the menu when it opens
  useEffect(() => {
    if (open) wrap.current?.querySelector<HTMLElement>('[role=menuitem]')?.focus()
  }, [open])

  const run = (fn: () => void) => () => {
    close()
    fn()
  }

  // Up/down arrows move between the menu items
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const items = [...(wrap.current?.querySelectorAll<HTMLElement>('[role=menuitem]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  return (
    <div className="profile" ref={wrap}>
      <button
        ref={trigger}
        className="topbar__profile"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={uid}
        onClick={() => setOpen((o) => !o)}
      >
        <img className="topbar__avatar" src={avatar} alt="" />
      </button>

      {open && (
        <div id={uid} className="menu profile__menu" role="menu" aria-label="Account" onKeyDown={onKeyDown}>
          <div className="profile__who">
            <img src={avatar} alt="" />
            <span>
              <span className="profile__name">{user.name}</span>
              <span className="profile__email">{user.email}</span>
            </span>
          </div>
          <div className="row-menu__sep" />
          <div className="profile__theme">
            <span className="profile__theme-label" id={`${uid}-theme`}>
              Theme
            </span>
            <div className="segmented" role="radiogroup" aria-labelledby={`${uid}-theme`}>
              {(['light', 'dark', 'system'] as ThemePref[]).map((t) => (
                <label key={t} className="segmented__opt">
                  <input type="radio" name={`${uid}-theme-opt`} checked={theme === t} onChange={() => setTheme(t)} />
                  <span>{t[0].toUpperCase() + t.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="row-menu__sep" />
          <a className="row-menu__item" role="menuitem" href="#settings" onClick={close}>
            Account settings
          </a>
          <button className="row-menu__item" role="menuitem" onClick={run(() => emit('palette:open'))}>
            Search
          </button>
          <button className="row-menu__item" role="menuitem" onClick={run(() => notify('Help center is coming soon'))}>
            Help &amp; docs
          </button>
          <div className="row-menu__sep" />
          <button
            className="row-menu__item row-menu__item--danger"
            role="menuitem"
            onClick={run(() => notify('Sign-in isn’t connected yet, so there’s nothing to sign out of'))}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
