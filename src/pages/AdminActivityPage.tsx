import { useMemo } from "react"
import { Link } from "react-router"
import {
  getSingle,
  useAdminActivity,
} from "../features/appointment-audit/hooks/useAdminActivity"
import {
  formatAuditDetails,
  getAuditLabel,
} from "../features/appointment-audit/utils/auditFormatters"

const actionOptions = [
  { value: "all", label: "Todas" },
  { value: "status_updated", label: "Estados" },
  { value: "reservation_updated", label: "Ediciones" },
  { value: "payment_registered", label: "Pagos" },
  { value: "business_hours_updated", label: "Horarios" },
]

const actionStyles: Record<
  string,
  {
    badge: string
    border: string
    dot: string
    label: string
  }
> = {
  status_updated: {
    badge: "bg-blue-50 text-blue-700 ring-blue-100",
    border: "border-l-blue-400",
    dot: "bg-blue-500",
    label: "Estado",
  },
  reservation_updated: {
    badge: "bg-amber-50 text-amber-700 ring-amber-100",
    border: "border-l-amber-400",
    dot: "bg-amber-500",
    label: "Edicion",
  },
  payment_registered: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    border: "border-l-emerald-400",
    dot: "bg-emerald-500",
    label: "Pago",
  },
  business_hours_updated: {
    badge: "bg-violet-50 text-violet-700 ring-violet-100",
    border: "border-l-violet-400",
    dot: "bg-violet-500",
    label: "Horario",
  },
}

