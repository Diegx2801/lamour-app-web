import { useAdminSiteContent } from "../features/site-content/hooks/useAdminSiteContent"
import type { SiteContentItem } from "../features/site-content/api/siteContentService"

function getSectionLabel(section: string) {
  return section === "hero" ? "Carrusel principal" : "Galería"
}

function AdminSiteContentPage() {
  const content = useAdminSiteContent()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Web
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Contenido web
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Edita las fotos y textos del carrusel principal y la galería sin
            tocar código.
          </p>
        </div>

        <button
          type="button"
          onClick={content.reload}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Actualizar
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <SummaryCard label="Total" value={content.summary.total} />
        <SummaryCard label="Activos" value={content.summary.active} />
        <SummaryCard label="Carrusel" value={content.summary.hero} />
        <SummaryCard label="Galería" value={content.summary.gallery} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
          <h2 className="text-lg font-semibold text-stone-950">
            {content.editingId ? "Editar contenido" : "Nuevo contenido"}
          </h2>

          <form onSubmit={content.handleSubmit} className="mt-5 space-y-4">
            <Field label="Sección" htmlFor="content-section">
              <select
                id="content-section"
                value={content.form.section}
                onChange={(event) =>
                  content.updateForm(
                    "section",
                    event.target.value as "hero" | "gallery"
                  )
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
              >
                <option value="hero">Carrusel principal</option>
                <option value="gallery">Galería</option>
              </select>
            </Field>

            <Field label="Título" htmlFor="content-title">
              <input
                id="content-title"
                value={content.form.title}
                onChange={(event) =>
                  content.updateForm("title", event.target.value)
                }
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                placeholder="Ej. Pack Cejas Glow"
              />
            </Field>

            <Field label="Texto corto" htmlFor="content-subtitle">
              <textarea
                id="content-subtitle"
                value={content.form.subtitle}
                onChange={(event) =>
                  content.updateForm("subtitle", event.target.value)
                }
                className="min-h-24 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                placeholder="Texto visible sobre la imagen principal."
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoría" htmlFor="content-category">
                <input
                  id="content-category"
                  value={content.form.category}
                  onChange={(event) =>
                    content.updateForm("category", event.target.value)
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                  placeholder="Cejas, Pestañas..."
                />
              </Field>

              <Field label="Orden" htmlFor="content-order">
                <input
                  id="content-order"
                  type="number"
                  value={content.form.sort_order}
                  onChange={(event) =>
                    content.updateForm("sort_order", Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                />
              </Field>
            </div>

            <Field label="Imagen" htmlFor="content-image">
              <div className="space-y-3">
                <input
                  id="content-image"
                  type="file"
                  accept="image/*"
                  onChange={content.handleImageChange}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
                />

                <input
                  value={content.form.image_url}
                  onChange={(event) =>
                    content.updateForm("image_url", event.target.value)
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                  placeholder="URL de imagen"
                />

                {content.form.image_url && (
                  <img
                    src={content.form.image_url}
                    alt=""
                    className="aspect-video w-full rounded-2xl object-cover"
                  />
                )}
              </div>
            </Field>

            <label className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={content.form.is_active}
                onChange={(event) =>
                  content.updateForm("is_active", event.target.checked)
                }
                className="h-4 w-4"
              />
              Visible en la web
            </label>

            <div className="grid gap-2 sm:flex">
              <button
                type="submit"
                disabled={content.saving || content.uploading}
                className="rounded-xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
              >
                {content.uploading
                  ? "Subiendo imagen..."
                  : content.saving
                  ? "Guardando..."
                  : content.editingId
                  ? "Guardar cambios"
                  : "Crear contenido"}
              </button>

              {content.editingId && (
                <button
                  type="button"
                  onClick={content.resetForm}
                  className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
          <h2 className="text-lg font-semibold text-stone-950">
            Contenido publicado
          </h2>

          {content.loading && (
            <p className="mt-5 text-sm text-stone-500">Cargando contenido...</p>
          )}

          {content.error && (
            <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {content.error}
            </p>
          )}

          <div className="mt-5 grid gap-3">
            {content.items.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                onEdit={() => content.startEdit(item)}
                onToggle={() => content.toggleStatus(item)}
                onDelete={() => content.deleteItem(item)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-stone-700">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function ContentCard({
  item,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: SiteContentItem
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200">
      <div className="grid gap-3 p-3 sm:grid-cols-[140px_1fr]">
        <img
          src={item.image_url}
          alt={item.title}
          className="aspect-video w-full rounded-xl object-cover sm:aspect-square"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
              {getSectionLabel(item.section)}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                item.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-stone-200 text-stone-600"
              }`}
            >
              {item.is_active ? "Activo" : "Inactivo"}
            </span>

            <span className="rounded-full bg-white px-2 py-1 text-xs text-stone-500">
              Orden {item.sort_order}
            </span>
          </div>

          <h3 className="mt-3 font-semibold text-stone-950">{item.title}</h3>
          <p className="mt-1 text-sm text-stone-500">
            {item.category || "Sin categoría"}
          </p>
          {item.subtitle && (
            <p className="mt-2 line-clamp-2 text-sm text-stone-600">
              {item.subtitle}
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 sm:flex">
            <button
              type="button"
              onClick={onEdit}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={onToggle}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700"
            >
              {item.is_active ? "Ocultar" : "Mostrar"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
    </div>
  )
}

export default AdminSiteContentPage
