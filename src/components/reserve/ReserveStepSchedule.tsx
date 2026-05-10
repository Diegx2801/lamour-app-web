type ReserveStepScheduleProps = {
  date: string
  time: string
  today: string
  timeSlots: string[]
  availableSlots: string[]
  loadingSlots: boolean
  hasSelectedService: boolean
  isSunday: (dateString: string) => boolean
  onDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onTimeSelect: (slot: string) => void
}

function ReserveStepSchedule({
  date,
  time,
  today,
  timeSlots,
  availableSlots,
  loadingSlots,
  hasSelectedService,
  isSunday,
  onDateChange,
  onTimeSelect,
}: ReserveStepScheduleProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <div>
          <label
            htmlFor="reserve-date"
            className="mb-2 block text-sm font-medium text-stone-800"
          >
            Fecha *
          </label>

          <input
            id="reserve-date"
            type="date"
            name="date"
            min={today}
            value={date}
            onChange={onDateChange}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 text-base outline-none focus:border-stone-600"
          />
        </div>

        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
          <p className="font-semibold text-stone-900">Atención</p>
          <p className="mt-1">Lunes a sábado: 9:00 am - 7:00 pm</p>
          <p className="font-medium text-red-600">Domingo cerrado</p>
        </div>
      </div>

      {date && isSunday(date) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No atendemos domingos. Selecciona otra fecha.
        </div>
      )}

      <div>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="block text-sm font-semibold text-stone-900">
              Elige una hora *
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Toca un horario disponible para continuar.
            </p>
          </div>
        </div>

        {!hasSelectedService ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-4 text-sm text-stone-500">
            Primero selecciona un servicio.
          </div>
        ) : !date ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-4 text-sm text-stone-500">
            Primero selecciona una fecha.
          </div>
        ) : loadingSlots ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-4 text-sm text-stone-500">
            Cargando horarios...
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {timeSlots.map((slot) => {
              const isAvailable = availableSlots.includes(slot)
              const isSelected = time === slot

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={!isAvailable || isSunday(date)}
                  onClick={() => onTimeSelect(slot)}
                  className={`min-h-14 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                    isSelected
                      ? "border-stone-950 bg-stone-950 text-white shadow-sm"
                      : isAvailable && !isSunday(date)
                      ? "border-stone-300 bg-white text-stone-900 hover:border-stone-600"
                      : "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400"
                  }`}
                >
                  <span className="block">{slot}</span>
                  {!isAvailable || isSunday(date) ? (
                    <span className="mt-0.5 block text-[10px] font-medium">
                      Ocupado
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}

        {!loadingSlots &&
          date &&
          !isSunday(date) &&
          availableSlots.length === 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              No quedan horarios disponibles para esa fecha.
            </div>
          )}
      </div>
    </div>
  )
}

export default ReserveStepSchedule
