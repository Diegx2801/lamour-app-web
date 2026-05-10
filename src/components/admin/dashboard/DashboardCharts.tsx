import type {
  DailyIncome,
  Stats,
  StatusCount,
} from "../../../features/admin-dashboard/hooks/useAdminDashboard"

type DashboardChartsProps = {
  dailyIncome: DailyIncome[]
  statusCounts: StatusCount[]
  stats: Stats
  maxDailyIncome: number
  maxStatusCount: number
}

function DashboardCharts({
  dailyIncome,
  statusCounts,
  stats,
  maxDailyIncome,
  maxStatusCount,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:gap-6">
      <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
        <div className="mb-5 md:mb-6">
          <h2 className="text-lg font-semibold text-stone-950 md:text-xl">
            Ingresos por periodo
          </h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Cobros completados dentro del rango seleccionado.
          </p>
        </div>

        <div className="flex items-end gap-2 overflow-x-auto pb-2 md:gap-3">
          {dailyIncome.map((item) => {
            const height =
              maxDailyIncome > 0
                ? Math.max((item.amount / maxDailyIncome) * 160, 8)
                : 8

            return (
              <div
                key={item.date}
                className="flex min-w-[52px] flex-col items-center gap-2"
              >
                <span className="text-[11px] text-stone-500">
                  S/ {item.amount.toFixed(0)}
                </span>

                <div className="flex h-[160px] items-end">
                  <div
                    className="w-8 rounded-t-xl bg-stone-950"
                    style={{ height: `${height}px` }}
                  />
                </div>

                <span className="text-[11px] text-stone-500">{item.label}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
        <h2 className="text-lg font-semibold text-stone-950 md:text-xl">
          Reservas por estado
        </h2>

        <div className="mt-5 space-y-4 md:mt-6">
          {statusCounts.map((item) => {
            const width =
              maxStatusCount > 0
                ? `${(item.count / maxStatusCount) * 100}%`
                : "0%"

            return (
              <div key={item.status}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-stone-700">{item.label}</span>
                  <span className="font-medium text-stone-900">
                    {item.count}
                  </span>
                </div>

                <div className="h-3 rounded-full bg-stone-100">
                  <div
                    className="h-3 rounded-full bg-stone-950"
                    style={{ width }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Completadas</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">
              {stats.completionRate}%
            </p>
          </div>

          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">No show mes</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">
              {stats.monthNoShow}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardCharts
