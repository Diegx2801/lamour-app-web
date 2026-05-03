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
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
            <option value="no_show">No show</option>
          </select>
        </Field>

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
    </div>
  )
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