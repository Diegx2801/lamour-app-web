type WeekReservation = {
  id: string
  date: string
  status: string
  remaining_amount: number | null
}

type AgendaWeekSummaryProps = {
  selectedDate: string
  weekReservations: WeekReservation[]
  weekStart: string
  onDateChange: (date: string) => void
}

const dayLabels = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]

function AgendaWeekSummary({
  selectedDate,
  weekReservations,
  weekStart,
  onDateChange,
}: AgendaWeekSummaryProps) {
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(`${weekStart}T12:00:00`)
    date.setDate(date.getDate() + index)
    return date.toISOString().slice(0, 10)
  })

  return (
    <div className="mb-4 rounded-[1.5rem] border border-stone-200 bg-white p-3 shadow-sm md:mb-5 md:rounded-3xl md:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-stone-950">Semana</h2>
        <p className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
          {weekReservations.length} citas
        </p>
      </div>

      <div className="-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 md:mx-0 md:grid md:grid-cols-7 md:overflow-visible md:px-0 md:pb-0">
        {days.map((date, index) => {
          const dayReservations = weekReservations.filter(
            (item) => item.date === date
          )
          const pending = dayReservations.filter(
            (item) => item.status === "pending"
          ).length
          const pendingBalance = dayReservations.reduce(
            (acc, item) => acc + Number(item.remaining_amount ?? 0),
            0
          )
          const isActive = selectedDate === date

          return (
            <button
              key={date}
              type="button"
              onClick={() => onDateChange(date)}
              className={`min-w-[105px] snap-start rounded-2xl border px-3 py-3 text-left transition md:min-w-0 ${
                isActive
                  ? "border-stone-950 bg-stone-950 text-white"
                  : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold">{dayLabels[index]}</p>
                {pending > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    {pending}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-lg font-semibold">
                {dayReservations.length}
              </p>
              <p className="text-[11px] opacity-70">citas</p>
              {pendingBalance > 0 ? (
                <p className="mt-1 truncate text-[11px] font-semibold opacity-85">
                  S/ {pendingBalance.toFixed(2)}
                </p>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AgendaWeekSummary
