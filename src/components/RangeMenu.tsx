import { useEffect, useRef, useState } from 'react'
import { CheckIcon } from './icons'

// Single-select dropdown list, styled like the table's Filter menu.
// Arrow keys move, Enter/Space picks, Escape or an outside click closes.
export function RangeMenu<T extends string>({
  options,
  value,
  onChange,
  onClose,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLUListElement>(null)
  const [active, setActive] = useState(() => Math.max(0, options.indexOf(value)))

  useEffect(() => {
    ref.current?.focus()
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.parentElement?.contains(e.target as Node)) onClose()
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [onClose])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActive((i) => (i + 1) % options.length)
    else if (e.key === 'ArrowUp') setActive((i) => (i - 1 + options.length) % options.length)
    else if (e.key === 'Home') setActive(0)
    else if (e.key === 'End') setActive(options.length - 1)
    else if (e.key === 'Enter' || e.key === ' ') onChange(options[active])
    else if (e.key === 'Escape' || e.key === 'Tab') onClose()
    else return
    e.preventDefault()
  }

  return (
    <ul
      ref={ref}
      className="menu range-menu"
      role="listbox"
      tabIndex={-1}
      aria-label="Time range"
      aria-activedescendant={`range-${options[active]}`}
      onKeyDown={onKeyDown}
    >
      {options.map((o, i) => (
        <li
          key={o}
          id={`range-${o}`}
          role="option"
          aria-selected={o === value}
          className={'range-menu__option' + (i === active ? ' is-active' : '')}
          onPointerEnter={() => setActive(i)}
          onClick={() => onChange(o)}
        >
          <span>{o}</span>
          {o === value && <CheckIcon className="range-menu__check" />}
        </li>
      ))}
    </ul>
  )
}
