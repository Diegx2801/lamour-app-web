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

function formatCurrency(value: number) {
  return `S/ ${value.toFixed(2)}`
}

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

          <ActionButton
            onClick={() => dashboard.setLastDaysRange(7)}
            variant="secondary"
          >
            Últimos 7 días
          </ActionButton>

          <ActionButton
            onClick={() => dashboard.setLastDaysRange(30)}
            variant="secondary"
          >
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
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
              Resumen principal
            </h2>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MetricCard
                title="Ingresos hoy"
                value={formatCurrency(dashboard.stats.todayIncome)}
                highlight
              />
              <MetricCard
                title="Ingresos del mes"
                value={formatCurrency(dashboard.stats.monthIncome)}
              />
              <MetricCard
                title="Reservas hoy"
                value={dashboard.stats.todayReservations}
              />
              <MetricCard
                title="Saldo pendiente"
                value={formatCurrency(dashboard.stats.totalPendingAmount)}
                danger={dashboard.stats.totalPendingAmount > 0}
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
                value={dashboard.stats.rangeReservations}
              />
              <MetricCard
                title="Ingresos del rango"
                value={formatCurrency(dashboard.stats.rangeIncome)}
              />
              <MetricCard
                title="Ticket promedio"
                value={formatCurrency(dashboard.stats.averageTicket)}
              />
              <MetricCard
                title="No show"
                value={`${dashboard.stats.noShowRate}%`}
                danger={dashboard.stats.noShowRate > 0}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
              Estado de hoy
            </h2>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
              <SmallMetricCard title="Pendientes" value={dashboard.stats.todayPending} />
              <SmallMetricCard title="Confirmadas" value={dashboard.stats.todayConfirmed} />
              <SmallMetricCard title="Completadas" value={dashboard.stats.todayCompleted} />
              <SmallMetricCard title="No show hoy" value={dashboard.stats.todayNoShow} />
              <SmallMetricCard title="Canceladas mes" value={dashboard.stats.monthCancelled} />
            </div>
          </section>

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
                {dashboard.dailyIncome.map((item) => {
                  const height =
                    dashboard.maxDailyIncome > 0
                      ? Math.max(
                          (item.amount / dashboard.maxDailyIncome) * 160,
                          8
                        )
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

              <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">Completadas</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-950">
                    {dashboard.stats.completionRate}%
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-sm text-stone-500">No show mes</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-950">
                    {dashboard.stats.monthNoShow}
                  </p>
                </div>
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
                    No hay próximas reservas para hoy.
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
  highlight = false,
  danger = false,
}: {
  title: string
  value: string | number
  highlight?: boolean
  danger?: boolean
}) {
  return (
    <div
      className={`rounded-[1.35rem] p-4 shadow-sm md:rounded-[2rem] md:p-6 ${
        highlight
          ? "bg-stone-950 text-white"
          : danger
          ? "border border-red-100 bg-red-50"
          : "bg-white"
      }`}
    >
      <p
        className={`text-xs md:text-sm ${
          highlight ? "text-stone-300" : danger ? "text-red-600" : "text-stone-500"
        }`}
      >
        {title}
      </p>

      <h2
        className={`mt-2 text-xl font-semibold md:mt-3 md:text-3xl ${
          highlight ? "text-white" : danger ? "text-red-800" : "text-stone-950"
        }`}
      >
        {value}
      </h2>
    </div>
  )
}

function SmallMetricCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-stone-500">{title}</p>
      <p className="mt-2 text-xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}

export default AdminDashboardPage