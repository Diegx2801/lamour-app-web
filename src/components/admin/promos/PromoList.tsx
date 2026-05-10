import type { PromoRow } from "../../../features/promos/api/promoService"

type PromoListProps = {
  promos: PromoRow[]
  loading: boolean
  onEdit: (promo: PromoRow) => void
  onToggle: (promo: PromoRow) => void
  onDelete: (promo: PromoRow) => void
}

function PromoList({
  promos,
  loading,
  onEdit,
  onToggle,
  onDelete,
}: PromoListProps) {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-stone-950">
        Promociones registradas
      </h2>

      {loading ? (
        <p className="mt-4 text-sm text-stone-500">Cargando promociones...</p>
      ) : promos.length === 0 ? (
        <p className="mt-4 text-sm text-stone-500">
          Todavía no hay promociones registradas.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-3 pr-4 font-medium">Orden</th>
                <th className="py-3 pr-4 font-medium">Promo</th>
                <th className="py-3 pr-4 font-medium">Precio</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 pr-4 font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {promos.map((promo) => (
                <tr key={promo.id} className="border-b border-stone-100">
                  <td className="py-4 pr-4 text-stone-600">
                    {promo.sort_order ?? 0}
                  </td>

                  <td className="py-4 pr-4">
                    <p className="font-medium text-stone-950">
                      {promo.title}
                    </p>
                    <p className="mt-1 max-w-xl text-xs leading-5 text-stone-500">
                      {promo.description}
                    </p>
                  </td>

                  <td className="py-4 pr-4 font-medium text-stone-950">
                    {promo.price}
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        promo.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {promo.is_active ? "Activa" : "Oculta"}
                    </span>
                  </td>

                  <td className="py-4 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(promo)}
                        className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-800 transition hover:bg-stone-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggle(promo)}
                        className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-800 transition hover:bg-stone-50"
                      >
                        {promo.is_active ? "Ocultar" : "Activar"}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(promo)}
                        className="rounded-full border border-red-200 px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50"
                      >
                        Eliminar
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
  )
}

export default PromoList
