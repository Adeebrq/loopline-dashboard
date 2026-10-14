export function Trend({
  dir,
  change,
  note,
  className = '',
}: {
  dir: 'up' | 'down'
  change: string
  note: string
  className?: string
}) {
  return (
    <p className={`trend ink ${className}`}>
      <span className="trend__change">{`${dir === 'up' ? '↑' : '↓'} ${change}`}</span>
      <span className="trend__note">{note}</span>
    </p>
  )
}
