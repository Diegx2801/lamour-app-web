import { Link } from "react-router"
import { useAdminCreateReservation } from "../features/admin-reservations/hooks/useAdminCreateReservation"
import { isSunday } from "../features/reservations/utils/reservationUtils"

const inputClass =
  "w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:bg-stone-100 disabled:text-stone-500"

function AdminReservationsPage() {
  const reservation = useAdminCreateReservation()

  return (
    <div>
      <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Reservas
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              {reservation.isRetouch ? "Nuevo retoque" : "Nueva reserva"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Registra una cita manual, valida disponibilidad y deja el pago
              inicial conectado a caja.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Link
              to="/admin/agenda"
              className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-center text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
            >
              Ver agenda
            </Link>
            <Link
              to="/admin/clientes"
              className="rounded-2xl bg-stone-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              Clientes
            </Link>
          </div>
        </div>
      </div>

      <form onSubmit={reservation.handleSubmit} className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <SectionCard title="Cliente" description="Datos basicos para ubicar la reserva.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nombre completo">
                <input
                  name="fullName"
                  placeholder="Ejemplo: Maria Perez"
                  value={reservation.form.fullName}
                  onChange={reservation.handleChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Telefono">
                <input
                  name="phone"
                  placeholder="Ejemplo: 957230015"
                  value={reservation.form.phone}
                  onChange={reservation.handleChange}
                  className={inputClass}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title="Servicio" description="Selecciona el tratamiento y tipo de cita.">
            <div className="grid gap-4">
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
                      {service.name} - S/ {Number(service.price).toFixed(2)}
                      {service.allows_retouch && service.retouch_price
                        ? ` - Retoque S/ ${Number(service.retouch_price).toFixed(2)}`
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
            </div>
          </SectionCard>

          <SectionCard title="Fecha y responsable" description="Asigna lashista y horario disponible.">
            <div className="grid gap-4">
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
                              ? "Dia bloqueado"
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
            </div>
          </SectionCard>

          <SectionCard title="Observaciones" description="Notas internas para el equipo.">
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
          </SectionCard>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Resumen
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">
              Pago inicial
            </h2>

            <div className="mt-4 grid gap-3">
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

            {reservation.error && <AlertMessage message={reservation.error} />}

            <button
              type="submit"
              disabled={reservation.loading}
              className="mt-4 w-full rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
            >
              {reservation.loading
                ? "Guardando..."
                : reservation.isRetouch
                  ? "Crear retoque"
                  : "Crear reserva"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-stone-950">{title}</h2>
        <p className="mt-1 text-sm text-stone-500">{description}</p>
      </div>
      {children}
    </section>
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
      <span className="mb-2 block text-sm font-semibold text-stone-800">
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
      <p className="mt-2 text-xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}

function AlertMessage({ message }: { message: string }) {
  return (
    <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </p>
  )
}

export default AdminReservationsPage
