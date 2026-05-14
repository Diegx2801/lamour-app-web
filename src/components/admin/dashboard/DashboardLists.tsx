import {
  getStatusLabel,
  type TopService,
  type UpcomingReservation,
} from "../../../features/admin-dashboard/hooks/useAdminDashboard"
import { getStatusClasses } from "./dashboardUtils"

type DashboardListsProps = {
  topServices: TopService[]
  upcomingReservations: UpcomingReservation[]
}

function DashboardLists({
  topServices,
  upcomingReservations,
}: DashboardListsProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-2 xl:gap-6">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Servicios
            </p>
            <h2 className="mt-2 text-lg font-semibold text-stone-950 md:text-xl">
              Más vendidos
            </h2>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
            Top 5
          </span>
        </div>

        <div className="space-y-3">
          {topServices.length > 0 ? (
            topServices.map((service, index) => (
              <div
                key={service.name}
                className="flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-semibold text-stone-600">
                    {index + 1}
                  </span>
                  <p className="min-w-0 truncate text-sm font-medium text-stone-900 md:text-base">
                    {service.name}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-stone-950 px-3 py-1 text-sm font-medium text-white">
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

      <section className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
              Agenda
            </p>
            <h2 className="mt-2 text-lg font-semibold text-stone-950 md:text-xl">
              Próximas reservas de hoy
            </h2>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Hoy
          </span>
        </div>

        <div className="space-y-3">
          {upcomingReservations.length > 0 ? (
            upcomingReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {reservation.time} · {reservation.clientName}
                    </p>
                    <p className="mt-1 text-sm text-stone-500">
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
  )
}

export default DashboardLists
