import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import {
  createPromo,
  deletePromo,
  fetchAdminPromos,
  togglePromoStatus,
  updatePromo,
  uploadPromoImage,
  type PromoFormValues,
  type PromoRow,
} from "../../features/promos/api/promoService"

const emptyForm: PromoFormValues = {
  title: "",
  description: "",
  price: "",
  tag: "Promo",
  image_url: "",
  is_active: true,
  sort_order: 0,
}

function AdminPromosPage() {
  const [promos, setPromos] = useState<PromoRow[]>([])
  const [form, setForm] = useState<PromoFormValues>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
const [uploadingImage, setUploadingImage] = useState(false)
  const loadPromos = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminPromos()
      setPromos(data)
    } catch (error) {
      console.error(error)
      setErrorMessage("No se pudieron cargar las promociones.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromos()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")

    if (!form.title.trim() || !form.description.trim() || !form.price.trim()) {
      setErrorMessage("Completa título, descripción y precio.")
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        await updatePromo(editingId, form)
      } else {
        await createPromo(form)
      }

      setForm(emptyForm)
      setEditingId(null)
      await loadPromos()
    } catch (error) {
      console.error(error)
      setErrorMessage("No se pudo guardar la promoción.")
    } finally {
      setSaving(false)
    }
  }

const handleEdit = (promo: PromoRow) => {
  setEditingId(promo.id)

  setForm({
    title: promo.title,
    description: promo.description,
    price: promo.price,
    tag: promo.tag ?? "Promo",
    image_url: promo.image_url ?? "",
    is_active: promo.is_active,
    sort_order: promo.sort_order ?? 0,
  })


    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setErrorMessage("")
  }

  const handleToggle = async (promo: PromoRow) => {
    try {
      await togglePromoStatus(promo.id, !promo.is_active)
      await loadPromos()
    } catch (error) {
      console.error(error)
      setErrorMessage("No se pudo cambiar el estado.")
    }
  }

  const handleDelete = async (promo: PromoRow) => {
    const confirmDelete = window.confirm(
      `¿Eliminar la promoción "${promo.title}"?`
    )

    if (!confirmDelete) return

    try {
      await deletePromo(promo.id)
      await loadPromos()
    } catch (error) {
      console.error(error)
      setErrorMessage("No se pudo eliminar la promoción.")
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
          Administración
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-stone-950">
          Promociones del home
        </h1>

        <p className="mt-2 text-sm text-stone-600">
          Crea, edita, activa o desactiva las promociones que aparecen en la
          página principal.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
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
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
              placeholder="Ej: Pack Día de la Madre"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">Precio</span>
            <input
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
              placeholder="Ej: S/ 120"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-stone-700">
              Etiqueta
            </span>
            <input
              value={form.tag}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  tag: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
              placeholder="Ej: Promo, Nuevo, Especial"
            />
          </label>
<label className="block md:col-span-2">
  <span className="text-sm font-medium text-stone-700">
    Imagen de la promoción
  </span>

  <input
    type="file"
    accept="image/*"
    className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm"
    onChange={async (event) => {
      const file = event.target.files?.[0]

      if (!file) return

      try {
        setUploadingImage(true)

        const imageUrl = await uploadPromoImage(file)

        setForm((current) => ({
          ...current,
          image_url: imageUrl,
        }))
      } catch (error) {
        console.error(error)
        alert("No se pudo subir la imagen.")
      } finally {
        setUploadingImage(false)
      }
    }}
  />

  {uploadingImage && (
    <p className="mt-2 text-sm text-stone-500">
      Subiendo imagen...
    </p>
  )}

  {form.image_url && (
    <img
      src={form.image_url}
      alt="Preview"
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
                setForm((current) => ({
                  ...current,
                  sort_order: Number(event.target.value),
                }))
              }
              className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-500"
              placeholder="Ej: 1"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-stone-700">
              Descripción
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
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
                setForm((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
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
              onClick={handleCancelEdit}
              className="rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

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
                          onClick={() => handleEdit(promo)}
                          className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-800 transition hover:bg-stone-50"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggle(promo)}
                          className="rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-800 transition hover:bg-stone-50"
                        >
                          {promo.is_active ? "Ocultar" : "Activar"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(promo)}
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
    </div>
  )
}

export default AdminPromosPage