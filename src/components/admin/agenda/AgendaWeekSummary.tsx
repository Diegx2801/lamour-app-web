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

const dayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

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
    <div className="mb-5 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-stone-950">Esta semana</h2>
        <p className="text-xs text-stone-500">
          {weekReservations.length} citas
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
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
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                isActive
                  ? "border-stone-950 bg-stone-950 text-white"
                  : "border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-400"
              }`}
            >
              <p className="text-xs font-semibold">{dayLabels[index]}</p>
              <p className="mt-1 text-lg font-semibold">
                {dayReservations.length}
              </p>
              <p className="mt-1 text-[11px] opacity-75">
                {pending} pendientes
              </p>
              {pendingBalance > 0 ? (
                <p className="mt-1 text-[11px] font-semibold opacity-80">
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
