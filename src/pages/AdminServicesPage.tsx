import { useAdminServices } from "../features/admin-services/hooks/useAdminServices"

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:bg-stone-100 disabled:text-stone-500"

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

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-4 md:mb-6">
        <SummaryCard title="Total servicios" value={services.services.length} />
        <SummaryCard title="Activos" value={services.activeCount} />
        <SummaryCard title="Inactivos" value={services.inactiveCount} />
        <SummaryCard title="Con retoque" value={services.retouchCount} />
      </div>

      {services.error && !services.isModalOpen && (
        <Alert type="error" message={services.error} />
      )}

      {services.success && !services.isModalOpen && (
        <Alert type="success" message={services.success} />
      )}

      <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
        {services.loading ? (
          <p className="text-sm text-stone-500">Cargando servicios...</p>
        ) : services.services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-500">
            No hay servicios registrados todavía.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto xl:block">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-sm text-stone-500">
                    <th className="px-3">Servicio</th>
                    <th className="px-3">Categoría</th>
                    <th className="px-3">Precio</th>
                    <th className="px-3">Retoque</th>
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

                        <p className="mt-1 max-w-md text-sm leading-6 text-stone-500">
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
                        {service.allows_retouch ? (
                          <div>
                            <p className="font-medium text-stone-900">
                              S/ {Number(service.retouch_price ?? 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-stone-500">
                              cada {service.retouch_days ?? 15} días
                            </p>
                          </div>
                        ) : (
                          <span className="text-stone-400">No aplica</span>
                        )}
                      </td>

                      <td className="px-3 py-4 align-top text-sm text-stone-700">
                        {service.duration_minutes ?? 0} min
                      </td>

                      <td className="px-3 py-4 align-top">
                        <StatusBadge active={Boolean(service.is_active)} />
                      </td>

                      <td className="rounded-r-2xl px-3 py-4 align-top">
                        <ServiceActions
                          active={Boolean(service.is_active)}
                          onEdit={() => services.openEditModal(service)}
                          onToggle={() => services.toggleStatus(service)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 xl:hidden">
              {services.services.map((service) => (
                <article
                  key={service.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-stone-950">
                        {service.name}
                      </h2>

                      <p className="mt-1 text-sm text-stone-500">
                        {service.category ?? "Sin categoría"}
                      </p>
                    </div>

                    <StatusBadge active={Boolean(service.is_active)} />
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
                    {service.description?.trim()
                      ? service.description
                      : "Sin descripción"}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <InfoBox
                      label="Precio normal"
                      value={`S/ ${Number(service.price ?? 0).toFixed(2)}`}
                    />

                    <InfoBox
                      label="Duración"
                      value={`${service.duration_minutes ?? 0} min`}
                    />

                    <InfoBox
                      label="Retoque"
                      value={
                        service.allows_retouch
                          ? `S/ ${Number(service.retouch_price ?? 0).toFixed(2)}`
                          : "No aplica"
                      }
                    />

                    <InfoBox
                      label="Días retoque"
                      value={
                        service.allows_retouch
                          ? `${service.retouch_days ?? 15} días`
                          : "-"
                      }
                    />
                  </div>

                  <div className="mt-4">
                    <ServiceActions
                      active={Boolean(service.is_active)}
                      onEdit={() => services.openEditModal(service)}
                      onToggle={() => services.toggleStatus(service)}
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {services.isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-3 py-3 md:items-center md:px-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] md:p-6">
            <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
              <div>
                <h2 className="text-xl font-semibold text-stone-950 md:text-2xl">
                  {services.editingServiceId
                    ? "Editar servicio"
                    : "Nuevo servicio"}
                </h2>

                <p className="mt-1 text-sm text-stone-500">
                  Completa los datos del servicio y su precio de retoque si
                  aplica.
                </p>
              </div>

              <button
                type="button"
                onClick={services.closeModal}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-sm text-stone-700"
              >
                Cerrar
              </button>
            </div>

            {services.error && <Alert type="error" message={services.error} />}
            {services.success && (
              <Alert type="success" message={services.success} />
            )}

            <form className="grid gap-4" onSubmit={services.handleSubmit}>
              <Field label="Nombre *">
                <input
                  name="name"
                  value={services.form.name}
                  onChange={services.handleChange}
                  placeholder="Ejemplo: Volumen Deluxe"
                  className={inputClass}
                />
              </Field>

              <Field label="Descripción">
                <textarea
                  rows={3}
                  name="description"
                  value={services.form.description}
                  onChange={services.handleChange}
                  placeholder="Describe brevemente el servicio"
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Precio normal *">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="price"
                    value={services.form.price}
                    onChange={services.handleChange}
                    placeholder="Ejemplo: 120"
                    className={inputClass}
                  />
                </Field>

                <Field label="Duración en minutos *">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="duration_minutes"
                    value={services.form.duration_minutes}
                    onChange={services.handleChange}
                    placeholder="Ejemplo: 120"
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Categoría *">
                <input
                  name="category"
                  value={services.form.category}
                  onChange={services.handleChange}
                  placeholder="Ejemplo: Pestañas"
                  className={inputClass}
                />
              </Field>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <label className="flex items-center gap-3 text-sm font-medium text-stone-800">
                  <input
                    type="checkbox"
                    name="allows_retouch"
                    checked={services.form.allows_retouch}
                    onChange={services.handleChange}
                  />
                  Este servicio permite retoque
                </label>

                {services.form.allows_retouch && (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <Field label="Precio de retoque *">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="retouch_price"
                        value={services.form.retouch_price}
                        onChange={services.handleChange}
                        placeholder="Ejemplo: 40"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Días para retoque *">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        name="retouch_days"
                        value={services.form.retouch_days}
                        onChange={services.handleChange}
                        placeholder="Ejemplo: 15"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={services.form.is_active}
                  onChange={services.handleChange}
                />
                Servicio activo
              </label>

              <div className="grid gap-3 pt-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={services.closeModal}
                  disabled={services.saving}
                  className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={services.saving}
                  className="rounded-xl bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
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
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
      <p className="text-sm text-stone-500">{title}</p>
      <h2 className="mt-2 text-2xl font-semibold text-stone-950 md:text-3xl">
        {value}
      </h2>
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`min-w-fit rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-700"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  )
}

function ServiceActions({
  active,
  onEdit,
  onToggle,
}: {
  active: boolean
  onEdit: () => void
  onToggle: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700"
      >
        Editar
      </button>

      <button
        type="button"
        onClick={onToggle}
        className={`rounded-lg px-3 py-2 text-xs font-medium ${
          active ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}
      >
        {active ? "Desactivar" : "Activar"}
      </button>
    </div>
  )
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-[11px] uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-stone-950">{value}</p>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-800">
        {label}
      </span>
      {children}
    </label>
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