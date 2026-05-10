import type { Stats } from "../../../features/admin-dashboard/hooks/useAdminDashboard"
import { MetricCard, SmallMetricCard } from "./DashboardCards"
import { formatCurrency } from "./dashboardUtils"

function DashboardMetricSections({ stats }: { stats: Stats }) {
  return (
    <>
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
          Resumen principal
        </h2>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            title="Ingresos hoy"
            value={formatCurrency(stats.todayIncome)}
            highlight
          />
          <MetricCard
            title="Ingresos del mes"
            value={formatCurrency(stats.monthIncome)}
          />
          <MetricCard title="Reservas hoy" value={stats.todayReservations} />
          <MetricCard
            title="Saldo pendiente"
            value={formatCurrency(stats.totalPendingAmount)}
            danger={stats.totalPendingAmount > 0}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
          Indicadores del rango
        </h2>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            title="Reservas del rango"
            value={stats.rangeReservations}
          />
          <MetricCard
            title="Ingresos del rango"
            value={formatCurrency(stats.rangeIncome)}
          />
          <MetricCard
            title="Ticket promedio"
            value={formatCurrency(stats.averageTicket)}
          />
          <MetricCard
            title="No show"
            value={`${stats.noShowRate}%`}
            danger={stats.noShowRate > 0}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
          Estado de hoy
        </h2>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <SmallMetricCard title="Pendientes" value={stats.todayPending} />
          <SmallMetricCard title="Confirmadas" value={stats.todayConfirmed} />
          <SmallMetricCard title="Completadas" value={stats.todayCompleted} />
          <SmallMetricCard title="No show hoy" value={stats.todayNoShow} />
          <SmallMetricCard title="Canceladas mes" value={stats.monthCancelled} />
        </div>
      </section>
    </>
  )
}

export default DashboardMetricSections
