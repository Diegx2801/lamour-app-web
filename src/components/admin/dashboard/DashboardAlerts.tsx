import { Link } from "react-router"
import { useState } from "react"
import type { OperationalAlert } from "../../../features/admin-dashboard/hooks/useAdminDashboard"

const toneClasses: Record<OperationalAlert["tone"], string> = {
  red: "border-red-200 bg-red-50 text-red-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  stone: "border-stone-200 bg-white text-stone-900",
}

function DashboardAlerts({ alerts }: { alerts: OperationalAlert[] }) {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)
  const totalPending = alerts.reduce((acc, alert) => acc + alert.count, 0)
  const selectedAlert =
    alerts.find((alert) => alert.id === selectedAlertId) ?? null

  return (
    <section className="rounded-[1.5rem] border border-stone-200 bg-white p-3 shadow-sm md:rounded-[2rem] md:p-6">
      <div className="mb-3 flex items-start justify-between gap-3 md:mb-4">
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

        <span className="shrink-0 rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white">
          {totalPending} pendientes
        </span>
      </div>

      <div className="-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-5">
        {alerts.map((alert) => (
          <button
            type="button"
            key={alert.id}
            onClick={() =>
              setSelectedAlertId((current) =>
                current === alert.id ? null : alert.id
              )
            }
            className={`min-w-[72%] snap-start rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm sm:min-w-[44%] md:min-w-0 md:rounded-[1.5rem] md:p-4 ${
              selectedAlertId === alert.id ? "ring-2 ring-stone-900/15" : ""
            } ${toneClasses[alert.tone]}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-2xl font-semibold">{alert.count}</p>
                <h3 className="mt-1 text-sm font-semibold">{alert.title}</h3>
              </div>
              <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold md:hidden">
                Ver
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-5 opacity-75 md:line-clamp-none">
              {alert.description}
            </p>
            <p className="mt-3 hidden text-xs font-semibold opacity-80 md:block">
              Ver detalle
            </p>
          </button>
        ))}
      </div>

      {selectedAlert && (
        <div className="mt-3 rounded-[1.25rem] border border-stone-200 bg-stone-50 p-3 md:mt-4 md:rounded-[1.5rem] md:p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-stone-950">
                {selectedAlert.title}
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                {selectedAlert.count} registro
                {selectedAlert.count === 1 ? "" : "s"} encontrado
                {selectedAlert.count === 1 ? "" : "s"}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAlertId(null)}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-stone-600"
            >
              Cerrar
            </button>
          </div>

          <div className="mt-3 grid max-h-[45vh] gap-2 overflow-y-auto pr-1 md:mt-4 md:max-h-none md:grid-cols-2 md:overflow-visible md:pr-0">
            {selectedAlert.items.length === 0 ? (
              <p className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-500">
                No hay registros para mostrar.
              </p>
            ) : (
              selectedAlert.items.map((item) => {
                const content = (
                  <>
                    <p className="font-semibold text-stone-950">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">
                      {item.subtitle}
                    </p>
                  </>
                )

                return item.href ? (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm transition hover:bg-stone-100"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm"
                  >
                    {content}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default DashboardAlerts
