// Tiny app-wide event channel so distant components can talk without prop drilling:
// the sidebar/⌘K opens the command palette, the palette opens a project's details,
// and anything can raise a toast.
import type { ToastData } from './components/Toast'

type Events = {
  'palette:open': void
  'project:open': string
  toast: Omit<ToastData, 'id'>
}

const target = new EventTarget()

export function emit<K extends keyof Events>(type: K, detail?: Events[K]) {
  target.dispatchEvent(new CustomEvent(type, { detail }))
}

export function on<K extends keyof Events>(type: K, fn: (detail: Events[K]) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<Events[K]>).detail)
  target.addEventListener(type, handler)
  return () => target.removeEventListener(type, handler)
}

export const notify = (text: string, action?: ToastData['action']) => emit('toast', { text, action })
