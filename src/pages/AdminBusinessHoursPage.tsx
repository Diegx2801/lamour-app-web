import { useBusinessHours } from "../features/business-hours/hooks/useBusinessHours"
import { formatBusinessHour } from "../features/business-hours/utils/businessHoursUtils"

function AdminBusinessHoursPage() {
  const hours = useBusinessHours()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Configuración
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Horarios de atención
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Estos horarios alimentan la web, la agenda y los horarios
            disponibles de reserva.
          </p>
        </div>

        <button
          type="button"
          onClick={hours.reload}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Actualizar
        </button>
      </div>

      {hours.loading ? (
        <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-500 shadow-sm">
          Cargando horarios...
        </div>
      ) : (
        <div className="grid gap-3">
          {hours.businessHours.map((hour) => (
            <article
              key={hour.day_of_week}
              className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5"
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_160px_140px] lg:items-end">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    {formatBusinessHour(hour)}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-stone-950">
                    {hour.day_label}
                  </h2>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-stone-600">
                    Apertura
                  </span>
                  <input
                    type="time"
                    value={hour.open_time ?? ""}
                    disabled={hour.is_closed}
                    onChange={(event) =>
                      hours.updateLocalHour(hour.day_of_week, {
                        open_time: event.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-600 disabled:bg-stone-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-stone-600">
                    Cierre
                  </span>
                  <input
                    type="time"
                    value={hour.close_time ?? ""}
                    disabled={hour.is_closed}
                    onChange={(event) =>
                      hours.updateLocalHour(hour.day_of_week, {
                        close_time: event.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-600 disabled:bg-stone-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium text-stone-600">
                    Intervalo
                  </span>
                  <select
                    value={hour.slot_interval_minutes}
                    disabled={hour.is_closed}
                    onChange={(event) =>
                      hours.updateLocalHour(hour.day_of_week, {
                        slot_interval_minutes: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-600 disabled:bg-stone-100"
                  >
                    <option value={30}>30 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                  <label className="flex min-h-11 items-center gap-2 rounded-2xl bg-stone-50 px-3 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={hour.is_closed}
                      onChange={(event) =>
                        hours.updateLocalHour(hour.day_of_week, {
                          is_closed: event.target.checked,
                        })
                      }
                    />
                    Cerrado
                  </label>

                  <button
                    type="button"
                    onClick={() => hours.saveHour(hour)}
                    disabled={hours.savingId === (hour.id ?? hour.day_of_week)}
                    className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
                  >
                    {hours.savingId === (hour.id ?? hour.day_of_week)
                      ? "Guardando..."
                      : "Guardar"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminBusinessHoursPage
