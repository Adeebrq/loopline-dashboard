import { MenuIcon } from './icons'
import { Notifications } from './Notifications'
import { ProfileMenu } from './ProfileMenu'

export function Topbar({ title, onMenu }: { title: string; onMenu: () => void }) {
  return (
    <header className="topbar">
      <button className="topbar__menu" aria-label="Open menu" onClick={onMenu}>
        <MenuIcon />
      </button>
      <h1 className="topbar__title f-inter">{title}</h1>
      <Notifications />
      <span className="topbar__divider" />
      <ProfileMenu />
    </header>
  )
}
