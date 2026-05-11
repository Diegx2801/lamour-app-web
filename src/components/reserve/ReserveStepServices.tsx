import type { ServiceRow } from "../../features/reservations/api/reservationService"

type CategoryCard = {
  title: string
  subtitle: string
  services: ServiceRow[]
}

type SelectedServiceData = {
  name: string
  price: number
  category: string | null
  duration_minutes: number | null
  is_package?: boolean
  package_includes_lashes?: boolean
  package_items?: ServiceRow["package_items"]
} | null

type ReserveStepServicesProps = {
  loadingServices: boolean
  categoryCards: CategoryCard[]
  activeCategory: string
  formData: {
    serviceId: string
  }
  selectedServiceData: SelectedServiceData
  onCategoryChange: (categoryTitle: string) => void
  onSelectService: (serviceId: string) => void
}

function ReserveStepServices({
  loadingServices,
  categoryCards,
  activeCategory,
  formData,
  selectedServiceData,
  onCategoryChange,
  onSelectService,
}: ReserveStepServicesProps) {
  return (
    <div className="space-y-5">
      {loadingServices && (
        <p className="text-sm text-stone-500">Cargando servicios...</p>
      )}

      {!loadingServices && categoryCards.length > 0 && (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
            {categoryCards.map((category) => {
              const isActive = activeCategory === category.title

              return (
                <button
                  key={category.title}
                  type="button"
                  onClick={() => onCategoryChange(category.title)}
                  className={`min-w-fit rounded-full border px-4 py-3 text-sm font-semibold transition sm:py-2 sm:text-xs ${
                    isActive
                      ? "border-stone-950 bg-stone-950 text-white"
                      : "border-stone-300 text-stone-700 hover:border-stone-500"
                  }`}
                >
                  {category.title}
                </button>
              )
            })}
          </div>

          {selectedServiceData && (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              <p className="font-semibold text-stone-950">
                Servicio seleccionado
              </p>
              <div className="mt-2 grid gap-1 sm:grid-cols-2">
                <p>{selectedServiceData.name}</p>
                <p>S/ {Number(selectedServiceData.price).toFixed(2)}</p>
                <p>{selectedServiceData.category ?? "Sin categoría"}</p>
                <p>{selectedServiceData.duration_minutes ?? 0} min</p>
                {selectedServiceData.is_package && <p>Paquete promo</p>}
                {selectedServiceData.package_includes_lashes && (
                  <p>Usa lashista</p>
                )}
              </div>
              {selectedServiceData.is_package &&
                selectedServiceData.package_items &&
                selectedServiceData.package_items.length > 0 && (
                  <div className="mt-4 rounded-xl bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Incluye
                    </p>
                    <ul className="mt-2 grid gap-2">
                      {selectedServiceData.package_items.map((item) => (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600"
                        >
                          <span className="font-medium text-stone-900">
                            {item.name}
                          </span>
                          <span>
                            {item.category ?? "Servicio"} -{" "}
                            {item.duration_minutes ?? 0} min
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {categoryCards
            .filter((category) => category.title === activeCategory)
            .map((category) => (
              <div key={category.title}>
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-stone-950">
                    {category.title}
                  </h3>
                  <p className="text-sm text-stone-500">{category.subtitle}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {category.services.map((service) => {
                    const isSelected = formData.serviceId === service.id

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => onSelectService(service.id)}
                        className={`min-h-24 rounded-2xl border px-4 py-4 text-left transition ${
                          isSelected
                            ? "border-stone-950 bg-stone-950 text-white"
                            : "border-stone-200 bg-white hover:border-stone-400"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-base font-semibold leading-tight sm:text-sm">
                            {service.name}
                          </p>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
                              isSelected
                                ? "bg-white text-stone-950"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                         S/ {Number(service.price).toFixed(2)}
                          </span>
                        </div>

                       <p
  className={`mt-1 text-xs leading-tight ${
    isSelected ? "text-stone-200" : "text-stone-500"
  }`}
>
  {service.category ?? "Servicio disponible"}
  {service.is_package ? " - Paquete" : ""}
</p>

<div
  className={`mt-2 flex flex-wrap gap-2 text-[10px] ${
    isSelected ? "text-stone-200" : "text-stone-500"
  }`}
>
  {service.duration_minutes ? (
    <span>{service.duration_minutes} min</span>
  ) : null}
  {service.package_includes_lashes ? <span>Usa lashista</span> : null}
</div>
{service.is_package &&
  service.package_items &&
  service.package_items.length > 0 && (
    <div
      className={`mt-3 border-t pt-3 text-[10px] leading-4 ${
        isSelected
          ? "border-white/20 text-stone-200"
          : "border-stone-100 text-stone-500"
      }`}
    >
      {service.package_items.slice(0, 3).map((item) => (
        <p key={item.id}>{item.name}</p>
      ))}
      {service.package_items.length > 3 && (
        <p>+{service.package_items.length - 3} servicios más</p>
      )}
    </div>
  )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

        </>
      )}

      {!loadingServices && categoryCards.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-4 text-sm text-stone-500">
          No hay servicios disponibles en este momento.
        </div>
      )}
    </div>
  )
}

export default ReserveStepServices
