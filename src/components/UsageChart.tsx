import { useMemo, useRef, useState } from 'react'
import { months } from '../data'
import { Button } from './Button'
import { ChevronDownIcon } from './icons'
import { RangeMenu } from './RangeMenu'

// Geometry is the exact Figma drawing (design-frame coordinates). The plot is
// 454px wide at 1280; it stretches horizontally with the card, labels stay crisp.
const PLOT = { x: 270, y: 316, w: 454, h: 204 }
const PLOT_LEFT = 39 // card-local px
const PLOT_RIGHT = 14

// Gridline y positions from 0 (bottom) to the top tick, as drawn in Figma.
const GRID_Y = [502, 472, 442, 409, 378, 351, 319]
// Tick-label baselines and centres, as drawn in Figma (bottom to top).
const TICK_BASELINE = [506.4, 475.2, 443.5, 411.7, 381.1, 353.9, 322.1]
const TICK_X = [262.7, 258.3, 258.3, 258.3, 258.3, 258.3, 258.3]
const BOTTOM = 516.733

type Range = 'Yearly' | 'Quarterly' | 'Monthly' | 'Weekly'
const ranges: Range[] = ['Yearly', 'Quarterly', 'Monthly', 'Weekly']

type Series = {
  total: number
  max: number // value at the top gridline
  values?: number[] // omitted for Yearly, which uses the exact Figma path
  labels: { text: string; x: number }[] // x in design coordinates
  names: string[] // full name of each hover point, e.g. "March"
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Yearly: the Figma line, verbatim.
const YEARLY_LINE =
  'M270 434.651L289.813 428.99H306.796L327.175 414.838H346.988L377.556 389.93H396.803L415.484 376.344L427.372 383.703L440.958 400.12L464.733 406.913L507.756 383.703L525.304 389.93L549.646 376.344L573.988 359.928L592.668 383.703L603.99 389.93L623.803 383.703L644.182 349.738L654.372 345.209H662.297L670.788 349.738L680.978 340.681L692.865 327.095L705.885 322H724'
const MONTH_X = [270.8, 309.2, 347.2, 386.2, 426.2, 465.4, 504.9, 544.2, 584, 623.5, 663.3, 702.8]

const xAt = (i: number, n: number) => PLOT.x + (i / (n - 1)) * PLOT.w
const spread = (texts: string[], n: number) => texts.map((text, k) => ({ text, x: xAt(k, n) }))

const quarterly = [3311, 3868, 3924, 3093, 4606, 4780, 3789, 4534, 5031, 5411, 4435, 5109, 6323]
const monthly = [
  601, 578, 499, 523, 715, 690, 540, 661, 640, 754, 549, 607, 715, 664, 690, 708, 835, 730, 684, 858, 765, 651, 743, 949,
  836, 738, 903, 956, 820, 888,
]
const weekly = [553, 618, 627, 621, 855, 914, 774]

const series: Record<Range, Series> = {
  Yearly: { total: 199831, max: 120000, labels: months.map((text, i) => ({ text, x: MONTH_X[i] })), names: MONTH_NAMES },
  Quarterly: {
    total: 58214,
    max: 7200,
    values: quarterly,
    labels: spread(quarterly.map((_, i) => `W${i + 1}`), quarterly.length),
    names: quarterly.map((_, i) => `Week ${i + 1}`),
  },
  Monthly: {
    total: 21490,
    max: 1200,
    values: monthly,
    // Label every 5th day plus the last one
    labels: monthly
      .map((_, i) => ({ text: i === 0 || (i + 1) % 5 === 0 ? `Day ${i + 1}` : '', x: xAt(i, monthly.length) }))
      .filter((l) => l.text),
    names: monthly.map((_, i) => `Day ${i + 1}`),
  },
  Weekly: {
    total: 4962,
    max: 1200,
    values: weekly,
    labels: spread(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], weekly.length),
    names: DAY_NAMES,
  },
}

