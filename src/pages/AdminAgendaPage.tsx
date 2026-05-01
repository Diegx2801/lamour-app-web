import { Link } from "react-router"
import { timeSlots } from "../data/timeSlots"
import {
  type AgendaClientRelation,
  type AgendaReservation,
  type AgendaServiceRelation,
  useAdminAgenda,
} from "../features/admin-agenda/hooks/useAdminAgenda"

function normalizeTime(time: string | null | undefined) {
  return String(time ?? "").slice(0, 5)
}

function getClientData(clients: AgendaClientRelation) {
  if (!clients) return null
  return Array.isArray(clients) ? clients[0] ?? null : clients
}

function getServiceData(services: AgendaServiceRelation) {
  if (!services) return null
  return Array.isArray(services) ? services[0] ?? null : services
}

function getStatusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "border-green-200 bg-green-50 text-green-800"
    case "completed":
      return "border-blue-200 bg-blue-50 text-blue-800"
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-800"
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-800"
    case "no_show":
      return "border-stone-300 bg-stone-100 text-stone-700"
    default:
      return "border-stone-200 bg-white text-stone-700"
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return "Confirmada"
    case "completed":
      return "Completada"
    case "cancelled":
      return "Cancelada"
    case "pending":
      return "Pendiente"
    case "no_show":
      return "No show"
    default:
      return status
  }
}

function getOccupancyBadgeClasses(occupied: number, capacity: number) {
  if (occupied >= capacity) return "bg-red-100 text-red-700"
  if (occupied > 0) return "bg-amber-100 text-amber-700"
  return "bg-green-100 text-green-700"
}

function getDisplayDuration(reservation: AgendaReservation) {
  const service = getServiceData(reservation.services)

  if (service?.category === "Pestañas") return "120 min"

  return service?.duration_minutes
    ? `${service.duration_minutes} min`
    : "No definida"
}

