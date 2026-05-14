import { useWhatsappTemplates } from "../features/whatsapp-templates/hooks/useWhatsappTemplates"

function AdminWhatsappTemplatesPage() {
  const templates = useWhatsappTemplates()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Comunicación
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Plantillas WhatsApp
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Edita textos para confirmación, recordatorios, pagos, post atención
            y agenda semanal de lashistas.
          </p>
        </div>

        <button
          type="button"
          onClick={templates.reload}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Actualizar
        </button>
      </div>

      {templates.error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {templates.error}
        </div>
      )}

      {templates.loading ? (
        <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-500 shadow-sm">
          Cargando plantillas...
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {templates.templates.map((template) => (
            <article
              key={template.id}
              className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {template.template_key}
                  </p>
                  <input
                    value={template.title}
                    onChange={(event) =>
                      templates.updateLocalTemplate(template.id, {
                        title: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2 text-lg font-semibold text-stone-950 outline-none focus:border-stone-600"
                  />
                </div>
                <label className="flex items-center gap-2 rounded-full bg-stone-100 px-3 py-2 text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={template.is_active}
                    onChange={(event) =>
                      templates.updateLocalTemplate(template.id, {
                        is_active: event.target.checked,
                      })
                    }
                  />
                  Activa
                </label>
              </div>

              <textarea
                rows={5}
                value={template.message}
                onChange={(event) =>
                  templates.updateLocalTemplate(template.id, {
                    message: event.target.value,
                  })
                }
                className="w-full resize-none rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm leading-6 text-stone-800 outline-none focus:border-stone-600"
              />

              <p className="mt-3 text-xs leading-5 text-stone-500">
                Variables disponibles: {"{cliente}"}, {"{fecha}"}, {"{hora}"},{" "}
                {"{servicio}"}, {"{saldo}"}, {"{lashista}"}, {"{agenda}"}.
              </p>

              <button
                type="button"
                onClick={() => templates.saveTemplate(template)}
                disabled={templates.savingId === template.id}
                className="mt-4 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
              >
                {templates.savingId === template.id ? "Guardando..." : "Guardar"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminWhatsappTemplatesPage
