import AdminServiceModal from "../components/admin/services/AdminServiceModal"
import AdminServicesList from "../components/admin/services/AdminServicesList"
import AdminServicesSummary from "../components/admin/services/AdminServicesSummary"
import { Alert } from "../components/admin/services/AdminServicesShared"
import { useAdminServices } from "../features/admin-services/hooks/useAdminServices"

function AdminServicesPage() {
  const services = useAdminServices()

  return (
    <div className="pb-8">
      <section className="mb-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Catalogo del negocio
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Servicios
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Administra precios, duracion, categoria, orden, paquetes,
              retoques y visibilidad para la web y reservas.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:items-stretch">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Visibles
              </p>
              <p className="mt-1 text-xl font-semibold text-stone-950">
                {services.activeCount}
              </p>
            </div>

            <button
              type="button"
              onClick={services.openCreateModal}
              className="rounded-2xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800"
            >
              Nuevo servicio
            </button>
          </div>
        </div>
      </section>

      <AdminServicesSummary
        total={services.services.length}
        active={services.activeCount}
        inactive={services.inactiveCount}
        retouch={services.retouchCount}
        packages={services.packageCount}
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
