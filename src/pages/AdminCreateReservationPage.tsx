import { Link } from "react-router"
import { isSunday } from "../features/reservations/utils/reservationUtils"
import { useAdminCreateReservation } from "../features/admin-reservations/hooks/useAdminCreateReservation"

function AdminCreateReservationPage() {
  const reservation = useAdminCreateReservation()

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-xl">
        <Link to="/admin/reservas" className="text-sm text-stone-600">
          ← Volver a reservas
        </Link>

        <h1 className="mb-6 mt-4 text-3xl font-semibold">
          Nueva reserva manual
        </h1>

        <form
          onSubmit={reservation.handleSubmit}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
        >
          <input
            name="fullName"
            placeholder="Nombre"
            value={reservation.form.fullName}
            onChange={reservation.handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />

          <input
            name="phone"
            placeholder="Teléfono"
            value={reservation.form.phone}
            onChange={reservation.handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />

          <select
            name="service"
            value={reservation.form.service}
            onChange={reservation.handleChange}
            className="w-full rounded-xl border px-4 py-3"
            disabled={reservation.loadingServices}
          >
            <option value="">
              {reservation.loadingServices
                ? "Cargando servicios..."
                : "Selecciona un servicio"}
            </option>

            {reservation.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — S/ {Number(service.price).toFixed(2)}
              </option>
            ))}
          </select>

          <select
            name="lashistId"
            value={reservation.form.lashistId}
            onChange={reservation.handleChange}
            className="w-full rounded-xl border px-4 py-3"
            disabled={reservation.loadingLashists}
          >
            <option value="">
              {reservation.loadingLashists
                ? "Cargando lashistas..."
                : "Sin asignar"}
            </option>

            {reservation.lashists.map((lashist) => (
              <option key={lashist.id} value={lashist.id}>
                {lashist.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={reservation.form.date}
            onChange={reservation.handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />

          {reservation.form.date && isSunday(reservation.form.date) && (
            <p className="text-sm text-red-500">No se atiende domingos.</p>
          )}

          {reservation.blockedReason && !isSunday(reservation.form.date) && (
            <p className="text-sm text-red-500">
              {reservation.blockedReason}
            </p>
          )}

          <select
            name="time"
            value={reservation.form.time}
            onChange={reservation.handleChange}
            disabled={
              !reservation.form.date ||
              !reservation.form.service ||
              reservation.loadingSlots ||
              isSunday(reservation.form.date) ||
              !!reservation.blockedReason
            }
            className="w-full rounded-xl border px-4 py-3 disabled:bg-stone-100"
          >
            <option value="">
              {!reservation.form.service
                ? "Primero selecciona un servicio"
                : !reservation.form.date
                ? "Primero selecciona una fecha"
                : isSunday(reservation.form.date)
                ? "Domingo no disponible"
                : reservation.blockedReason
                ? "Día bloqueado"
                : reservation.loadingSlots
                ? "Cargando horarios..."
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

          <textarea
            rows={4}
            name="notes"
            value={reservation.form.notes}
            onChange={reservation.handleChange}
            placeholder="Observaciones"
            className="w-full rounded-xl border px-4 py-3"
          />

          {reservation.error && (
            <p className="text-sm text-red-500">{reservation.error}</p>
          )}

          <button
            disabled={reservation.loading}
            className="w-full rounded-xl bg-black py-3 text-white disabled:opacity-60"
          >
            {reservation.loading ? "Guardando..." : "Crear reserva"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminCreateReservationPage