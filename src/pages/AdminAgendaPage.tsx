import { Link } from "react-router"
import { timeSlots } from "../data/timeSlots"
import {
  buildWhatsappPhone,
  isNoShowCandidate,
  isReminderCandidate,
} from "../features/reservations/utils/appointmentStatus"
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

function formatMoney(value: number | null | undefined) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`
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

function getPaymentBadge(reservation: AgendaReservation) {
  const remaining = Number(reservation.remaining_amount ?? 0)

  if (remaining <= 0) {
    return {
      label: "Pagado",
      className: "bg-green-100 text-green-700",
    }
  }

  return {
    label: `Saldo ${formatMoney(remaining)}`,
    className: "bg-red-100 text-red-700",
  }
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
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-stone-500">
            Panel administrativo
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Agenda
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Visualiza reservas, disponibilidad y bloqueos por horario.
          </p>
        </div>

        {!agenda.isFullDayBlocked ? (
          <button
            type="button"
            onClick={agenda.handleBlockFullDay}
            className="w-full rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-red-600 md:w-auto"
          >
            Bloquear día
          </button>
        ) : (
          <button
            type="button"
            onClick={agenda.handleUnblockFullDay}
            className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 md:w-auto"
          >
            Desbloquear día
          </button>
        )}
      </div>

      <div className="mb-5 rounded-[1.5rem] border border-stone-200 bg-white/80 p-4 shadow-sm backdrop-blur md:mb-6 md:rounded-3xl md:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <div>
            <label className="text-sm font-medium text-stone-700">
              Fecha de agenda
            </label>

            <input
              type="date"
              value={agenda.selectedDate}
              onChange={(event) => agenda.setSelectedDate(event.target.value)}
              className="mt-2 block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
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
              className="mt-2 block w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500 disabled:bg-stone-100"
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

          <div className="flex gap-2 overflow-x-auto pb-1 text-xs md:flex-wrap md:overflow-visible md:pb-0">
            <StatusLegend
              label="Pendiente"
              className="bg-amber-100 text-amber-700"
            />
            <StatusLegend
              label="Confirmada"
              className="bg-green-100 text-green-700"
            />
            <StatusLegend
              label="Completada"
              className="bg-blue-100 text-blue-700"
            />
            <StatusLegend
              label="Cancelada"
              className="bg-red-100 text-red-700"
            />
            <StatusLegend
              label="No show"
              className="bg-stone-200 text-stone-700"
            />
          </div>
        </div>

        {agenda.selectedLashist ? (
          <p className="mt-4 rounded-2xl bg-stone-100 px-4 py-2 text-sm text-stone-700">
            Mostrando solo reservas de{" "}
            <span className="font-semibold">{agenda.selectedLashist.name}</span>
          </p>
        ) : null}
      </div>

      {agenda.isFullDayBlocked && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 md:mb-6">
          <p className="font-semibold">Este día está completamente bloqueado.</p>

          {agenda.fullDayBlock?.reason ? (
            <p className="mt-1 text-sm">Motivo: {agenda.fullDayBlock.reason}</p>
          ) : null}
        </div>
      )}

      {agenda.loading && (
        <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-600 shadow-sm">
          Cargando agenda...
        </div>
      )}

      {agenda.error && (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {agenda.error}
        </div>
      )}

      {!agenda.loading && (
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm md:rounded-3xl">
          <div className="grid grid-cols-[82px_1fr] border-b border-stone-200 bg-stone-50 md:grid-cols-[110px_1fr]">
            <div className="border-r border-stone-200 px-3 py-3 text-xs font-semibold text-stone-600 md:px-4 md:text-sm">
              Hora
            </div>

            <div className="px-3 py-3 text-xs font-semibold text-stone-600 md:px-4 md:text-sm">
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
                  className="grid grid-cols-[82px_1fr] border-b border-stone-100 last:border-b-0 md:grid-cols-[110px_1fr]"
                >
                  <div className="border-r border-stone-100 bg-stone-50/70 px-3 py-4 md:px-4 md:py-5">
                    <p className="text-sm font-semibold text-stone-900 md:text-base">
                      {slot}
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-medium md:text-[11px] ${getOccupancyBadgeClasses(
                        lashOccupied,
                        lashCapacity
                      )}`}
                    >
                      {lashOccupied >= lashCapacity
                        ? "FULL"
                        : `${lashOccupied}/${lashCapacity}`}
                    </span>
                  </div>

                  <div className="min-h-[96px] px-3 py-3 md:min-h-[110px] md:px-4 md:py-4">
                    {agenda.isFullDayBlocked ? (
                      <BlockedBox label="Día bloqueado" />
                    ) : isBlocked ? (
                      <div className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-sm font-medium text-red-700">
                          Horario bloqueado manualmente
                        </p>

                        <button
                          type="button"
                          onClick={() => agenda.handleUnblock(slot)}
                          className="w-full rounded-lg bg-white px-3 py-2 text-xs font-medium text-green-700 md:w-auto"
                        >
                          Desbloquear
                        </button>
                      </div>
                    ) : slotReservations.length > 0 ? (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {slotReservations.map((reservation) => {
                          const client = getClientData(reservation.clients)
                          const service = getServiceData(reservation.services)

                          const showNoShowButton = isNoShowCandidate(
                            reservation.date,
                            reservation.time,
                            reservation.status
                          )

                          const showReminderButton = isReminderCandidate(
                            reservation.date,
                            reservation.time,
                            reservation.status
                          )

                          return (
                            <div
                              key={reservation.id}
                              className={`rounded-2xl border p-3 shadow-sm md:p-4 ${getStatusClasses(
                                reservation.status
                              )}`}
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
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

                                <span className="w-fit rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold">
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

                              <PaymentSummary reservation={reservation} />

                              {reservation.notes ? (
                                <p className="mt-3 text-xs opacity-80">
                                  Nota: {reservation.notes}
                                </p>
                              ) : null}

                              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                                {reservation.status !== "confirmed" && (
                                  <AgendaActionButton
                                    label="Confirmar"
                                    onClick={() =>
                                      agenda.updateStatus(
                                        reservation.id,
                                        "confirmed"
                                      )
                                    }
                                    className="text-green-700"
                                  />
                                )}

                                {reservation.status !== "completed" && (
                                  <AgendaActionButton
                                    label="Completar"
                                    onClick={() =>
                                      agenda.updateStatus(
                                        reservation.id,
                                        "completed"
                                      )
                                    }
                                    className="text-blue-700"
                                  />
                                )}

                                {showNoShowButton && (
                                  <AgendaActionButton
                                    label="No asistió"
                                    onClick={() =>
                                      agenda.updateStatus(
                                        reservation.id,
                                        "no_show"
                                      )
                                    }
                                    className="text-stone-700"
                                  />
                                )}

                                {showReminderButton && client?.phone ? (
  <AgendaActionButton
    label="Recordar"
    onClick={() => {
      const message = `Hola ${client.full_name ?? ""}, te recordamos tu cita en L'AMOUR Beauty Studio.

Servicio: ${service?.name ?? "Servicio reservado"}
Fecha: ${reservation.date}
Hora: ${normalizeTime(reservation.time)}

Por favor confirma tu asistencia.`

      const phone = buildWhatsappPhone(client.phone ?? "")
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

      window.open(url, "_blank")
    }}
    className="text-purple-700"
  />
) : null}

                                {reservation.status !== "cancelled" && (
                                  <AgendaActionButton
                                    label="Cancelar"
                                    onClick={() =>
                                      agenda.updateStatus(
                                        reservation.id,
                                        "cancelled"
                                      )
                                    }
                                    className="text-red-700"
                                  />
                                )}

                                <Link
                                  to={`/admin/pagos/${reservation.id}`}
                                  className="rounded-lg bg-white/80 px-3 py-2 text-center text-xs font-medium text-stone-700"
                                >
                                  Pago
                                </Link>

                                <Link
                                  to={`/admin/reservas/${reservation.id}`}
                                  className="rounded-lg bg-white/80 px-3 py-2 text-center text-xs font-medium text-stone-700"
                                >
                                  Editar
                                </Link>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-[72px] flex-col gap-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 px-4 py-3 md:min-h-[80px] md:flex-row md:items-center md:justify-between">
                        <p className="text-sm font-medium text-stone-400">
                          Disponible
                        </p>

                        <button
                          type="button"
                          onClick={() => agenda.handleBlock(slot)}
                          className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 md:w-auto"
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
  )
}

function PaymentSummary({ reservation }: { reservation: AgendaReservation }) {
  const badge = getPaymentBadge(reservation)

  return (
    <div className="mt-3 rounded-2xl bg-white/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
          Pago
        </p>

        <span
          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="opacity-60">Total</p>
          <p className="mt-0.5 font-semibold">
            {formatMoney(reservation.total_price)}
          </p>
        </div>

        <div>
          <p className="opacity-60">Abono</p>
          <p className="mt-0.5 font-semibold">
            {formatMoney(reservation.deposit_amount)}
          </p>
        </div>

        <div>
          <p className="opacity-60">Saldo</p>
          <p className="mt-0.5 font-semibold">
            {formatMoney(reservation.remaining_amount)}
          </p>
        </div>
      </div>

      {reservation.appointment_type === "retouch" && (
        <p className="mt-2 w-fit rounded-full bg-purple-100 px-2 py-1 text-[11px] font-semibold text-purple-700">
          Retoque
        </p>
      )}
    </div>
  )
}

function StatusLegend({
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

function BlockedBox({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {label}
    </div>
  )
}

function AgendaActionButton({
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

export default AdminAgendaPage