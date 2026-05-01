import { Link, useNavigate } from "react-router"
import { supabase } from "../lib/supabase"
import AdminReservationsTable from "../components/admin/reservations/AdminReservationsTable"
import AdminReservationsFilters from "../components/admin/reservations/AdminReservationsFilters"
import AdminReservationsTabs from "../components/admin/reservations/AdminReservationsTabs"
import { useAdminReservations } from "../features/admin-reservations/hooks/useAdminReservations"

function AdminReservationsPage() {
  const reservations = useAdminReservations()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Panel admin
            </p>

            <h1 className="mt-2 text-4xl font-semibold text-stone-950">
              Reservas registradas
            </h1>

            <p className="mt-3 text-sm leading-7 text-stone-600">
              Aquí podrás revisar solicitudes de reserva, estado, abono, saldo
              pendiente y lashista asignada.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/crear"
              className="rounded-full bg-stone-950 px-5 py-3 text-sm text-white"
            >
              Nueva reserva
            </Link>

            <Link
              to="/admin/agenda"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
            >
              Agenda
            </Link>

            <Link
              to="/admin/dashboard"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-800"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white"
            >
              Cerrar sesión
            </button>
          </div>
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
          <div className="rounded-[2rem] bg-white p-8 text-sm text-stone-600 shadow-sm">
            Cargando reservas...
          </div>
        )}

        {reservations.error && (
          <div className="mb-6 rounded-[2rem] border border-red-200 bg-red-50 p-8 text-sm text-red-700">
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
    </div>
  )
}

export default AdminReservationsPage