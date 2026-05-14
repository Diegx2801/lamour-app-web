import type { AgendaLashistRow } from "../../../features/admin-agenda/api/adminAgendaService"
import { StatusLegend } from "./AgendaShared"

type AgendaFiltersProps = {
  selectedDate: string
  selectedLashistId: string
  selectedLashistName: string | null
  lashists: AgendaLashistRow[]
  loadingLashists: boolean
  noticeState?: {
    lashist: AgendaLashistRow
    total: number
    lastSentAt: number
    changedAfterSend: number
  }[]
  onDateChange: (value: string) => void
  onLashistChange: (value: string) => void
  onSendWeek?: (lashistId: string) => void
}

function AgendaFilters({
  selectedDate,
  selectedLashistId,
  selectedLashistName,
  lashists,
  loadingLashists,
  noticeState = [],
  onDateChange,
  onLashistChange,
  onSendWeek,
}: AgendaFiltersProps) {
  const today = getLocalDateString()
  const tomorrow = getLocalDateString(1)

  return (
    <div className="mb-5 rounded-[1.5rem] border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur md:mb-6 md:rounded-3xl md:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <div>
          <label
            htmlFor="agenda-date"
            className="text-sm font-medium text-stone-700"
          >
            Fecha de agenda
          </label>

          <input
            id="agenda-date"
            type="date"
            value={selectedDate}
            onChange={(event) => onDateChange(event.target.value)}
            className="mt-2 block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
          />

          <div className="mt-2 flex gap-2">
            <QuickDateButton
              label="Hoy"
              active={selectedDate === today}
              onClick={() => onDateChange(today)}
            />
            <QuickDateButton
              label="Mañana"
              active={selectedDate === tomorrow}
              onClick={() => onDateChange(tomorrow)}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="agenda-lashist"
            className="text-sm font-medium text-stone-700"
          >
            Filtrar por lashista
          </label>

          <select
            id="agenda-lashist"
            value={selectedLashistId}
            onChange={(event) => onLashistChange(event.target.value)}
            disabled={loadingLashists}
            className="mt-2 block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500 disabled:bg-stone-100"
          >
            <option value="">
              {loadingLashists ? "Cargando lashistas..." : "Todas"}
            </option>

            {lashists.map((lashist) => (
              <option key={lashist.id} value={lashist.id}>
                {lashist.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 text-xs md:flex-wrap md:overflow-visible md:pb-0">
          <StatusLegend label="Pendiente" className="bg-amber-100 text-amber-700" />
          <StatusLegend label="Confirmada" className="bg-green-100 text-green-700" />
          <StatusLegend label="Completada" className="bg-blue-100 text-blue-700" />
          <StatusLegend label="Cancelada" className="bg-red-100 text-red-700" />
          <StatusLegend label="No show" className="bg-stone-200 text-stone-700" />
        </div>
      </div>

      {selectedLashistName ? (
        <p className="mt-4 rounded-2xl bg-stone-100 px-4 py-2 text-sm text-stone-700">
          Mostrando solo reservas de{" "}
          <span className="font-semibold">{selectedLashistName}</span>
        </p>
      ) : null}

      {noticeState.length > 0 && (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-stone-950">
                Aviso semanal a lashistas
              </p>
              <p className="text-xs text-stone-500">
                Envía por WhatsApp la agenda de la semana y revisa cambios nuevos.
              </p>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {noticeState.map((item) => (
              <div
                key={item.lashist.id}
                className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    {item.lashist.name}
                  </p>
                  <p className="text-xs text-stone-500">
                    {item.total} citas esta semana
                    {item.changedAfterSend > 0
                      ? ` · ${item.changedAfterSend} por avisar`
                      : " · sin cambios pendientes"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSendWeek?.(item.lashist.id)}
                  className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                >
                  WhatsApp
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getLocalDateString(daysToAdd = 0) {
  const date = new Date()
  date.setDate(date.getDate() + daysToAdd)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function QuickDateButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
        active
          ? "bg-stone-950 text-white"
          : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
      }`}
    >
      {label}
    </button>
  )
}

export default AgendaFilters
