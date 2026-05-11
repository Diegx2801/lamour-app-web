import type { useAdminServices } from "../../../features/admin-services/hooks/useAdminServices"
import { Alert, Field, serviceInputClass } from "./AdminServicesShared"

type AdminServicesState = ReturnType<typeof useAdminServices>

type AdminServiceModalProps = {
  services: AdminServicesState
}

function AdminServiceModal({ services }: AdminServiceModalProps) {
  if (!services.isModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/30 px-3 py-3 md:items-center md:px-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)] md:p-6">
        <div className="mb-5 flex items-start justify-between gap-3 md:mb-6">
          <div>
            <h2 className="text-xl font-semibold text-stone-950 md:text-2xl">
              {services.editingServiceId ? "Editar servicio" : "Nuevo servicio"}
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Completa los datos del servicio y su precio de retoque si aplica.
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
        {services.success && <Alert type="success" message={services.success} />}

        <form className="grid gap-4" onSubmit={services.handleSubmit}>
          <Field label="Nombre *">
            <input
              name="name"
              value={services.form.name}
              onChange={services.handleChange}
              placeholder="Ejemplo: Volumen Deluxe"
              className={serviceInputClass}
            />
          </Field>

          <Field label="Descripción">
            <textarea
              rows={3}
              name="description"
              value={services.form.description}
              onChange={services.handleChange}
              placeholder="Describe brevemente el servicio"
              className={`${serviceInputClass} resize-none`}
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
                className={serviceInputClass}
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
                className={serviceInputClass}
              />
            </Field>
          </div>

          <Field label="Categoría *">
            <input
              name="category"
              value={services.form.category}
              onChange={services.handleChange}
              placeholder="Ejemplo: Pestañas"
              className={serviceInputClass}
            />
          </Field>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <label className="flex items-center gap-3 text-sm font-medium text-stone-800">
              <input
                type="checkbox"
                name="is_package"
                checked={services.form.is_package}
                onChange={services.handleChange}
              />
              Este servicio es un paquete
            </label>

            {services.form.is_package && (
              <div className="mt-4">
                <p className="text-sm font-medium text-stone-800">
                  Servicios incluidos
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  La duración se calcula sola al seleccionar servicios, pero
                  puedes cambiarla manualmente arriba.
                </p>

                <div className="mt-3 grid max-h-52 gap-2 overflow-y-auto pr-1">
                  {services.packageBaseServices.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-stone-300 px-3 py-3 text-sm text-stone-500">
                      No hay servicios base activos para incluir.
                    </p>
                  ) : (
                    services.sortedPackageBaseServices.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm"
                      >
                        <span>
                          <span className="font-medium text-stone-900">
                            {service.name}
                          </span>
                          <span className="ml-2 text-xs text-stone-500">
                            {service.category ?? "Sin categoría"} -{" "}
                            {service.duration_minutes ?? 0} min - S/{" "}
                            {Number(service.price ?? 0).toFixed(2)}
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          checked={services.form.package_item_ids.includes(
                            service.id
                          )}
                          onChange={() => services.togglePackageItem(service.id)}
                        />
                      </label>
                    ))
                  )}
                </div>

                {services.form.package_item_ids.length > 0 && (
                  <div className="mt-4 grid gap-2 rounded-2xl border border-stone-200 bg-white p-4 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-stone-500">Total normal</p>
                      <p className="mt-1 font-semibold text-stone-950">
                        S/ {services.packageRegularTotal.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Precio paquete</p>
                      <p className="mt-1 font-semibold text-stone-950">
                        S/ {Number(services.form.price || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Ahorro cliente</p>
                      <p className="mt-1 font-semibold text-green-700">
                        S/ {services.packageSavings.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">Duración sugerida</p>
                      <button
                        type="button"
                        onClick={services.useAutoPackageDuration}
                        className="mt-1 text-left font-semibold text-stone-950 underline-offset-4 hover:underline"
                      >
                        {services.packageAutoDuration} min
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

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
                    className={serviceInputClass}
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
                    className={serviceInputClass}
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
  )
}

export default AdminServiceModal
