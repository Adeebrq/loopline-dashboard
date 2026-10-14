import type { CSSProperties } from 'react'
import { kpis } from '../data'
import { Trend } from './Trend'

// Figma insets each column's text slightly differently; kept as drawn on desktop.
const offsets = [
  { x: 30, y: 0 },
  { x: 35, y: 0 },
  { x: 33, y: 3 },
  { x: 56.5, y: 3 },
]

export function KpiStrip() {
  return (
    <section className="card kpis">
      {kpis.map((k, i) => (
        <div key={k.title} className="kpi" style={{ '--kx': `${offsets[i].x}px`, '--ky': `${offsets[i].y}px` } as CSSProperties}>
          <div className="kpi__body">
            <h2 className="kpi__title ink f-mono">{k.title}</h2>
            <p className={`kpi__value ink ${k.sans ? 'f-roboto' : 'f-slab'}`}>{k.value}</p>
            <Trend className="kpi__trend" dir={k.trend} change={k.change} note={k.note} />
          </div>
        </div>
      ))}
    </section>
  )
}
