import DashboardCharts from "../components/admin/dashboard/DashboardCharts"
import DashboardFilters from "../components/admin/dashboard/DashboardFilters"
import DashboardLists from "../components/admin/dashboard/DashboardLists"
import DashboardMetricSections from "../components/admin/dashboard/DashboardMetricSections"
import { useAdminDashboard } from "../features/admin-dashboard/hooks/useAdminDashboard"

function AdminDashboardPage() {
  const dashboard = useAdminDashboard()

  return (
    <div className="pb-6">
      <div className="mb-5 flex flex-col gap-3 md:mb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Panel administrativo
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:mt-3 md:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Métricas operativas, ingresos y resumen diario del spa.
          </p>
        </div>

        <button
          type="button"
          onClick={dashboard.refresh}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Actualizar
        </button>
      </div>

      <DashboardFilters
        rangeStart={dashboard.rangeStart}
        rangeEnd={dashboard.rangeEnd}
        onRangeStartChange={dashboard.setRangeStart}
        onRangeEndChange={dashboard.setRangeEnd}
        onLastDaysRange={dashboard.setLastDaysRange}
        onDownloadPdfReport={dashboard.downloadPdfReport}
      />

      {dashboard.loading && (
        <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-500 shadow-sm md:rounded-[2rem] md:p-6">
          Cargando métricas...
        </div>
      )}

      {dashboard.error && (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700 md:rounded-[2rem] md:p-6">
          {dashboard.error}
        </div>
      )}

      {!dashboard.loading && !dashboard.error && (
        <div className="space-y-5 md:space-y-6">
          <DashboardMetricSections stats={dashboard.stats} />

          <DashboardCharts
            dailyIncome={dashboard.dailyIncome}
            statusCounts={dashboard.statusCounts}
            stats={dashboard.stats}
            maxDailyIncome={dashboard.maxDailyIncome}
            maxStatusCount={dashboard.maxStatusCount}
          />

          <DashboardLists
            topServices={dashboard.topServices}
            upcomingReservations={dashboard.upcomingReservations}
          />
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
