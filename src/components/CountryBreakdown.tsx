import { useRef, useState } from 'react'
import { countries } from '../data'
import { Button } from './Button'
import { CountriesDialog } from './CountriesDialog'
import { Trend } from './Trend'

const BARS = 80

// Per-row geometry in card-local px, as drawn in Figma. Right-side items are
// stored as distances from the card's right edge so the card can stretch.
const rows = [
  { flag: [18, 120, 19.83], nameX: 46.1, nameY: 125.3, valueR: 15.8, valueY: 125.4, barsX: 18.98, barsR: 11.95, barsY: 147, barW: 1.97 },
  { flag: [20, 182, 19.66], nameX: 48.1, nameY: 187.3, valueR: 13.8, valueY: 187.4, barsX: 21.93, barsR: 16.9, barsY: 209, barW: 1.93 },
  { flag: [20, 250, 19.7], nameX: 47.3, nameY: 255.5, valueR: 13.8, valueY: 255.4, barsX: 20.97, barsR: 16.94, barsY: 277, barW: 1.94 },
]

// "12,628 (80%)" → ["12,628", "80%"]
const splitValue = (v: string) => v.match(/^(.*?)\s*\((.*)\)$/)?.slice(1) ?? [v, '']

export function CountryBreakdown() {
  const [showAll, setShowAll] = useState(false)
  // Tooltip over a row's meter: which row, and x within the card (follows the pointer)
  const [tip, setTip] = useState<{ row: number; x: number } | null>(null)
  const card = useRef<HTMLElement>(null)
  const track = (row: number) => (e: React.PointerEvent) =>
    setTip({ row, x: e.clientX - card.current!.getBoundingClientRect().left })
  const tipRow = tip && countries[tip.row]
  const [tipValue, tipShare] = tipRow ? splitValue(tipRow.value) : ['', '']

  return (
    <section className="card countries" ref={card}>
      <h2 className="card__title ink f-mono" style={{ left: 20.8, top: 18.8 }}>
        Country Breakdown
      </h2>
      <Button className="countries__all" onClick={() => setShowAll(true)} aria-haspopup="dialog">
        <span className="btn__label ink f-inter">View all</span>
      </Button>
      <p className="card__value ink f-slab" style={{ left: 18.3, top: 47.9 }}>
        67,546
      </p>
      <Trend className="countries__trend" dir="up" change="67.3%" note="Last Month" />

      <ul className="countries__list">
        {countries.map((c, i) => {
          const r = rows[i]
          const [fx, fy, fd] = r.flag
          const lit = Math.round(c.share * BARS)
          return (
            <li key={c.name}>
              <img className="countries__flag" src={c.flag} alt="" style={{ left: fx, top: fy, width: fd, height: fd }} />
              <span className="countries__name ink f-inter" style={{ left: r.nameX, top: r.nameY }}>
                {c.name}
              </span>
              <span className="countries__value ink f-mono" style={{ right: r.valueR - 2.2, top: r.valueY }}>
                {c.value}
              </span>
              <span
                className="bars"
                role="meter"
                aria-valuenow={Math.round(c.share * 100)}
                aria-label={`${c.name}: ${c.value}`}
                tabIndex={0}
                onPointerMove={track(i)}
                onPointerDown={track(i)}
                onPointerLeave={(e) => e.pointerType === 'mouse' && setTip(null)}
                onFocus={(e) => setTip({ row: i, x: e.currentTarget.offsetLeft + e.currentTarget.offsetWidth / 2 })}
                onBlur={() => setTip(null)}
                style={{ left: r.barsX, right: r.barsR, top: r.barsY, ['--bar-w' as string]: `${r.barW}px`, ['--row' as string]: i }}
              >
                {Array.from({ length: BARS }, (_, b) => (
                  // --i staggers the fill-in animation so the meter lights up left to right on load
                  <i key={b} className={b < lit ? 'on' : undefined} style={b < lit ? { ['--i' as string]: b } : undefined} />
                ))}
              </span>
            </li>
          )
        })}
      </ul>
      {tip && tipRow && (
        <span
          className="chart-tip chart-tip--bars"
          style={{ left: Math.max(70, Math.min(tip.x, (card.current?.offsetWidth ?? 0) - 70)), top: rows[tip.row].barsY - 4 }}
          role="status"
        >
          <span className="chart-tip__label">
            <img src={tipRow.flag} alt="" />
            {tipRow.name}
          </span>
          <span className="chart-tip__value">
            {tipValue}
            {tipShare && <span className="chart-tip__share">{tipShare} share</span>}
          </span>
        </span>
      )}
      {showAll && <CountriesDialog onClose={() => setShowAll(false)} />}
    </section>
  )
}
