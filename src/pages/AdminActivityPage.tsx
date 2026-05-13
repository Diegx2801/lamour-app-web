import { Link } from "react-router"
import {
  getSingle,
  useAdminActivity,
} from "../features/appointment-audit/hooks/useAdminActivity"
import { formatAuditDetails } from "../features/appointment-audit/utils/auditFormatters"

const actionOptions = [
  { value: "all", label: "Todas" },
  { value: "status_updated", label: "Estados" },
  { value: "reservation_updated", label: "Ediciones" },
  { value: "payment_registered", label: "Pagos" },
]

function AdminActivityPage() {
  const activity = useAdminActivity()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Control interno
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Actividad
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Revisa quiÃ©n editÃ³ citas, cambiÃ³ estados o registrÃ³ pagos.
          </p>
        </div>

        <button
          type="button"
          onClick={activity.refresh}
          disabled={activity.loading}
          className="rounded-2xl bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>

      <section className="mb-5 grid gap-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_180px_180px] md:p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Buscar
          </span>
          <input
            value={activity.search}
            onChange={(event) => activity.setSearch(event.target.value)}
            placeholder="Cliente, telÃ©fono, servicio o usuario"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            AcciÃ³n
          </span>
          <select
            value={activity.actionFilter}
            onChange={(event) => activity.setActionFilter(event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700"
          >
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-stone-800">
            Fecha
          </span>
          <input
            type="date"
            value={activity.dateFilter}
            onChange={(event) => activity.setDateFilter(event.target.value)}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-700"
          />
        </label>
      </section>

      {activity.error && (
        <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {activity.error}
        </p>
      )}

      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-stone-950">
            Cambios recientes
          </h2>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
            {activity.logs.length} de {activity.totalLogs}
          </span>
        </div>

        {activity.loading ? (
          <StateBox text="Cargando actividad..." />
        ) : activity.logs.length === 0 ? (
          <StateBox text="No hay actividad con esos filtros." />
        ) : (
          <div className="space-y-3">
            {activity.logs.map((log) => {
              const appointment = getSingle(log.appointments)
              const client = getSingle(appointment?.clients)
              const service = getSingle(appointment?.services)

              return (
                <article
                  key={log.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionClasses(
                            log.action
                          )}`}
                        >
                          {getActionLabel(log.action)}
                        </span>
                        <span className="text-xs text-stone-500">
                          {new Date(log.created_at).toLocaleString("es-PE")}
                        </span>
                      </div>

                      <h3 className="mt-3 font-semibold text-stone-950">
                        {client?.full_name ?? "Cliente no disponible"}
                      </h3>
                      <p className="mt-1 text-sm text-stone-600">
                        {service?.name ?? "Servicio no disponible"} Â·{" "}
                        {formatAppointmentDate(appointment?.date)} Â·{" "}
                        {String(appointment?.time ?? "").slice(0, 5) || "--:--"}
                      </p>
                      <p className="mt-2 text-sm text-stone-700">
                        {formatAuditDetails(log.details)}
                      </p>
                      <p className="mt-2 text-xs text-stone-500">
                        Responsable: {log.actor_email ?? "Usuario no registrado"}
                      </p>
                    </div>

                    <Link
                      to={`/admin/reservas/${log.appointment_id}`}
                      className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-center text-xs font-medium text-stone-700 transition hover:bg-stone-100"
                    >
                      Ver cita
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function StateBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500">
      {text}
    </div>
  )
}

function getActionLabel(action: string) {
  switch (action) {
    case "status_updated":
      return "Estado"
    case "reservation_updated":
      return "EdiciÃ³n"
    case "payment_registered":
      return "Pago"
    default:
      return action
  }
}

function getActionClasses(action: string) {
  switch (action) {
    case "status_updated":
      return "bg-blue-100 text-blue-800"
    case "reservation_updated":
      return "bg-amber-100 text-amber-800"
    case "payment_registered":
      return "bg-green-100 text-green-800"
    default:
      return "bg-stone-200 text-stone-700"
  }
}

function formatAppointmentDate(date: string | null | undefined) {
  if (!date) return "Sin fecha"
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

export default AdminActivityPage
