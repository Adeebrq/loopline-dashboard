import type { Route } from '../nav'

export function ComingSoon({ route }: { route: Route }) {
  const { Icon, label } = route
  return (
    <section className="card soon" aria-labelledby="soon-title">
      <div className="soon__badge">
        <Icon />
      </div>
      <h2 id="soon-title" className="soon__title">
        {label}
      </h2>
      <span className="glass soon__pill">Coming soon</span>
      <p className="soon__text">
        We’re still building this page. Head back to the overview for the latest delivery numbers.
      </p>
      <a className="btn soon__back" href="#overview">
        <span className="btn__label">Back to Overview</span>
      </a>
    </section>
  )
}
