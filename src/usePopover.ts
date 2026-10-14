import { useEffect, type RefObject } from 'react'

// Closes a popover on an outside pointer press or Escape (Escape also returns
// focus to the trigger, if one is given).
export function usePopover(
  open: boolean,
  close: () => void,
  wrap: RefObject<HTMLElement | null>,
  trigger?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && close()
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      close()
      trigger?.current?.focus()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close, wrap, trigger])
}
