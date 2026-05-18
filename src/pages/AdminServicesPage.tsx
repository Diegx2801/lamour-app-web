import { useMemo, useState } from "react"
import AdminServiceModal from "../components/admin/services/AdminServiceModal"
import AdminServicesList from "../components/admin/services/AdminServicesList"
import AdminServicesSummary from "../components/admin/services/AdminServicesSummary"
import { Alert } from "../components/admin/services/AdminServicesShared"
import { useAdminServices } from "../features/admin-services/hooks/useAdminServices"

const preferredCategoryOrder = [
  "Pestañas",
  "Cejas",
  "Depilación",
  "Faciales",
  "Labios",
  "Paquetes",
]

function normalizeCategory(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function getCategoryOrder(category: string) {
  const normalized = normalizeCategory(category)
  const index = preferredCategoryOrder.findIndex(
    (item) => normalizeCategory(item) === normalized
  )

  return index === -1 ? 99 : index
}

function AdminServicesPage() {
  const services = useAdminServices()
  const [categoryFilter, setCategoryFilter] = useState("all")

  const categoryFilters = useMemo(() => {
    const categories = Array.from(
      new Set(
        services.services
          .map((service) => service.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    ).sort((a, b) => {
      const order = getCategoryOrder(a) - getCategoryOrder(b)
      if (order !== 0) return order
      return a.localeCompare(b, "es")
    })

    return categories.map((category) => ({
      category,
      count: services.services.filter((service) => service.category === category)
        .length,
    }))
  }, [services.services])

  const visibleServices = useMemo(() => {
    if (categoryFilter === "all") return services.services
    return services.services.filter(
      (service) => service.category === categoryFilter
    )
  }, [categoryFilter, services.services])

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

      <section className="mb-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">
              Ver por categoria
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Los inactivos se mantienen al final de cada vista.
            </p>
          </div>
          <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            {visibleServices.length} mostrados
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              categoryFilter === "all"
                ? "bg-stone-950 text-white"
                : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
            }`}
          >
            Todas · {services.services.length}
          </button>

          {categoryFilters.map((item) => (
            <button
              key={item.category}
              type="button"
              onClick={() => setCategoryFilter(item.category)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                categoryFilter === item.category
                  ? "bg-stone-950 text-white"
                  : "border border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
              }`}
            >
              {item.category} · {item.count}
            </button>
          ))}
        </div>
      </section>

      <AdminServicesList
        services={visibleServices}
        loading={services.loading}
        onEdit={services.openEditModal}
        onToggleStatus={services.toggleStatus}
      />

      <AdminServiceModal services={services} />
    </div>
  )
}

export default AdminServicesPage
