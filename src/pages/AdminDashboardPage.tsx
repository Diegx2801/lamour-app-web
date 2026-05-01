import { Link } from "react-router"
import {
  getStatusLabel,
  useAdminDashboard,
} from "../features/admin-dashboard/hooks/useAdminDashboard"

function getStatusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700"
    case "completed":
      return "bg-blue-100 text-blue-700"
    case "cancelled":
      return "bg-red-100 text-red-700"
    case "pending":
      return "bg-amber-100 text-amber-700"
    case "no_show":
      return "bg-stone-200 text-stone-700"
    default:
      return "bg-stone-100 text-stone-700"
  }
}

function AdminDashboardPage() {
  const dashboard = useAdminDashboard()

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-5 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Panel administrativo
            </p>

            <h1 className="mt-3 text-4xl font-semibold text-stone-950">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-stone-600">
              Métricas operativas, ingresos y resumen diario del spa.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
  <AdminLink to="/admin/agenda" label="Agenda" />
  <AdminLink to="/admin/reservas" label="Reservas" />
  <AdminLink to="/admin/services" label="Servicios" />
  <AdminLink to="/admin/clientes" label="Clientes" /> 
  <AdminLink to="/admin/seguimiento" label="Seguimiento" />
</div>
        </div>

        <div className="mb-6 rounded-[2rem] bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
            <DateInput
              label="Desde"
              value={dashboard.rangeStart}
              onChange={dashboard.setRangeStart}
            />

            <DateInput
              label="Hasta"
              value={dashboard.rangeEnd}
              onChange={dashboard.setRangeEnd}
            />

            <button
              type="button"
              onClick={() => dashboard.setLastDaysRange(7)}
              className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
            >
              Últimos 7 días
            </button>

            <button
              type="button"
              onClick={() => dashboard.setLastDaysRange(30)}
              className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700"
            >
              Últimos 30 días
            </button>
            <button
  type="button"
  onClick={dashboard.downloadPdfReport}
  className="rounded-xl bg-stone-950 px-4 py-3 text-sm font-medium text-white"
>
  Descargar PDF
</button>
          </div>
        </div>

        {dashboard.loading && (
          <div className="rounded-[2rem] bg-white p-6 text-sm text-stone-500 shadow-sm">
            Cargando métricas...
          </div>
        )}

        {dashboard.error && (
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {dashboard.error}
          </div>
        )}

        {!dashboard.loading && !dashboard.error && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Reservas totales" value={dashboard.stats.totalReservations} />
              <MetricCard title="Reservas hoy" value={dashboard.stats.todayReservations} />
              <MetricCard title="Ingresos hoy" value={`S/ ${dashboard.stats.todayIncome.toFixed(2)}`} />
              <MetricCard title="Ingresos del mes" value={`S/ ${dashboard.stats.monthIncome.toFixed(2)}`} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Pendientes hoy" value={dashboard.stats.todayPending} />
              <MetricCard title="Confirmadas hoy" value={dashboard.stats.todayConfirmed} />
              <MetricCard title="Completadas hoy" value={dashboard.stats.todayCompleted} />
              <MetricCard title="Canceladas del mes" value={dashboard.stats.monthCancelled} />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-stone-950">
                    Ingresos por día
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Cobros completados dentro del rango seleccionado.
                  </p>
                </div>

                <div className="flex items-end gap-3 overflow-x-auto pb-2">
                  {dashboard.dailyIncome.map((item) => {
                    const height =
                      dashboard.maxDailyIncome > 0
                        ? Math.max(
                            (item.amount / dashboard.maxDailyIncome) * 180,
                            8
                          )
                        : 8

                    return (
                      <div
                        key={item.date}
                        className="flex min-w-[54px] flex-col items-center gap-2"
                      >
                        <span className="text-[11px] text-stone-500">
                          S/ {item.amount.toFixed(0)}
                        </span>

                        <div className="flex h-[180px] items-end">
                          <div
                            className="w-10 rounded-t-xl bg-stone-950"
                            style={{ height: `${height}px` }}
                          />
                        </div>

                        <span className="text-[11px] text-stone-500">
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-stone-950">
                  Reservas por estado
                </h2>

                <div className="mt-6 space-y-4">
                  {dashboard.statusCounts.map((item) => {
                    const width =
                      dashboard.maxStatusCount > 0
                        ? `${(item.count / dashboard.maxStatusCount) * 100}%`
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

                <div className="mt-6 rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">
                    Saldo pendiente global
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-stone-950">
                    S/ {dashboard.stats.totalPendingAmount.toFixed(2)}
                  </p>
                </div>
              </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-stone-950">
                  Servicios más vendidos
                </h2>

                <div className="mt-5 space-y-3">
                  {dashboard.topServices.length > 0 ? (
                    dashboard.topServices.map((service, index) => (
                      <div
                        key={`${service.name}-${index}`}
                        className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3"
                      >
                        <p className="font-medium text-stone-900">
                          {service.name}
                        </p>

                        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                          {service.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-400">
                      Aún no hay datos suficientes.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-[2rem] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-stone-950">
                  Próximas reservas de hoy
                </h2>

                <div className="mt-5 space-y-3">
                  {dashboard.upcomingReservations.length > 0 ? (
                    dashboard.upcomingReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="rounded-2xl border border-stone-200 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-stone-900">
                              {reservation.time} · {reservation.clientName}
                            </p>
                            <p className="text-sm text-stone-500">
                              {reservation.serviceName}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
                              reservation.status
                            )}`}
                          >
                            {getStatusLabel(reservation.status)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-stone-400">
                      No hay reservas registradas para hoy.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-stone-500"
    >
      {label}
    </Link>
  )
  
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-stone-600">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-stone-300 px-4 py-3"
      />
    </div>
  )
}

function MetricCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-sm">
      <p className="text-sm text-stone-500">{title}</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-950">{value}</h2>
    </div>
  )
}

export default AdminDashboardPage