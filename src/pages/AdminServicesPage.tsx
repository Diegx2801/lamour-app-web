import { Link } from "react-router"
import { useAdminServices } from "../features/admin-services/hooks/useAdminServices"

function AdminServicesPage() {
  const services = useAdminServices()

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/admin/dashboard"
              className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
            >
              ← Volver al dashboard
            </Link>

            <h1 className="mt-3 text-4xl font-semibold text-stone-950">
              Servicios
            </h1>

            <p className="mt-2 text-sm text-stone-600">
              Administra precios, duración, categoría y estado de los servicios.
            </p>
          </div>

          <button
            type="button"
            onClick={services.openCreateModal}
            className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            Nuevo servicio
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <SummaryCard title="Total servicios" value={services.services.length} />
          <SummaryCard title="Activos" value={services.activeCount} />
          <SummaryCard title="Inactivos" value={services.inactiveCount} />
        </div>

        {services.error && !services.isModalOpen && (
          <Alert type="error" message={services.error} />
        )}

        {services.success && !services.isModalOpen && (
          <Alert type="success" message={services.success} />
        )}

        <div className="rounded-[2rem] bg-white p-6 shadow-sm">
          {services.loading ? (
            <p className="text-sm text-stone-500">Cargando servicios...</p>
          ) : services.services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-500">
              No hay servicios registrados todavía.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-stone-500">
                    <th className="px-3">Servicio</th>
                    <th className="px-3">Categoría</th>
                    <th className="px-3">Precio</th>
                    <th className="px-3">Duración</th>
                    <th className="px-3">Estado</th>
                    <th className="px-3">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {services.services.map((service) => (
                    <tr key={service.id} className="rounded-2xl bg-stone-50">
                      <td className="rounded-l-2xl px-3 py-4 align-top">
                        <p className="font-medium text-stone-950">
                          {service.name}
                        </p>

                        <p className="mt-1 text-sm text-stone-500">
                          {service.description?.trim()
                            ? service.description
                            : "Sin descripción"}
                        </p>
                      </td>

                      <td className="px-3 py-4 align-top text-sm text-stone-700">
                        {service.category ?? "Sin categoría"}
                      </td>

                      <td className="px-3 py-4 align-top text-sm font-medium text-stone-900">
                        S/ {Number(service.price ?? 0).toFixed(2)}
                      </td>

                      <td className="px-3 py-4 align-top text-sm text-stone-700">
                        {service.duration_minutes ?? 0} min
                      </td>

                      <td className="px-3 py-4 align-top">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            service.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-stone-200 text-stone-700"
                          }`}
                        >
                          {service.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="rounded-r-2xl px-3 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => services.openEditModal(service)}
                            className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-medium text-stone-700"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => services.toggleStatus(service)}
                            className={`rounded-lg px-3 py-2 text-xs font-medium ${
                              service.is_active
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {service.is_active ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {services.isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-stone-950">
                    {services.editingServiceId
                      ? "Editar servicio"
                      : "Nuevo servicio"}
                  </h2>

                  <p className="mt-1 text-sm text-stone-500">
                    Completa los datos del servicio.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={services.closeModal}
                  className="rounded-full border border-stone-300 px-3 py-1 text-sm text-stone-700"
                >
                  Cerrar
                </button>
              </div>

              {services.error && <Alert type="error" message={services.error} />}
              {services.success && (
                <Alert type="success" message={services.success} />
              )}

              <form className="grid gap-4" onSubmit={services.handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-800">
                    Nombre *
                  </label>
                  <input
                    name="name"
                    value={services.form.name}
                    onChange={services.handleChange}
                    placeholder="Ejemplo: Volumen Deluxe"
                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-800">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    name="description"
                    value={services.form.description}
                    onChange={services.handleChange}
                    placeholder="Describe brevemente el servicio"
                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-800">
                      Precio *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="price"
                      value={services.form.price}
                      onChange={services.handleChange}
                      placeholder="Ejemplo: 120"
                      className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-stone-800">
                      Duración en minutos *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      name="duration_minutes"
                      value={services.form.duration_minutes}
                      onChange={services.handleChange}
                      placeholder="Ejemplo: 120"
                      className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-stone-800">
                    Categoría *
                  </label>
                  <input
                    name="category"
                    value={services.form.category}
                    onChange={services.handleChange}
                    placeholder="Ejemplo: Pestañas"
                    className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={services.form.is_active}
                    onChange={services.handleChange}
                  />
                  Servicio activo
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={services.closeModal}
                    disabled={services.saving}
                    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 disabled:opacity-60"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={services.saving}
                    className="rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {services.saving
                      ? "Guardando..."
                      : services.editingServiceId
                      ? "Guardar cambios"
                      : "Crear servicio"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{title}</p>
      <h2 className="mt-3 text-3xl font-semibold text-stone-950">{value}</h2>
    </div>
  )
}

function Alert({
  type,
  message,
}: {
  type: "error" | "success"
  message: string
}) {
  const classes =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-green-200 bg-green-50 text-green-700"

  return (
    <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${classes}`}>
      {message}
    </div>
  )
}

export default AdminServicesPage