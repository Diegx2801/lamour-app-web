export function MetricCard({
  title,
  value,
  description,
  highlight = false,
  danger = false,
  accent = "stone",
}: {
  title: string
  value: string | number
  description?: string
  highlight?: boolean
  danger?: boolean
  accent?: "stone" | "green" | "blue" | "amber" | "red"
}) {
  const accentClasses = {
    stone: "bg-stone-100 text-stone-700",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  }

  return (
    <div
      className={`rounded-[1.35rem] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:rounded-[1.75rem] md:p-5 ${
        highlight
          ? "border-stone-950 bg-stone-950 text-white"
          : danger
            ? "border-red-100 bg-red-50"
            : "border-stone-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <p
          className={`text-xs font-medium md:text-sm ${
            highlight ? "text-stone-300" : danger ? "text-red-600" : "text-stone-500"
          }`}
        >
          {title}
        </p>
        <span
          className={`h-9 w-9 rounded-2xl ${
            highlight ? "bg-white/10" : danger ? accentClasses.red : accentClasses[accent]
          }`}
        />
      </div>

      <h2
        className={`text-2xl font-semibold tracking-tight md:text-3xl ${
          highlight ? "text-white" : danger ? "text-red-800" : "text-stone-950"
        }`}
      >
        {value}
      </h2>

      {description && (
        <p
          className={`mt-2 text-xs leading-5 ${
            highlight ? "text-stone-300" : danger ? "text-red-600" : "text-stone-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  )
}

export function SmallMetricCard({
  title,
  value,
  description,
}: {
  title: string
  value: string | number
  description?: string
}) {
  return (
    <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-stone-500">{title}</p>
      <p className="mt-2 text-xl font-semibold text-stone-950">{value}</p>
      {description && <p className="mt-1 text-xs text-stone-500">{description}</p>}
    </div>
  )
}
