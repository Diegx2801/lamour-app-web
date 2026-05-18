import { useAdminPaymentMethods } from "../features/payment-methods/hooks/useAdminPaymentMethods"

const inputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:bg-stone-100"

function AdminPaymentMethodsPage() {
  const paymentMethods = useAdminPaymentMethods()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Configuración
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Métodos de pago
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Controla qué métodos aparecen al registrar pagos en agenda y caja.
          </p>
        </div>

        <button
          type="button"
          onClick={paymentMethods.reload}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Actualizar
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={paymentMethods.saveMethod}
          className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm md:rounded-3xl"
        >
          <h2 className="text-lg font-semibold text-stone-950">
            {paymentMethods.editingId ? "Editar método" : "Nuevo método"}
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            El código se guarda en pagos. Ejemplo: yape, plin, efectivo.
          </p>

          <div className="mt-5 grid gap-4">
            <Field label="Nombre">
              <input
                value={paymentMethods.form.name}
                onChange={(event) =>
                  paymentMethods.updateForm("name", event.target.value)
                }
                placeholder="Ejemplo: Yape empresa"
                className={inputClass}
              />
            </Field>

            <Field label="Código">
              <input
                value={paymentMethods.form.code}
                onChange={(event) =>
                  paymentMethods.updateForm("code", event.target.value)
                }
                placeholder="Ejemplo: yape_empresa"
                className={inputClass}
              />
            </Field>

            <Field label="Orden">
              <input
                type="number"
                step="1"
                value={paymentMethods.form.sort_order}
                onChange={(event) =>
                  paymentMethods.updateForm("sort_order", event.target.value)
                }
                className={inputClass}
              />
            </Field>

            <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-stone-50 px-4 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                checked={paymentMethods.form.is_active}
                onChange={(event) =>
                  paymentMethods.updateForm("is_active", event.target.checked)
                }
              />
              Activo para registrar pagos
            </label>
          </div>

          {paymentMethods.error && (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {paymentMethods.error}
            </p>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={paymentMethods.resetForm}
              className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={paymentMethods.saving}
              className="rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
            >
              {paymentMethods.saving
                ? "Guardando..."
                : paymentMethods.editingId
                  ? "Guardar cambios"
                  : "Crear método"}
            </button>
          </div>
        </form>

        <section className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm md:rounded-3xl">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-950">
                Métodos disponibles
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {paymentMethods.activeCount} activo
                {paymentMethods.activeCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {paymentMethods.loading ? (
            <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
              Cargando métodos...
            </p>
          ) : paymentMethods.methods.length === 0 ? (
            <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
              Todavía no hay métodos registrados.
            </p>
          ) : (
            <div className="grid gap-3">
              {paymentMethods.methods.map((method) => (
                <article
                  key={method.id}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-stone-950">
                          {method.name}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                            method.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {method.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        Código: {method.code} · Orden: {method.sort_order ?? 0}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() => paymentMethods.editMethod(method)}
                        className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => paymentMethods.deactivateMethod(method)}
                        disabled={!method.is_active}
                        className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-red-600 shadow-sm disabled:opacity-40"
                      >
                        Desactivar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-800">
        {label}
      </span>
      {children}
    </label>
  )
}

export default AdminPaymentMethodsPage
