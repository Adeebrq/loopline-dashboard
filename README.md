# Loopline

A delivery dashboard for design-system and UI work: delivery KPIs, component usage, country breakdown and recent project activity. Built from a Figma design (1280 × 832 frame) and made fully responsive.

## Stack

React 18 · TypeScript · Vite · plain CSS. Fonts via Fontsource: Inter, Roboto, Roboto Slab and Roboto Mono.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run lint
```

## What's in it

- **Overview** — KPI strip, Component Usage chart (Yearly / Quarterly / Monthly / Weekly, with hover tooltips), Country Breakdown with animated meters and a "View all" panel, and the Recent Activity table.
- **Recent Activity** — search, status filter, sortable columns, per-row actions (details, copy ID, set status, delete with undo) and an export dialog (CSV / JSON, rows, columns, file name).
- **Shell** — collapsible sidebar (drawer on mobile), hash routing (`#overview`, `#projects`, …), ⌘K / Ctrl+K command palette, notifications panel, profile menu, and "Coming soon" pages for sections not built yet.

Layout: full width on desktop, 2×2 KPIs under 1100px, stacked cards under 960px, sidebar drawer under 900px.

## Data

All data is sample data in `src/data.ts` and `src/components/UsageChart.tsx`; nothing persists across reloads yet. The profile identity in `src/components/ProfileMenu.tsx` is a placeholder.

## Project layout

```
src/
  App.tsx            app shell, routing, sidebar state
  components/        cards, menus, dialogs, icons
  data.ts            sample data
  nav.ts             routes + sidebar geometry
  events.ts          small app-wide event channel (palette, toasts)
  styles.css         all styles; design tokens at the top
```
