import type { Stats } from "../../../features/admin-dashboard/hooks/useAdminDashboard"
import { MetricCard, SmallMetricCard } from "./DashboardCards"
import { formatCurrency } from "./dashboardUtils"

function DashboardMetricSections({ stats }: { stats: Stats }) {
  const pendingTone = stats.rangePendingAmount > 0 ? "text-red-200" : "text-emerald-200"

  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="overflow-hidden rounded-[2rem] border border-stone-900 bg-stone-950 shadow-sm">
          <div className="grid gap-6 p-5 text-white md:grid-cols-[1fr_auto] md:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-300">
                Resumen ejecutivo
              </p>
              <h2 className="mt-4 max-w-xl text-2xl font-semibold leading-tight md:text-3xl">
                {stats.rangePendingAmount > 0
                  ? `Hay ${formatCurrency(stats.rangePendingAmount)} por cobrar en este periodo.`
                  : "Este periodo no tiene saldo pendiente por cobrar."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-300">
                Vista rápida para decidir: cuánto se cobró, cuántas citas hubo y
                qué queda pendiente dentro del rango seleccionado.
              </p>
            </div>

            <div className="grid min-w-[260px] grid-cols-2 gap-3">
              <ExecutiveValue
                label="Cobrado"
                value={formatCurrency(stats.rangeIncome)}
                tone="text-emerald-200"
              />
              <ExecutiveValue
                label="Citas"
                value={stats.rangeReservations}
                tone="text-white"
              />
              <ExecutiveValue
                label="Por cobrar"
                value={formatCurrency(stats.rangePendingAmount)}
                tone={pendingTone}
              />
              <ExecutiveValue
                label="Ticket"
                value={formatCurrency(stats.averageTicket)}
                tone="text-blue-200"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <MetricCard
            title="No show del periodo"
            value={`${stats.noShowRate}%`}
            description="Mientras más bajo, mejor control de agenda."
            danger={stats.noShowRate > 0}
          />
          <MetricCard
            title="Completadas"
            value={`${stats.completionRate}%`}
            description="Citas del rango marcadas como completadas."
            accent="green"
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
            Pulso del negocio
          </h2>
          <span className="rounded-full bg-white px-3 py-1 text-xs text-stone-500">
            Hoy y mes actual
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            title="Ingresos hoy"
            value={formatCurrency(stats.todayIncome)}
            description="Pagos registrados hoy."
            highlight
          />
          <MetricCard
            title="Ingresos del mes"
            value={formatCurrency(stats.monthIncome)}
            description="Pagos completados en el mes."
            accent="blue"
          />
          <MetricCard
            title="Reservas hoy"
            value={stats.todayReservations}
            description="Citas agendadas para hoy."
            accent="amber"
          />
          <MetricCard
            title="Por cobrar total"
            value={formatCurrency(stats.totalPendingAmount)}
            description="Todas las citas pendientes/confirmadas."
            danger={stats.totalPendingAmount > 0}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
          Agenda de hoy
        </h2>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <SmallMetricCard title="Pendientes" value={stats.todayPending} />
          <SmallMetricCard title="Confirmadas" value={stats.todayConfirmed} />
          <SmallMetricCard title="Completadas" value={stats.todayCompleted} />
          <SmallMetricCard title="No show" value={stats.todayNoShow} />
          <SmallMetricCard title="Canceladas mes" value={stats.monthCancelled} />
        </div>
      </section>
    </>
  )
}

function ExecutiveValue({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone: string
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <p className="text-xs text-stone-300">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight ${tone}`}>
        {value}
      </p>
    </div>
  )
}

export default DashboardMetricSections