// Map a value onto the (unevenly spaced) Figma gridlines, piecewise between ticks.
function yFor(v: number, max: number) {
  const step = max / 6
  const k = Math.min(5, Math.floor(v / step))
  const t = (v - k * step) / step
  return GRID_Y[k] + (GRID_Y[k + 1] - GRID_Y[k]) * t
}

function linePath(s: Series) {
  if (!s.values) return YEARLY_LINE
  const n = s.values.length
  return s.values.map((v, i) => `${i ? 'L' : 'M'}${xAt(i, n).toFixed(2)} ${yFor(v, s.max).toFixed(2)}`).join('')
}

// Inverse of yFor: read a value off the axis for a y position.
function valueAt(y: number, max: number) {
  const step = max / 6
  let k = 0
  while (k < 5 && y < GRID_Y[k + 1]) k++
  return (k + (GRID_Y[k] - y) / (GRID_Y[k] - GRID_Y[k + 1])) * step
}

// Vertices of an M/L/H polyline, and its y at any x.
function vertices(d: string) {
  const pts: [number, number][] = []
  let x = 0
  let y = 0
  for (const [, cmd, args] of d.matchAll(/([MLH])([^MLH]*)/g)) {
    const n = args.trim().split(/[\s,]+/).map(Number)
    if (cmd === 'H') x = n[0]
    else [x, y] = n
    pts.push([x, y])
  }
  return pts
}
function yOnLine(pts: [number, number][], x: number) {
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    if (x <= x1) return x1 === x0 ? y1 : y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
  }
  return pts[pts.length - 1][1]
}

type Point = { x: number; y: number; name: string; value: number }

// Hover points. Generated ranges use their data; Yearly reads each month off the
// Figma line at the centre of its month label.
function pointsFor(s: Series): Point[] {
  if (s.values) {
    const n = s.values.length
    return s.values.map((v, i) => ({ x: xAt(i, n), y: yFor(v, s.max), name: s.names[i], value: v }))
  }
  const pts = vertices(YEARLY_LINE)
  return MONTH_X.map((lx, i) => {
    const x = Math.min(PLOT.x + PLOT.w, lx + 6)
    const y = yOnLine(pts, x)
    return { x, y, name: s.names[i], value: Math.round(valueAt(y, s.max) / 10) * 10 }
  })
}

const tick = (v: number) => (v === 0 ? '0' : v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : String(v))

// Month/week/day labels: Yearly keeps Figma's left-aligned x; generated ranges are
// centred on their point, with the first and last pinned inside the plot.
function labelStyle(x: number, generated: boolean, first: boolean, last: boolean) {
  const left = `calc(${PLOT_LEFT}px + ${(x - PLOT.x) / PLOT.w} * (100% - ${PLOT_LEFT + PLOT_RIGHT}px))`
  return { left, translate: !generated || first ? undefined : last ? '-100% 0' : '-50% 0' }
}

