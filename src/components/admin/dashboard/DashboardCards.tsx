export function MetricCard({
  title,
  value,
  highlight = false,
  danger = false,
}: {
  title: string
  value: string | number
  highlight?: boolean
  danger?: boolean
}) {
  return (
    <div
      className={`rounded-[1.35rem] p-4 shadow-sm md:rounded-[2rem] md:p-6 ${
        highlight
          ? "bg-stone-950 text-white"
          : danger
          ? "border border-red-100 bg-red-50"
          : "bg-white"
      }`}
    >
      <p
        className={`text-xs md:text-sm ${
          highlight ? "text-stone-300" : danger ? "text-red-600" : "text-stone-500"
        }`}
      >
        {title}
      </p>

      <h2
        className={`mt-2 text-xl font-semibold md:mt-3 md:text-3xl ${
          highlight ? "text-white" : danger ? "text-red-800" : "text-stone-950"
        }`}
      >
        {value}
      </h2>
    </div>
  )
}

export function SmallMetricCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-stone-500">{title}</p>
      <p className="mt-2 text-xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}
