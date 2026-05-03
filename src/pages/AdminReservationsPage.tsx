import { Link } from "react-router"
import { isSunday } from "../features/reservations/utils/reservationUtils"
import { useAdminCreateReservation } from "../features/admin-reservations/hooks/useAdminCreateReservation"

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:bg-stone-100 disabled:text-stone-500"

function AdminCreateReservationPage() {
  const reservation = useAdminCreateReservation()

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/reservas"
          className="text-sm font-medium text-stone-600 hover:text-stone-950"
        >
          ← Volver a reservas
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-stone-950 md:text-4xl">
          {reservation.isRetouch ? "Nuevo retoque" : "Nueva reserva"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Registra una cita manualmente desde el panel administrativo.
        </p>
      </div>

      <form
        onSubmit={reservation.handleSubmit}
        className="mx-auto max-w-2xl space-y-4 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.08)] md:p-6"
      >
        <Field label="Nombre completo">
          <input
            name="fullName"
            placeholder="Ejemplo: María Pérez"
            value={reservation.form.fullName}
            onChange={reservation.handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Teléfono">
          <input
            name="phone"
            placeholder="Ejemplo: 957230015"
            value={reservation.form.phone}
            onChange={reservation.handleChange}
            className={inputClass}
          />
        </Field>

        <Field label="Servicio">
          <select
            name="service"
            value={reservation.form.service}
            onChange={reservation.handleChange}
            className={inputClass}
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
                {service.allows_retouch && service.retouch_price
                  ? ` · Retoque S/ ${Number(service.retouch_price).toFixed(2)}`
                  : ""}
              </option>
            ))}
          </select>
        </Field>

        {reservation.selectedServiceData?.allows_retouch && (
          <Field label="Tipo de cita">
            <select
              name="appointmentType"
              value={reservation.form.appointmentType}
              onChange={reservation.handleChange}
              className={inputClass}
            >
              <option value="normal">Servicio normal</option>
              <option value="retouch">Retoque</option>
            </select>
          </Field>
        )}

        {reservation.form.service &&
          !reservation.selectedServiceData?.allows_retouch && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
              Este servicio no tiene retoque configurado.
            </div>
          )}

        <div className="grid gap-3 sm:grid-cols-3">
          <PriceBox
            label={reservation.isRetouch ? "Precio retoque" : "Precio servicio"}
            value={`S/ ${reservation.servicePrice.toFixed(2)}`}
          />
          <PriceBox
            label="Abono"
            value={`S/ ${reservation.depositAmount.toFixed(2)}`}
          />
          <PriceBox
            label="Saldo"
            value={`S/ ${reservation.remainingAmount.toFixed(2)}`}
          />
        </div>

        <Field label="Lashista">
          <select
            name="lashistId"
            value={reservation.form.lashistId}
            onChange={reservation.handleChange}
            className={inputClass}
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
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Fecha">
            <input
              type="date"
              name="date"
              value={reservation.form.date}
              onChange={reservation.handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Hora">
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
              className={inputClass}
            >
              <option value="">
                {!reservation.form.service
                  ? "Primero selecciona servicio"
                  : !reservation.form.date
                  ? "Primero selecciona fecha"
                  : isSunday(reservation.form.date)
                  ? "Domingo no disponible"
                  : reservation.blockedReason
                  ? "Día bloqueado"
                  : reservation.loadingSlots
                  ? "Cargando horarios..."
                  : reservation.availableSlots.length === 0
                  ? "No hay horarios"
                  : "Selecciona hora"}
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

        <Field label="Observaciones">
          <textarea
            rows={4}
            name="notes"
            value={reservation.form.notes}
            onChange={reservation.handleChange}
            placeholder="Notas internas de la reserva"
            className={`${inputClass} resize-none`}
          />
        </Field>

        {reservation.error && <AlertMessage message={reservation.error} />}

        <button
          type="submit"
          disabled={reservation.loading}
          className="w-full rounded-xl bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {reservation.loading
            ? "Guardando..."
            : reservation.isRetouch
            ? "Crear retoque"
            : "Crear reserva"}
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

function PriceBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-stone-950">{value}</p>
    </div>
  )
}

function AlertMessage({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </p>
  )
}

export default AdminCreateReservationPage