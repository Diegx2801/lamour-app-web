import { Link } from "react-router"
import { isSunday } from "../features/reservations/utils/reservationUtils"
import { useAdminEditReservation } from "../features/admin-reservations/hooks/useAdminEditReservation"

function AdminEditReservationPage() {
  const reservation = useAdminEditReservation()

  if (reservation.loading) {
    return (
      <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-sm">
          Cargando reserva...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin/reservas"
          className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
        >
          ← Volver a reservas
        </Link>

        <h1 className="mt-4 text-4xl font-semibold text-stone-950">
          Editar reserva
        </h1>

        <p className="mt-3 text-sm leading-7 text-stone-600">
          Actualiza fecha, hora, estado, lashista y observaciones.
        </p>

        <div className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm">
          <form className="grid gap-5" onSubmit={reservation.handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-800">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  value={reservation.form.date}
                  onChange={reservation.handleChange}
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-800">
                  Hora *
                </label>
                <select
                  name="time"
                  value={reservation.form.time}
                  onChange={reservation.handleChange}
                  disabled={
                    reservation.loadingSlots ||
                    isSunday(reservation.form.date) ||
                    !!reservation.blockedReason
                  }
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none disabled:bg-stone-100"
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
              </div>
            </div>

            {reservation.form.date && isSunday(reservation.form.date) && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                No se atiende domingos.
              </div>
            )}

            {reservation.blockedReason &&
              !isSunday(reservation.form.date) && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {reservation.blockedReason}
                </div>
              )}

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Estado *
              </label>
              <select
                name="status"
                value={reservation.form.status}
                onChange={reservation.handleChange}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
                <option value="no_show">No show</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Lashista
              </label>
              <select
                name="lashistId"
                value={reservation.form.lashistId}
                onChange={reservation.handleChange}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
              >
                <option value="">Sin asignar</option>

                {reservation.lashists.map((lashist) => (
                  <option key={lashist.id} value={lashist.id}>
                    {lashist.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Observaciones
              </label>
              <textarea
                rows={4}
                name="notes"
                value={reservation.form.notes}
                onChange={reservation.handleChange}
                placeholder="Escribe algún detalle adicional"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>

            {reservation.error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {reservation.error}
              </div>
            )}

            <button
              type="submit"
              disabled={reservation.saving}
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {reservation.saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminEditReservationPage