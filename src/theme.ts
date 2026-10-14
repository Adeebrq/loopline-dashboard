import { useEffect, useState } from 'react'

export type ThemePref = 'light' | 'dark' | 'system'
const KEY = 'loopline-theme'
const media = () => window.matchMedia('(prefers-color-scheme: light)')

function read(): ThemePref {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* storage blocked: fall back to the default */
  }
  return 'dark' // the design's default
}

const resolve = (pref: ThemePref) => (pref === 'system' ? (media().matches ? 'light' : 'dark') : pref)

function apply(pref: ThemePref, animate: boolean) {
  const root = document.documentElement
  if (animate) {
    root.classList.add('theme-switching')
    window.setTimeout(() => root.classList.remove('theme-switching'), 300)
  }
  root.dataset.theme = resolve(pref)
}

// Theme preference (light / dark / follow the system), remembered in localStorage.
// index.html applies the saved theme before first paint, so there is no flash.
export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(read)

  useEffect(() => {
    if (pref !== 'system') return
    const mq = media()
    const onChange = () => apply('system', true)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [pref])

  const set = (next: ThemePref) => {
    setPref(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* ignore */
    }
    apply(next, true)
  }

  return [pref, set] as const
}