export function UsageChart() {
  const [range, setRange] = useState<Range>('Yearly')
  const [open, setOpen] = useState(false)
  const picker = useRef<HTMLDivElement>(null)
  // Closing the menu hands focus back to the trigger button.
  const close = () => {
    setOpen(false)
    picker.current?.querySelector('button')?.focus()
  }
  const s = series[range]
  const line = linePath(s)
  const generated = !!s.values
  const points = useMemo(() => pointsFor(s), [s])
  const [hover, setHover] = useState<number | null>(null)
  const hit = useRef<HTMLDivElement>(null)

  // Snap the pointer to the nearest point along x.
  const onMove = (e: React.PointerEvent) => {
    const r = hit.current!.getBoundingClientRect()
    const x = PLOT.x + ((e.clientX - r.left) / r.width) * PLOT.w
    let best = 0
    points.forEach((p, i) => Math.abs(p.x - x) < Math.abs(points[best].x - x) && (best = i))
    setHover(best)
  }
  const onKey = (e: React.KeyboardEvent) => {
    const last = points.length - 1
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    if (step) setHover((h) => Math.max(0, Math.min(last, (h ?? (step > 0 ? -1 : last + 1)) + step)))
    else if (e.key === 'Home') setHover(0)
    else if (e.key === 'End') setHover(last)
    else if (e.key === 'Escape') setHover(null)
    else return
    e.preventDefault()
  }
  const active = hover !== null ? points[hover] : null
  const frac = (x: number) => (x - PLOT.x) / PLOT.w

  return (
    <section className="card usage">
      <h2 className="card__title ink f-mono" style={{ left: 18.8, top: 19.2 }}>
        Component Usage
      </h2>
      <div className="usage__picker" ref={picker}>
        <Button
          className="usage__range"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Time range: ${range}`}
        >
          <span className="btn__label f-inter">{range}</span>
          <ChevronDownIcon className="usage__chevron" />
        </Button>
        {open && (
          <RangeMenu
            options={ranges}
            value={range}
            onChange={(r) => {
              setRange(r)
              setHover(null)
              close()
            }}
            onClose={close}
          />
        )}
      </div>
      <p className="card__value ink f-slab" style={{ left: 18.5, top: 41.9 }} aria-live="polite">
        {s.total.toLocaleString('en-US')}
      </p>

      <svg className="usage__y" width={PLOT_LEFT} height="312" viewBox={`231 228 ${PLOT_LEFT} 312`} aria-hidden>
        {TICK_BASELINE.map((y, k) => (
          <text key={k} x={TICK_X[k]} y={y} textAnchor="middle">
            {tick((s.max / 6) * k)}
          </text>
        ))}
      </svg>

      {/* keyed by range so each switch replays the left-to-right reveal */}
      <svg
        key={range}
        className="usage__plot"
        viewBox={`${PLOT.x} ${PLOT.y} ${PLOT.w} ${PLOT.h}`}
        preserveAspectRatio="none"
        style={{ left: PLOT_LEFT, width: `calc(100% - ${PLOT_LEFT + PLOT_RIGHT}px)` }}
        aria-label={`Component usage, ${range.toLowerCase()}`}
      >
        <defs>
          <linearGradient id="usage-fill" x1="497" y1="322" x2="497" y2={BOTTOM} gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEFEFE" stopOpacity="0.3" />
            <stop offset="1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {GRID_Y.map((y) => (
          <path key={y} className="usage__grid" d={`M274 ${y}H724`} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        ))}
        <g className="usage__series">
          <path d={`${line}V${BOTTOM}H${PLOT.x}Z`} fill="url(#usage-fill)" />
          <path className="usage__line" d={line} fill="none" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>

      <div key={`labels-${range}`} className="usage__labels">
        {s.labels.map((l, i) => (
          <span
            key={l.text}
            className="usage__month ink f-inter"
            style={labelStyle(l.x, generated, i === 0, i === s.labels.length - 1)}
          >
            {l.text}
          </span>
        ))}
      </div>

      {/* Hover / keyboard layer over the plot: guide line, point dot and tooltip */}
      <div
        ref={hit}
        className="usage__hit"
        style={{ left: PLOT_LEFT, width: `calc(100% - ${PLOT_LEFT + PLOT_RIGHT}px)` }}
        tabIndex={0}
        role="img"
        aria-label={`Component usage chart, ${range.toLowerCase()}. Use the left and right arrow keys to read each point.`}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        {active && (
          <>
            <span className="usage__guide" style={{ left: `${frac(active.x) * 100}%` }} />
            <span className="usage__dot" style={{ left: `${frac(active.x) * 100}%`, top: active.y - PLOT.y }} />
            <span
              className={'chart-tip' + (frac(active.x) > 0.8 ? ' is-left' : frac(active.x) < 0.2 ? ' is-right' : '')}
              style={{ left: `${frac(active.x) * 100}%`, top: active.y - PLOT.y }}
              role="status"
            >
              <span className="chart-tip__label">{active.name}</span>
              <span className="chart-tip__value">{active.value.toLocaleString('en-US')}</span>
            </span>
          </>
        )}
      </div>
    </section>
  )
}