function AdminAgendaPage() {
  const agenda = useAdminAgenda()
  const lashCapacity = 2

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-stone-500">
              Panel administrativo
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-950">
              Agenda tipo calendario
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Visualiza reservas, disponibilidad y bloqueos por horario.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!agenda.isFullDayBlocked ? (
              <button
                type="button"
                onClick={agenda.handleBlockFullDay}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-600"
              >
                Bloquear día
              </button>
            ) : (
              <button
                type="button"
                onClick={agenda.handleUnblockFullDay}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
              >
                Desbloquear día
              </button>
            )}

            <Link
              to="/admin/reservas"
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Ver reservas
            </Link>

            <Link
              to="/admin/dashboard"
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-stone-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <label className="text-sm font-medium text-stone-700">
                Fecha de agenda
              </label>
              <input
                type="date"
                value={agenda.selectedDate}
                onChange={(event) => agenda.setSelectedDate(event.target.value)}
                className="mt-2 block rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-stone-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">
                Filtrar por lashista
              </label>
              <select
                value={agenda.selectedLashistId}
                onChange={(event) =>
                  agenda.setSelectedLashistId(event.target.value)
                }
                disabled={agenda.loadingLashists}
                className="mt-2 block rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-stone-500 disabled:bg-stone-100"
              >
                <option value="">
                  {agenda.loadingLashists ? "Cargando lashistas..." : "Todas"}
                </option>

                {agenda.lashists.map((lashist) => (
                  <option key={lashist.id} value={lashist.id}>
                    {lashist.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                Pendiente
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
                Confirmada
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
                Completada
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-700">
                Cancelada
              </span>
            </div>
          </div>

          {agenda.selectedLashist ? (
            <p className="mt-4 rounded-2xl bg-stone-100 px-4 py-2 text-sm text-stone-700">
              Mostrando solo reservas de{" "}
              <span className="font-semibold">
                {agenda.selectedLashist.name}
              </span>
            </p>
          ) : null}
        </div>

        {agenda.isFullDayBlocked && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">
              Este día está completamente bloqueado.
            </p>

            {agenda.fullDayBlock?.reason ? (
              <p className="mt-1 text-sm">
                Motivo: {agenda.fullDayBlock.reason}
              </p>
            ) : null}
          </div>
        )}

        {agenda.loading && <p className="text-stone-600">Cargando agenda...</p>}

        {agenda.error && <p className="text-red-500">{agenda.error}</p>}

        {!agenda.loading && (
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="grid grid-cols-[110px_1fr] border-b border-stone-200 bg-stone-50">
              <div className="border-r border-stone-200 px-4 py-3 text-sm font-semibold text-stone-600">
                Hora
              </div>
              <div className="px-4 py-3 text-sm font-semibold text-stone-600">
                Reservas / disponibilidad
              </div>
            </div>

            <div>
              {timeSlots.map((slot) => {
                const slotReservations = agenda.reservationsByTime[slot] ?? []
                const isBlocked = agenda.blockedTimes.includes(slot)
                const lashOccupied = agenda.getLashOccupancy(slot)

                return (
                  <div
                    key={slot}
                    className="grid grid-cols-[110px_1fr] border-b border-stone-100 last:border-b-0"
                  >
                    <div className="border-r border-stone-100 bg-stone-50/70 px-4 py-5">
                      <p className="font-semibold text-stone-900">{slot}</p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${getOccupancyBadgeClasses(
                          lashOccupied,
                          lashCapacity
                        )}`}
                      >
                        {lashOccupied >= lashCapacity
                          ? "FULL"
                          : `${lashOccupied}/${lashCapacity}`}
                      </span>
                    </div>

                    <div className="min-h-[110px] px-4 py-4">
                      {agenda.isFullDayBlocked ? (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                          Día bloqueado
                        </div>
                      ) : isBlocked ? (
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                          <p className="text-sm font-medium text-red-700">
                            Horario bloqueado manualmente
                          </p>

                          <button
                            type="button"
                            onClick={() => agenda.handleUnblock(slot)}
                            className="rounded-lg bg-white px-3 py-1 text-xs font-medium text-green-700"
                          >
                            Desbloquear
                          </button>
                        </div>
                      ) : slotReservations.length > 0 ? (
                        <div className="grid gap-3 lg:grid-cols-2">
                          {slotReservations.map((reservation) => {
                            const client = getClientData(reservation.clients)
                            const service = getServiceData(
                              reservation.services
                            )

                            return (
                              <div
                                key={reservation.id}
                                className={`rounded-2xl border p-4 shadow-sm ${getStatusClasses(
                                  reservation.status
                                )}`}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold">
                                      {client?.full_name ?? "Sin nombre"}
                                    </p>

                                    <p className="mt-1 text-sm">
                                      {service?.name ?? "Sin servicio"}
                                    </p>

                                    <p className="mt-1 text-xs opacity-80">
                                      {service?.category ?? "Sin categoría"} ·{" "}
                                      {getDisplayDuration(reservation)}
                                    </p>
                                  </div>

                                  <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold">
                                    {getStatusBadge(reservation.status)}
                                  </span>
                                </div>

                                <div className="mt-3 grid gap-1 text-xs opacity-80 sm:grid-cols-2">
                                  <p>Tel: {client?.phone ?? "Sin teléfono"}</p>
                                  <p>
                                    Lashista:{" "}
                                    {reservation.lashista ?? "Sin asignar"}
                                  </p>
                                  <p>Hora: {normalizeTime(reservation.time)}</p>
                                </div>

                                {reservation.notes ? (
                                  <p className="mt-3 text-xs opacity-80">
                                    Nota: {reservation.notes}
                                  </p>
                                ) : null}

                                <div className="mt-4 flex flex-wrap gap-2">
                                  {reservation.status !== "confirmed" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        agenda.updateStatus(
                                          reservation.id,
                                          "confirmed"
                                        )
                                      }
                                      className="rounded-lg bg-white/80 px-2 py-1 text-xs font-medium text-green-700"
                                    >
                                      Confirmar
                                    </button>
                                  )}

                                  {reservation.status !== "completed" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        agenda.updateStatus(
                                          reservation.id,
                                          "completed"
                                        )
                                      }
                                      className="rounded-lg bg-white/80 px-2 py-1 text-xs font-medium text-blue-700"
                                    >
                                      Completar
                                    </button>
                                  )}

                                  {reservation.status !== "cancelled" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        agenda.updateStatus(
                                          reservation.id,
                                          "cancelled"
                                        )
                                      }
                                      className="rounded-lg bg-white/80 px-2 py-1 text-xs font-medium text-red-700"
                                    >
                                      Cancelar
                                    </button>
                                  )}

                                  <Link
                                    to={`/admin/reservas/${reservation.id}`}
                                    className="rounded-lg bg-white/80 px-2 py-1 text-xs font-medium text-stone-700"
                                  >
                                    Editar
                                  </Link>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex h-full min-h-[80px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 px-4 py-3">
                          <p className="text-sm font-medium text-stone-400">
                            Disponible
                          </p>

                          <button
                            type="button"
                            onClick={() => agenda.handleBlock(slot)}
                            className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600"
                          >
                            Bloquear
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAgendaPage