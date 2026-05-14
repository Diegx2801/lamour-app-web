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

const statusTone: Record<string, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-emerald-500",
  completed: "bg-blue-500",
  cancelled: "bg-red-400",
  no_show: "bg-stone-500",
}

function DashboardCharts({
  dailyIncome,
  statusCounts,
  stats,
  maxDailyIncome,
  maxStatusCount,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:gap-6">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col gap-2 md:mb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-950 md:text-xl">
              Cobros del periodo
            </h2>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              Pagos completados dentro del rango seleccionado.
            </p>
          </div>
          <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            S/ {stats.rangeIncome.toFixed(2)}
          </span>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] bg-stone-50 px-4 pb-4 pt-5">
          <div className="flex min-w-max items-end gap-3 md:gap-4">
            {dailyIncome.map((item) => {
              const height =
                maxDailyIncome > 0
                  ? Math.max((item.amount / maxDailyIncome) * 170, 10)
                  : 10

              return (
                <div
                  key={item.date}
                  className="flex min-w-[58px] flex-col items-center gap-2"
                >
                  <span className="text-[11px] font-medium text-stone-500">
                    S/ {item.amount.toFixed(0)}
                  </span>

                  <div className="flex h-[170px] items-end">
                    <div
                      className="w-9 rounded-t-2xl bg-stone-950 shadow-sm"
                      style={{ height: `${height}px` }}
                    />
                  </div>

                  <span className="text-[11px] text-stone-500">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-stone-950 md:text-xl">
            Estado de citas
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Distribución de reservas dentro del rango.
          </p>
        </div>

        <div className="space-y-4">
          {statusCounts.map((item) => {
            const width =
              maxStatusCount > 0
                ? `${(item.count / maxStatusCount) * 100}%`
                : "0%"

            return (
              <div key={item.status}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-stone-700">{item.label}</span>
                  <span className="font-semibold text-stone-950">
                    {item.count}
                  </span>
                </div>

                <div className="h-3 rounded-full bg-stone-100">
                  <div
                    className={`h-3 rounded-full ${
                      statusTone[item.status] ?? "bg-stone-950"
                    }`}
                    style={{ width }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Completadas</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-950">
              {stats.completionRate}%
            </p>
          </div>

          <div className="rounded-2xl bg-red-50 p-4">
            <p className="text-sm text-red-700">No show mes</p>
            <p className="mt-2 text-2xl font-semibold text-red-950">
              {stats.monthNoShow}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardCharts
