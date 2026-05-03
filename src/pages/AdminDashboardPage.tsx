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
    <div>
      <div className="mb-5 md:mb-6">
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

      <div className="mb-5 rounded-[1.5rem] bg-white p-4 shadow-sm md:mb-6 md:rounded-[2rem] md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end">
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

          <ActionButton onClick={() => dashboard.setLastDaysRange(7)} variant="secondary">
            Últimos 7 días
          </ActionButton>

          <ActionButton onClick={() => dashboard.setLastDaysRange(30)} variant="secondary">
            Últimos 30 días
          </ActionButton>

          <ActionButton onClick={dashboard.downloadPdfReport} variant="primary">
            Descargar PDF
          </ActionButton>
        </div>
      </div>

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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Reservas totales" value={dashboard.stats.totalReservations} />
            <MetricCard title="Reservas hoy" value={dashboard.stats.todayReservations} />
            <MetricCard title="Ingresos hoy" value={`S/ ${dashboard.stats.todayIncome.toFixed(2)}`} />
            <MetricCard title="Ingresos del mes" value={`S/ ${dashboard.stats.monthIncome.toFixed(2)}`} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Pendientes hoy" value={dashboard.stats.todayPending} />
            <MetricCard title="Confirmadas hoy" value={dashboard.stats.todayConfirmed} />
            <MetricCard title="Completadas hoy" value={dashboard.stats.todayCompleted} />
            <MetricCard title="Canceladas del mes" value={dashboard.stats.monthCancelled} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:gap-6">
            <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
              <div className="mb-5 md:mb-6">
                <h2 className="text-lg font-semibold text-stone-950 md:text-xl">
                  Ingresos por día
                </h2>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  Cobros completados dentro del rango seleccionado.
                </p>
              </div>

              <div className="flex items-end gap-2 overflow-x-auto pb-2 md:gap-3">
                {dashboard.dailyIncome.map((item) => {
                  const height =
                    dashboard.maxDailyIncome > 0
                      ? Math.max((item.amount / dashboard.maxDailyIncome) * 160, 8)
                      : 8

                  return (
                    <div
                      key={item.date}
                      className="flex min-w-[48px] flex-col items-center gap-2 md:min-w-[54px]"
                    >
                      <span className="text-[11px] text-stone-500">
                        S/ {item.amount.toFixed(0)}
                      </span>

                      <div className="flex h-[160px] items-end md:h-[180px]">
                        <div
                          className="w-8 rounded-t-xl bg-stone-950 md:w-10"
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

            <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
              <h2 className="text-lg font-semibold text-stone-950 md:text-xl">
                Reservas por estado
              </h2>

              <div className="mt-5 space-y-4 md:mt-6">
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

              <div className="mt-5 rounded-2xl bg-stone-50 p-4 md:mt-6">
                <p className="text-sm text-stone-500">Saldo pendiente global</p>
                <p className="mt-2 text-2xl font-semibold text-stone-950 md:text-3xl">
                  S/ {dashboard.stats.totalPendingAmount.toFixed(2)}
                </p>
              </div>
            </section>
          </div>

          <div className="grid gap-5 xl:grid-cols-2 xl:gap-6">
            <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
              <h2 className="text-lg font-semibold text-stone-950 md:text-xl">
                Servicios más vendidos
              </h2>

              <div className="mt-4 space-y-3 md:mt-5">
                {dashboard.topServices.length > 0 ? (
                  dashboard.topServices.map((service, index) => (
                    <div
                      key={`${service.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 px-4 py-3"
                    >
                      <p className="min-w-0 text-sm font-medium text-stone-900 md:text-base">
                        {service.name}
                      </p>

                      <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
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

            <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
              <h2 className="text-lg font-semibold text-stone-950 md:text-xl">
                Próximas reservas de hoy
              </h2>

              <div className="mt-4 space-y-3 md:mt-5">
                {dashboard.upcomingReservations.length > 0 ? (
                  dashboard.upcomingReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="rounded-2xl border border-stone-200 px-4 py-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-stone-900">
                            {reservation.time} · {reservation.clientName}
                          </p>
                          <p className="text-sm text-stone-500">
                            {reservation.serviceName}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
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
        className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500"
      />
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  variant,
}: {
  children: string
  onClick: () => void
  variant: "primary" | "secondary"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition md:w-auto ${
        variant === "primary"
          ? "bg-stone-950 text-white hover:bg-stone-800"
          : "border border-stone-300 text-stone-700 hover:bg-stone-50"
      }`}
    >
      {children}
    </button>
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
    <div className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
      <p className="text-sm text-stone-500">{title}</p>
      <h2 className="mt-2 text-2xl font-semibold text-stone-950 md:mt-3 md:text-3xl">
        {value}
      </h2>
    </div>
  )
}

export default AdminDashboardPage