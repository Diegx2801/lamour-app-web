import AdminServiceModal from "../components/admin/services/AdminServiceModal"
import AdminServicesList from "../components/admin/services/AdminServicesList"
import AdminServicesSummary from "../components/admin/services/AdminServicesSummary"
import { Alert } from "../components/admin/services/AdminServicesShared"
import { useAdminServices } from "../features/admin-services/hooks/useAdminServices"

function AdminServicesPage() {
  const services = useAdminServices()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Panel administrativo
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Servicios
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Administra precios, duración, categoría, retoques y estado de los
            servicios.
          </p>
        </div>

        <button
          type="button"
          onClick={services.openCreateModal}
          className="w-full rounded-xl bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 md:w-auto"
        >
          Nuevo servicio
        </button>
      </div>

      <AdminServicesSummary
        total={services.services.length}
        active={services.activeCount}
        inactive={services.inactiveCount}
        retouch={services.retouchCount}
      />

      {services.error && !services.isModalOpen && (
        <Alert type="error" message={services.error} />
      )}

      {services.success && !services.isModalOpen && (
        <Alert type="success" message={services.success} />
      )}

      <AdminServicesList
        services={services.services}
        loading={services.loading}
        onEdit={services.openEditModal}
        onToggleStatus={services.toggleStatus}
      />

      <AdminServiceModal services={services} />
    </div>
  )
}

export default AdminServicesPage
