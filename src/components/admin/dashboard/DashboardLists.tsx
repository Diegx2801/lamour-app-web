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
      <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
        <h2 className="text-lg font-semibold text-stone-950 md:text-xl">
          Servicios más vendidos
        </h2>

        <div className="mt-4 space-y-3 md:mt-5">
          {topServices.length > 0 ? (
            topServices.map((service) => (
              <div
                key={service.name}
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
          {upcomingReservations.length > 0 ? (
            upcomingReservations.map((reservation) => (
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
  )
}

export default DashboardLists
