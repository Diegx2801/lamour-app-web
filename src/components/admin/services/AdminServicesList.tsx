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
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">
            Catalogo editable
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Los servicios activos aparecen en la web y en el flujo de reserva.
          </p>
        </div>
        <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
          {services.length} registros
        </span>
      </div>

      {loading ? (
        <StateBox text="Cargando servicios..." />
      ) : services.length === 0 ? (
        <StateBox text="No hay servicios registrados todavia." />
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
    </section>
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
      <table className="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            <th className="px-3 py-2">Servicio</th>
            <th className="px-3 py-2">Categoria</th>
            <th className="px-3 py-2">Orden</th>
            <th className="px-3 py-2">Precio</th>
            <th className="px-3 py-2">Retoque</th>
            <th className="px-3 py-2">Duracion</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {services.map((service) => (
            <tr key={service.id} className="group bg-stone-50">
              <td className="rounded-l-2xl border-y border-l border-stone-200 px-3 py-4 align-top">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-stone-950">{service.name}</p>
                  <ServiceFlags service={service} />
                </div>

                <p className="mt-1 max-w-lg text-sm leading-6 text-stone-500">
                  {service.description?.trim()
                    ? service.description
                    : "Sin descripcion"}
                </p>
              </td>

              <td className="border-y border-stone-200 px-3 py-4 align-top text-sm text-stone-700">
                {service.category ?? "Sin categoria"}
              </td>

              <td className="border-y border-stone-200 px-3 py-4 align-top text-sm font-semibold text-stone-900">
                {service.sort_order ?? 0}
              </td>

              <td className="border-y border-stone-200 px-3 py-4 align-top text-sm font-semibold text-stone-950">
                {formatPrice(service.price)}
              </td>

              <td className="border-y border-stone-200 px-3 py-4 align-top text-sm text-stone-700">
                {service.allows_retouch ? (
                  <div>
                    <p className="font-semibold text-stone-950">
                      {formatPrice(service.retouch_price)}
                    </p>
                    <p className="text-xs text-stone-500">
                      cada {service.retouch_days ?? 15} dias
                    </p>
                  </div>
                ) : (
                  <span className="text-stone-400">No aplica</span>
                )}
              </td>

              <td className="border-y border-stone-200 px-3 py-4 align-top text-sm text-stone-700">
                {service.duration_minutes ?? 0} min
              </td>

              <td className="border-y border-stone-200 px-3 py-4 align-top">
                <StatusBadge active={Boolean(service.is_active)} />
              </td>

              <td className="rounded-r-2xl border-y border-r border-stone-200 px-3 py-4 align-top">
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
          className="rounded-[1.35rem] border border-stone-200 bg-stone-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-stone-950">{service.name}</h2>
                <ServiceFlags service={service} />
              </div>

              <p className="mt-1 text-sm text-stone-500">
                {service.category ?? "Sin categoria"} · Orden{" "}
                {service.sort_order ?? 0}
              </p>
            </div>

            <StatusBadge active={Boolean(service.is_active)} />
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">
            {service.description?.trim()
              ? service.description
              : "Sin descripcion"}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoBox label="Precio" value={formatPrice(service.price)} />
            <InfoBox
              label="Duracion"
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
              label="Dias"
              value={
                service.allows_retouch
                  ? `${service.retouch_days ?? 15} dias`
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

function ServiceFlags({ service }: { service: AdminServiceRow }) {
  return (
    <>
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
    </>
  )
}

function StateBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
      {text}
    </div>
  )
}

export default AdminServicesList
