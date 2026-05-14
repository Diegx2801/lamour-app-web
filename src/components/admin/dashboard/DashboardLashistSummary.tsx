import type { LashistWeeklySummary } from "../../../features/admin-dashboard/hooks/useAdminDashboard"
import { formatCurrency } from "./dashboardUtils"

type DashboardLashistSummaryProps = {
  summaries: LashistWeeklySummary[]
  rangeStart: string
  rangeEnd: string
  onDownloadWeeklyReport: () => void
}

function formatDate(date: string) {
  const [, month, day] = date.split("-")
  return `${day}/${month}`
}

function DashboardLashistSummary({
  summaries,
  rangeStart,
  rangeEnd,
  onDownloadWeeklyReport,
}: DashboardLashistSummaryProps) {
  const maxServices = Math.max(
    ...summaries.map((summary) => summary.totalServices),
    1
  )

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Equipo
          </p>
          <h2 className="mt-2 text-lg font-semibold text-stone-950 md:text-xl">
            Servicios realizados por lashista
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Citas completadas del {formatDate(rangeStart)} al {formatDate(rangeEnd)}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
            {summaries.length} lashistas
          </span>
          <button
            type="button"
            onClick={onDownloadWeeklyReport}
            className="w-fit rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white transition hover:bg-stone-800"
          >
            Descargar PDF semanal
          </button>
        </div>
      </div>

      {summaries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 p-5 text-sm text-stone-500">
          No hay servicios completados por lashista en este rango.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {summaries.map((summary, index) => {
            const width = `${Math.max(
              (summary.totalServices / maxServices) * 100,
              8
            )}%`
            const topService = summary.services[0]

            return (
              <article
                key={summary.lashistKey}
                className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-stone-950">
                        {summary.lashistName}
                      </h3>
                      <p className="mt-1 text-xs text-stone-500">
                        {summary.totalServices} servicios ·{" "}
                        {Math.round(summary.totalMinutes / 60)} h aprox.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-stone-950">
                    {formatCurrency(summary.totalIncome)}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="h-3 rounded-full bg-white">
                    <div
                      className="h-3 rounded-full bg-stone-950"
                      style={{ width }}
                    />
                  </div>
                  {topService && (
                    <p className="mt-2 text-xs text-stone-500">
                      Más realizado:{" "}
                      <span className="font-medium text-stone-800">
                        {topService.serviceName}
                      </span>
                    </p>
                  )}
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-2xl bg-white px-3 py-2">
                    <p className="text-stone-500">No show</p>
                    <p className="mt-1 font-semibold text-stone-950">
                      {summary.noShow}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-3 py-2">
                    <p className="text-stone-500">Canceladas</p>
                    <p className="mt-1 font-semibold text-stone-950">
                      {summary.cancelled}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {summary.services.slice(0, 4).map((service) => (
                    <div
                      key={service.serviceName}
                      className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl bg-white px-3 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-stone-900">
                          {service.serviceName}
                        </p>
                        <p className="mt-1 text-xs text-stone-500">
                          {service.count} realizados · {service.minutes} min
                        </p>
                      </div>
                      <p className="font-semibold text-stone-950">
                        {formatCurrency(service.income)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default DashboardLashistSummary
