import type { AdminServiceRow } from "../../../features/admin-services/api/adminServicesService"
import { InfoBox, ServiceActions, StatusBadge } from "./AdminServicesShared"

type AdminServicesListProps = {
  services: AdminServiceRow[]
  loading: boolean
  onEdit: (service: AdminServiceRow) => void
  onToggleStatus: (service: AdminServiceRow) => void
}

function formatPrice(value: number | null | undefined) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`
}

function AdminServicesList({
  services,
  loading,
  onEdit,
  onToggleStatus,
}: AdminServicesListProps) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
      {loading ? (
        <p className="text-sm text-stone-500">Cargando servicios...</p>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-5 text-sm text-stone-500">
          No hay servicios registrados todavía.
        </div>
      ) : (
        <>
          <ServicesTable
            services={services}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
          />
          <ServicesCards
            services={services}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
          />
        </>
      )}
    </div>
  )
}

function ServicesTable({
  services,
  onEdit,
  onToggleStatus,
}: {
  services: AdminServiceRow[]
  onEdit: (service: AdminServiceRow) => void
  onToggleStatus: (service: AdminServiceRow) => void
}) {
  return (
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
          {services.map((service) => (
            <tr key={service.id} className="rounded-2xl bg-stone-50">
              <td className="rounded-l-2xl px-3 py-4 align-top">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-stone-950">{service.name}</p>
                  {service.is_package && (
                    <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Paquete
                    </span>
                  )}
                  {service.package_includes_lashes && (
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-pink-700">
                      Usa lashista
                    </span>
                  )}
                </div>

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
                {formatPrice(service.price)}
              </td>

              <td className="px-3 py-4 align-top text-sm text-stone-700">
                {service.allows_retouch ? (
                  <div>
                    <p className="font-medium text-stone-900">
                      {formatPrice(service.retouch_price)}
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
                  onEdit={() => onEdit(service)}
                  onToggle={() => onToggleStatus(service)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ServicesCards({
  services,
  onEdit,
  onToggleStatus,
}: {
  services: AdminServiceRow[]
  onEdit: (service: AdminServiceRow) => void
  onToggleStatus: (service: AdminServiceRow) => void
}) {
  return (
    <div className="grid gap-3 xl:hidden">
      {services.map((service) => (
        <article
          key={service.id}
          className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-stone-950">{service.name}</h2>
              {service.is_package && (
                <span className="mt-2 inline-flex rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Paquete
                </span>
              )}

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
            <InfoBox label="Precio normal" value={formatPrice(service.price)} />

            <InfoBox
              label="Duración"
              value={`${service.duration_minutes ?? 0} min`}
            />

            <InfoBox
              label="Retoque"
              value={
                service.allows_retouch
                  ? formatPrice(service.retouch_price)
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
              onEdit={() => onEdit(service)}
              onToggle={() => onToggleStatus(service)}
            />
          </div>
        </article>
      ))}
    </div>
  )
}

export default AdminServicesList
