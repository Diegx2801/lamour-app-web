export function StatusLegend({
  label,
  className,
}: {
  label: string
  className: string
}) {
  return (
    <span className={`min-w-fit rounded-full px-3 py-1 font-medium ${className}`}>
      {label}
    </span>
  )
}

export function BlockedBox({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {label}
    </div>
  )
}

export function AgendaActionButton({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg bg-white/80 px-3 py-2 text-xs font-medium ${className}`}
    >
      {label}
    </button>
  )
}