function AdminActivityPage() {
  const activity = useAdminActivity()

  const summary = useMemo(() => {
    return activity.logs.reduce(
      (acc, log) => {
        acc.total += 1
        if (log.action === "reservation_updated") acc.edits += 1
        if (log.action === "status_updated") acc.status += 1
        if (log.action === "payment_registered") acc.payments += 1
        if (log.action === "business_hours_updated") acc.hours += 1
        return acc
      },
      { total: 0, edits: 0, status: 0, payments: 0, hours: 0 }
    )
  }, [activity.logs])

  return (
    <div className="pb-8">
      <section className="mb-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Control interno
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Actividad
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Bitacora para revisar cambios de citas, pagos, estados y horarios
              con responsable y fecha.
            </p>
          </div>

          <button
            type="button"
            onClick={activity.refresh}
            disabled={activity.loading}
            className="rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-50"
          >
            {activity.loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </section>

      <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-5">
        <SummaryCard label="Movimientos" value={summary.total} />
        <SummaryCard label="Ediciones" value={summary.edits} tone="amber" />
        <SummaryCard label="Estados" value={summary.status} tone="blue" />
        <SummaryCard label="Pagos" value={summary.payments} tone="green" />
        <SummaryCard label="Horarios" value={summary.hours} tone="violet" />
      </section>

      <section className="mb-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              Buscar
            </span>
            <input
              value={activity.search}
              onChange={(event) => activity.setSearch(event.target.value)}
              placeholder="Cliente, telefono, servicio, correo o accion"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-700 focus:ring-4 focus:ring-stone-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              Accion
            </span>
            <select
              value={activity.actionFilter}
              onChange={(event) => activity.setActionFilter(event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-700 focus:ring-4 focus:ring-stone-100"
            >
              {actionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              Fecha
            </span>
            <input
              type="date"
              value={activity.dateFilter}
              onChange={(event) => activity.setDateFilter(event.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-700 focus:ring-4 focus:ring-stone-100"
            />
          </label>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {actionOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => activity.setActionFilter(option.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                activity.actionFilter === option.value
                  ? "bg-stone-950 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {option.label}
            </button>
          ))}
          {(activity.search || activity.dateFilter || activity.actionFilter !== "all") && (
            <button
              type="button"
              onClick={activity.clearFilters}
              className="shrink-0 rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-600 transition hover:bg-stone-100"
            >
              Limpiar
            </button>
          )}
        </div>
      </section>

      {activity.error && (
        <p className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {activity.error}
        </p>
      )}

      <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">
              Cambios recientes
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Del movimiento mas nuevo al mas antiguo.
            </p>
          </div>
          <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            {activity.logs.length} de {activity.totalLogs}
          </span>
        </div>

        {activity.loading ? (
          <StateBox text="Cargando actividad..." />
        ) : activity.logs.length === 0 ? (
          <StateBox text="No hay actividad con esos filtros." />
        ) : (
          <div className="space-y-3">
            {activity.logs.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function ActivityItem({
  log,
}: {
  log: ReturnType<typeof useAdminActivity>["logs"][number]
}) {
  const isAppointmentLog = log.type !== "admin"
  const appointment = getSingle(log.appointments)
  const client = getSingle(appointment?.clients)
  const service = getSingle(appointment?.services)
  const style = getActionStyle(log.action)
  const detail = formatAuditDetails(log.details)

  return (
    <article
      className={`rounded-[1.35rem] border border-l-4 border-stone-200 bg-stone-50 p-4 ring-1 ring-stone-100 ${style.border}`}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${style.badge}`}
            >
              {style.label}
            </span>
            <span className="text-xs font-medium text-stone-500">
              {formatCreatedAt(log.created_at)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-[220px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                {isAppointmentLog ? "Cliente" : "Area"}
              </p>
              <h3 className="mt-1 text-base font-semibold text-stone-950">
                {isAppointmentLog
                  ? client?.full_name ?? "Cliente no disponible"
                  : "Configuracion del negocio"}
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                {isAppointmentLog
                  ? client?.phone ?? "Sin telefono"
                  : "Cambio administrativo"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                {isAppointmentLog ? "Cita afectada" : "Detalle"}
              </p>
              <p className="mt-1 text-sm font-semibold text-stone-900">
                {isAppointmentLog
                  ? service?.name ?? "Servicio no disponible"
                  : "Horarios de atencion"}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {isAppointmentLog
                  ? `${formatAppointmentDate(
                      appointment?.date
                    )} · ${formatAppointmentTime(appointment?.time)}`
                  : "Afecta web, agenda y reservas"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white px-4 py-3">
            <div className="flex gap-3">
              <span
                className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  {getAuditLabel(log.action)}
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-800">{detail}</p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-stone-500">
            Responsable:{" "}
            <span className="font-medium text-stone-700">
              {log.actor_email ?? "Usuario no registrado"}
            </span>
          </p>
        </div>

        {log.appointment_id ? (
          <Link
            to={`/admin/reservas/${log.appointment_id}`}
            className="h-fit rounded-xl border border-stone-300 bg-white px-4 py-2 text-center text-xs font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            Ver cita
          </Link>
        ) : (
          <Link
            to="/admin/horarios"
            className="h-fit rounded-xl border border-stone-300 bg-white px-4 py-2 text-center text-xs font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            Ver horarios
          </Link>
        )}
      </div>
    </article>
  )
}

function SummaryCard({
  label,
  value,
  tone = "stone",
}: {
  label: string
  value: number
  tone?: "stone" | "amber" | "blue" | "green" | "violet"
}) {
  const classes = {
    stone: "border-stone-200 bg-white text-stone-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    blue: "border-blue-200 bg-blue-50 text-blue-950",
    green: "border-emerald-200 bg-emerald-50 text-emerald-950",
    violet: "border-violet-200 bg-violet-50 text-violet-950",
  }

  return (
    <article className={`rounded-[1.35rem] border p-4 shadow-sm ${classes[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </article>
  )
}

function StateBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
      {text}
    </div>
  )
}

function getActionStyle(action: string) {
  return (
    actionStyles[action] ?? {
      badge: "bg-stone-100 text-stone-700 ring-stone-200",
      border: "border-l-stone-300",
      dot: "bg-stone-400",
      label: action,
    }
  )
}

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function formatAppointmentDate(date: string | null | undefined) {
  if (!date) return "Sin fecha"
  const [year, month, day] = date.split("-")
  if (!year || !month || !day) return date
  return `${day}/${month}/${year}`
}

function formatAppointmentTime(time: string | null | undefined) {
  if (!time) return "Sin hora"
  return String(time).slice(0, 5)
}

export default AdminActivityPage
