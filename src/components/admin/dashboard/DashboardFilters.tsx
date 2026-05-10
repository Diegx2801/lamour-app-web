type DashboardFiltersProps = {
  rangeStart: string
  rangeEnd: string
  onRangeStartChange: (value: string) => void
  onRangeEndChange: (value: string) => void
  onLastDaysRange: (days: number) => void
  onDownloadPdfReport: () => void
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = `dashboard-${label.toLowerCase()}`

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-stone-600">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500"
      />
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  variant,
}: {
  children: string
  onClick: () => void
  variant: "primary" | "secondary"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition md:w-auto ${
        variant === "primary"
          ? "bg-stone-950 text-white hover:bg-stone-800"
          : "border border-stone-300 text-stone-700 hover:bg-stone-50"
      }`}
    >
      {children}
    </button>
  )
}

function DashboardFilters({
  rangeStart,
  rangeEnd,
  onRangeStartChange,
  onRangeEndChange,
  onLastDaysRange,
  onDownloadPdfReport,
}: DashboardFiltersProps) {
  return (
    <div className="mb-5 rounded-[1.5rem] bg-white p-4 shadow-sm md:mb-6 md:rounded-[2rem] md:p-5">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end">
        <DateInput
          label="Desde"
          value={rangeStart}
          onChange={onRangeStartChange}
        />

        <DateInput label="Hasta" value={rangeEnd} onChange={onRangeEndChange} />

        <ActionButton onClick={() => onLastDaysRange(7)} variant="secondary">
          Últimos 7 días
        </ActionButton>

        <ActionButton onClick={() => onLastDaysRange(30)} variant="secondary">
          Últimos 30 días
        </ActionButton>

        <ActionButton onClick={onDownloadPdfReport} variant="primary">
          Descargar PDF
        </ActionButton>
      </div>
    </div>
  )
}

export default DashboardFilters
