import { Link } from "react-router"
import AdminReservationsTable from "../components/admin/reservations/AdminReservationsTable"
import AdminReservationsFilters from "../components/admin/reservations/AdminReservationsFilters"
import AdminReservationsTabs from "../components/admin/reservations/AdminReservationsTabs"
import { useAdminReservations } from "../features/admin-reservations/hooks/useAdminReservations"

function AdminReservationsPage() {
  const reservations = useAdminReservations()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Panel admin
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Reservas
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Revisa solicitudes, estado, abono, saldo pendiente y lashista asignada.
          </p>
        </div>

        <Link
          to="/admin/crear"
          className="inline-flex w-full justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white md:w-auto"
        >
          Nueva reserva
        </Link>
      </div>

      <AdminReservationsFilters
        selectedDate={reservations.selectedDate}
        searchTerm={reservations.searchTerm}
        onDateChange={reservations.setSelectedDate}
        onSearchChange={reservations.setSearchTerm}
        onClear={reservations.clearFilters}
      />

      <AdminReservationsTabs
        activeTab={reservations.activeTab}
        setActiveTab={reservations.setActiveTab}
        activeCount={reservations.activeCount}
        completedCount={reservations.completedCount}
        cancelledCount={reservations.cancelledCount}
      />

      {reservations.loading && (
        <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-600 shadow-sm md:rounded-[2rem] md:p-8">
          Cargando reservas...
        </div>
      )}

      {reservations.error && (
        <div className="mb-6 rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700 md:rounded-[2rem] md:p-8">
          {reservations.error}
        </div>
      )}

      {!reservations.loading && !reservations.error && (
        <AdminReservationsTable
          rows={reservations.rows}
          onUpdateStatus={reservations.updateStatus}
        />
      )}
    </div>
  )
}

export default AdminReservationsPage