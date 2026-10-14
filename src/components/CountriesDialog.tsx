import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { allCountries, countryTotal } from '../data'

const BARS = 40
const leader = Math.max(...allCountries.map((c) => c.value))

// Every country behind the Country Breakdown card. The meters use the card's
// bar style, scaled to the leading country; the % is share of the total.
export function CountriesDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const uid = useId()
  const [sort, setSort] = useState<'value' | 'name'>('value')

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

  const rows = useMemo(
    () => [...allCountries].sort((a, b) => (sort === 'value' ? b.value - a.value : a.name.localeCompare(b.name))),
    [sort],
  )

  return createPortal(
    <div className="dialog__backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="card dialog countries-dialog" role="dialog" aria-modal="true" aria-labelledby={`${uid}-t`}>
        <div className="countries-dialog__head">
          <div>
            <p className="filter__heading">Last Month</p>
            <h2 id={`${uid}-t`} className="dialog__title">
              Country Breakdown
            </h2>
          </div>
          <div className="segmented" role="radiogroup" aria-label="Sort countries">
            {(['value', 'name'] as const).map((k) => (
              <label key={k} className="segmented__opt">
                <input type="radio" name={`${uid}-sort`} checked={sort === k} onChange={() => setSort(k)} />
                <span>{k === 'value' ? 'Top' : 'A–Z'}</span>
              </label>
            ))}
          </div>
        </div>

        <p className="countries-dialog__total">
          <span className="f-slab">{countryTotal.toLocaleString('en-US')}</span>
          <span>across {allCountries.length} countries</span>
        </p>

        <ul className="countries-dialog__list">
          {rows.map((c) => {
            const lit = Math.round((c.value / leader) * BARS)
            const pct = ((c.value / countryTotal) * 100).toFixed(1)
            return (
              <li key={c.code} className="countries-dialog__row">
                {c.flag ? (
                  <img className="countries-dialog__flag" src={c.flag} alt="" />
                ) : (
                  <span className="countries-dialog__flag countries-dialog__code" aria-hidden>
                    {c.code}
                  </span>
                )}
                <span className="countries-dialog__name">{c.name}</span>
                <span className="countries-dialog__value">
                  {c.value.toLocaleString('en-US')} <span>({pct}%)</span>
                </span>
                <span className="bars countries-dialog__bars" role="meter" aria-valuenow={+pct} aria-label={`${c.name} share`}>
                  {Array.from({ length: BARS }, (_, b) => (
                    <i key={b} className={b < lit ? 'on' : undefined} style={b < lit ? { ['--i' as string]: b } : undefined} />
                  ))}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="dialog__actions">
          <button className="btn dialog__primary" onClick={onClose}>
            <span className="btn__label">Close</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
