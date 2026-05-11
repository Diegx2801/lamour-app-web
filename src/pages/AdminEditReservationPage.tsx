import { Link } from "react-router"
import { isSunday } from "../features/reservations/utils/reservationUtils"
import { useAdminEditReservation } from "../features/admin-reservations/hooks/useAdminEditReservation"

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:bg-stone-100 disabled:text-stone-500"

function AdminEditReservationPage() {
  const reservation = useAdminEditReservation()

  if (reservation.loading) {
    return (
      <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 text-sm text-stone-600 shadow-sm md:rounded-[2rem] md:p-8">
        Cargando reserva...
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/reservas"
          className="text-sm font-medium text-stone-600 transition hover:text-stone-950"
        >
          ← Volver a reservas
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-stone-950 md:text-4xl">
          Editar reserva
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Actualiza fecha, hora, estado, lashista y observaciones.
        </p>
      </div>

      <form
        onSubmit={reservation.handleSubmit}
        className="mx-auto max-w-2xl space-y-4 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] md:p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Fecha *">
            <input
              type="date"
              name="date"
              value={reservation.form.date}
              onChange={reservation.handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Hora *">
            <select
              name="time"
              value={reservation.form.time}
              onChange={reservation.handleChange}
              disabled={
                reservation.loadingSlots ||
                isSunday(reservation.form.date) ||
                !!reservation.blockedReason
              }
              className={inputClass}
            >
              <option value="">
                {reservation.loadingSlots
                  ? "Cargando horarios..."
                  : isSunday(reservation.form.date)
                    ? "Domingo no disponible"
                    : reservation.blockedReason
                      ? "Día bloqueado"
                      : reservation.availableSlots.length === 0
                        ? "No hay horarios disponibles"
                        : "Selecciona una hora"}
              </option>

              {reservation.availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {reservation.form.date && isSunday(reservation.form.date) && (
          <AlertMessage message="No se atiende domingos." />
        )}

        {reservation.blockedReason && !isSunday(reservation.form.date) && (
          <AlertMessage message={reservation.blockedReason} />
        )}

        <Field label="Estado *">
          <select
            name="status"
            value={reservation.form.status}
            onChange={reservation.handleChange}
            className={inputClass}
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option
              value="completed"
              disabled={reservation.remainingAmount > 0}
            >
              Completada
            </option>
            <option value="cancelled">Cancelada</option>
            <option value="no_show">No show</option>
          </select>
        </Field>

        {reservation.remainingAmount > 0 && (
          <AlertMessage message="Para marcar como completada, primero registra el saldo pendiente en pagos." />
        )}

        <Field label="Lashista">
          <select
            name="lashistId"
            value={reservation.form.lashistId}
            onChange={reservation.handleChange}
            className={inputClass}
          >
            <option value="">Sin asignar</option>

            {reservation.lashists.map((lashist) => (
              <option key={lashist.id} value={lashist.id}>
                {lashist.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Observaciones">
          <textarea
            rows={4}
            name="notes"
            value={reservation.form.notes}
            onChange={reservation.handleChange}
            placeholder="Escribe algún detalle adicional"
            className={`${inputClass} resize-none`}
          />
        </Field>

        {reservation.error && <AlertMessage message={reservation.error} />}

        <button
          type="submit"
          disabled={reservation.saving}
          className="w-full rounded-xl bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {reservation.saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <section className="mx-auto mt-6 max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-lg font-semibold text-stone-950">
          Historial de cambios
        </h2>

        {reservation.auditLogs.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">
            Aún no hay cambios registrados para esta cita.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {reservation.auditLogs.map((log) => (
              <article
                key={log.id}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-stone-950">
                    {getAuditLabel(log.action)}
                  </p>
                  <p className="text-xs text-stone-500">
                    {new Date(log.created_at).toLocaleString("es-PE")}
                  </p>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  {log.actor_email ?? "Usuario no registrado"}
                </p>
                <p className="mt-2 text-xs text-stone-600">
                  {formatAuditDetails(log.details)}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function getAuditLabel(action: string) {
  switch (action) {
    case "status_updated":
      return "Estado actualizado"
    case "reservation_updated":
      return "Reserva editada"
    case "payment_registered":
      return "Pago registrado"
    default:
      return action
  }
}

function formatAuditDetails(details: Record<string, unknown> | null) {
  if (!details) return "Sin detalle."

  if ("newStatus" in details) {
    return `Estado: ${String(details.previousStatus ?? "-")} → ${String(
      details.newStatus ?? "-"
    )}`
  }

  if ("paymentAmount" in details) {
    return `Monto: S/ ${Number(details.paymentAmount ?? 0).toFixed(2)} · Tipo: ${String(
      details.paymentType ?? "-"
    )}`
  }

  return "Cambio registrado."
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-800">
        {label}
      </span>
      {children}
    </label>
  )
}

function AlertMessage({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </p>
  )
}

export default AdminEditReservationPage
