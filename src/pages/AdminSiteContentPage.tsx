import { useAdminSiteContent } from "../features/site-content/hooks/useAdminSiteContent"
import type { SiteContentItem } from "../features/site-content/api/siteContentService"

const inputClass =
  "w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-700 focus:ring-4 focus:ring-stone-100"

function getSectionLabel(section: string) {
  return section === "hero" ? "Carrusel principal" : "Galeria"
}

function AdminSiteContentPage() {
  const content = useAdminSiteContent()

  return (
    <div className="pb-8">
      <section className="mb-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Web publica
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Contenido web
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Edita fotos, textos, orden y visibilidad del carrusel y galeria
              sin tocar codigo.
            </p>
          </div>

          <button
            type="button"
            onClick={content.reload}
            className="rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            Actualizar
          </button>
        </div>
      </section>

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard label="Total" value={content.summary.total} />
        <SummaryCard label="Activos" value={content.summary.active} tone="green" />
        <SummaryCard label="Carrusel" value={content.summary.hero} tone="blue" />
        <SummaryCard label="Galeria" value={content.summary.gallery} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-stone-950">
              {content.editingId ? "Editar contenido" : "Nuevo contenido"}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Carga imagen, texto y posicion para publicar en la web.
            </p>
          </div>

          <form onSubmit={content.handleSubmit} className="space-y-4">
            <Field label="Seccion" htmlFor="content-section">
              <select
                id="content-section"
                value={content.form.section}
                onChange={(event) =>
                  content.updateForm(
                    "section",
                    event.target.value as "hero" | "gallery"
                  )
                }
                className={inputClass}
              >
                <option value="hero">Carrusel principal</option>
                <option value="gallery">Galeria</option>
              </select>
            </Field>

            <Field label="Titulo" htmlFor="content-title">
              <input
                id="content-title"
                value={content.form.title}
                onChange={(event) =>
                  content.updateForm("title", event.target.value)
                }
                className={inputClass}
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
                className={`${inputClass} min-h-24 resize-none`}
                placeholder="Texto visible sobre la imagen principal."
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoria" htmlFor="content-category">
                <input
                  id="content-category"
                  value={content.form.category}
                  onChange={(event) =>
                    content.updateForm("category", event.target.value)
                  }
                  className={inputClass}
                  placeholder="Cejas, Pestanas..."
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
                  className={inputClass}
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
                  className="w-full rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm"
                />

                <input
                  value={content.form.image_url}
                  onChange={(event) =>
                    content.updateForm("image_url", event.target.value)
                  }
                  className={inputClass}
                  placeholder="URL de imagen"
                />

                {content.form.image_url && (
                  <img
                    src={content.form.image_url}
                    alt=""
                    className="aspect-video w-full rounded-2xl object-cover ring-1 ring-stone-200"
                  />
                )}
              </div>
            </Field>

            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
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

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="submit"
                disabled={content.saving || content.uploading}
                className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
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
                  className="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-950">
                Contenido publicado
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Elementos ordenados para la web publica.
              </p>
            </div>
            <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
              {content.items.length} items
            </span>
          </div>

          {content.loading && <StateBox text="Cargando contenido..." />}
          {content.error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {content.error}
            </p>
          )}

          <div className="grid gap-3">
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
      <label htmlFor={htmlFor} className="text-sm font-semibold text-stone-800">
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
    <article className="overflow-hidden rounded-[1.35rem] border border-stone-200 bg-stone-50">
      <div className="grid gap-3 p-3 sm:grid-cols-[132px_1fr]">
        <img
          src={item.image_url}
          alt={item.title}
          className="aspect-video w-full rounded-2xl object-cover ring-1 ring-stone-200 sm:aspect-square"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label={getSectionLabel(item.section)} />
            <StatusPill
              label={item.is_active ? "Activo" : "Inactivo"}
              active={item.is_active}
            />
            <StatusPill label={`Orden ${item.sort_order}`} />
          </div>

          <h3 className="mt-3 font-semibold text-stone-950">{item.title}</h3>
          <p className="mt-1 text-sm text-stone-500">
            {item.category || "Sin categoria"}
          </p>
          {item.subtitle && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">
              {item.subtitle}
            </p>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2 sm:flex">
            <SmallButton onClick={onEdit}>Editar</SmallButton>
            <SmallButton onClick={onToggle}>
              {item.is_active ? "Ocultar" : "Mostrar"}
            </SmallButton>
            <SmallButton danger onClick={onDelete}>
              Eliminar
            </SmallButton>
          </div>
        </div>
      </div>
    </article>
  )
}

function SummaryCard({
  label,
  value,
  tone = "stone",
}: {
  label: string
  value: number
  tone?: "stone" | "green" | "blue"
}) {
  const classes = {
    stone: "border-stone-200 bg-white text-stone-950",
    green: "border-emerald-200 bg-emerald-50 text-emerald-950",
    blue: "border-blue-200 bg-blue-50 text-blue-950",
  }

  return (
    <article className={`rounded-[1.35rem] border p-4 shadow-sm ${classes[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-60">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </article>
  )
}

function StatusPill({ label, active }: { label: string; active?: boolean }) {
  const classes =
    active === undefined
      ? "bg-white text-stone-700 ring-stone-200"
      : active
        ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
        : "bg-stone-200 text-stone-700 ring-stone-300"

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes}`}>
      {label}
    </span>
  )
}

function SmallButton({
  children,
  onClick,
  danger = false,
}: {
  children: React.ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
        danger
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
      }`}
    >
      {children}
    </button>
  )
}

function StateBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-stone-500">
      {text}
    </div>
  )
}

export default AdminSiteContentPage
