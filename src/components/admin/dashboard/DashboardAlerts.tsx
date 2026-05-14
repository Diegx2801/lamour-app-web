import type { OperationalAlert } from "../../../features/admin-dashboard/hooks/useAdminDashboard"

const toneClasses: Record<OperationalAlert["tone"], string> = {
  red: "border-red-200 bg-red-50 text-red-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  stone: "border-stone-200 bg-white text-stone-900",
}

function DashboardAlerts({ alerts }: { alerts: OperationalAlert[] }) {
  const totalPending = alerts.reduce((acc, alert) => acc + alert.count, 0)

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Pendientes de revisar
          </p>
          <h2 className="mt-2 text-lg font-semibold text-stone-950 md:text-xl">
            Alertas operativas
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Lo que la dueña debería mirar antes de cerrar el día.
          </p>
        </div>

        <span className="w-fit rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white">
          {totalPending} pendientes
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {alerts.map((alert) => (
          <article
            key={alert.id}
            className={`rounded-[1.5rem] border p-4 ${toneClasses[alert.tone]}`}
          >
            <p className="text-2xl font-semibold">{alert.count}</p>
            <h3 className="mt-2 text-sm font-semibold">{alert.title}</h3>
            <p className="mt-2 text-xs leading-5 opacity-75">
              {alert.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DashboardAlerts
