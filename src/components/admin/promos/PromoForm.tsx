import type { ChangeEvent, FormEvent } from "react"
import type {
  PromoFormValues,
  PromoServiceOption,
} from "../../../features/promos/api/promoService"

type PromoFormProps = {
  form: PromoFormValues
  editingId: string | null
  errorMessage: string
  saving: boolean
  uploadingImage: boolean
  services: PromoServiceOption[]
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancelEdit: () => void
  onFieldChange: <Field extends keyof PromoFormValues>(
    field: Field,
    value: PromoFormValues[Field]
  ) => void
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void
}

function PromoForm({
  form,
  editingId,
  errorMessage,
  saving,
  uploadingImage,
  services,
  onSubmit,
  onCancelEdit,
  onFieldChange,
  onImageChange,
}: PromoFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-10 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-xl font-semibold text-stone-950">
        {editingId ? "Editar promoción" : "Crear promoción"}
      </h2>

      {errorMessage && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Título</span>
          <input
            value={form.title}
            onChange={(event) => onFieldChange("title", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
            placeholder="Ej: Pack Día de la Madre"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Precio</span>
          <input
            value={form.price}
            onChange={(event) => onFieldChange("price", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
            placeholder="Ej: S/ 120"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Etiqueta</span>
          <input
            value={form.tag}
            onChange={(event) => onFieldChange("tag", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
            placeholder="Ej: Promo, Nuevo, Especial"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">
            Servicio vinculado
          </span>
          <select
            value={form.service_id}
            onChange={(event) =>
              onFieldChange("service_id", event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
          >
            <option value="">Sin servicio vinculado</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - S/ {Number(service.price).toFixed(2)}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-stone-700">
            Imagen de la promoción
          </span>

          <input
            type="file"
            accept="image/*"
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm"
            onChange={onImageChange}
          />

          {uploadingImage && (
            <p className="mt-2 text-sm text-stone-500">Subiendo imagen...</p>
          )}

          {form.image_url && (
            <img
              src={form.image_url}
              alt="Vista previa de la promoción"
              className="mt-4 h-44 w-full rounded-2xl object-cover"
            />
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Orden</span>
          <input
            type="number"
            value={form.sort_order}
            onChange={(event) =>
              onFieldChange("sort_order", Number(event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
            placeholder="Ej: 1"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">
            Inicio de promo
          </span>
          <input
            type="date"
            value={form.start_date}
            onChange={(event) =>
              onFieldChange("start_date", event.target.value)
            }
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">
            Fin de promo
          </span>
          <input
            type="date"
            value={form.end_date}
            onChange={(event) => onFieldChange("end_date", event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-stone-700">
            Descripción
          </span>
          <textarea
            value={form.description}
            onChange={(event) =>
              onFieldChange("description", event.target.value)
            }
            rows={4}
            className="mt-2 w-full resize-none rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
            placeholder="Describe qué incluye la promoción."
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              onFieldChange("is_active", event.target.checked)
            }
            className="h-4 w-4"
          />
          <span className="text-sm font-medium text-stone-700">
            Mostrar en home
          </span>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {saving
            ? "Guardando..."
            : editingId
              ? "Guardar cambios"
              : "Crear promo"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  )
}

export default PromoForm
