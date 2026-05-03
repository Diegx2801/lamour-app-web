import { useAdminLashists } from "../features/admin-lashists/hooks/useAdminLashists"
import type { LashistRow } from "../features/admin-lashists/api/adminLashistsService"

function AdminLashistsPage() {
  const lashists = useAdminLashists()

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Equipo
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Lashistas
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Gestiona el equipo disponible para asignar reservas de pestañas.
          </p>
        </div>

        <button
          type="button"
          onClick={lashists.reload}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Actualizar
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Total" value={lashists.lashists.length} />
        <SummaryCard label="Activas" value={lashists.activeCount} />
        <SummaryCard label="Inactivas" value={lashists.inactiveCount} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
          <h2 className="text-lg font-semibold text-stone-950">
            {lashists.editingId ? "Editar lashista" : "Nueva lashista"}
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Registra o actualiza las lashistas que podrán asignarse a las
            reservas.
          </p>

          <form onSubmit={lashists.handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700">
                Nombre
              </label>

              <input
                name="name"
                value={lashists.formData.name}
                onChange={lashists.handleChange}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                placeholder="Ej. Melissa"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-stone-700">
                Celular
              </label>

              <input
                name="phone"
                value={lashists.formData.phone}
                onChange={lashists.handleChange}
                className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                placeholder="Ej. 999999999"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                name="isActive"
                checked={lashists.formData.isActive}
                onChange={lashists.handleChange}
                className="h-4 w-4"
              />

              Lashista activa
            </label>

            <div className="grid gap-2 sm:flex">
              <button
                type="submit"
                disabled={lashists.saving}
                className="rounded-xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
              >
                {lashists.saving
                  ? "Guardando..."
                  : lashists.editingId
                  ? "Guardar cambios"
                  : "Crear lashista"}
              </button>

              {lashists.editingId && (
                <button
                  type="button"
                  onClick={lashists.resetForm}
                  className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-700"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-950">
                Lista de lashistas
              </h2>

              <p className="mt-1 text-sm text-stone-500">
                Activa o desactiva sin eliminar el historial.
              </p>
            </div>
          </div>

          {lashists.loading && (
            <p className="mt-5 text-sm text-stone-500">
              Cargando lashistas...
            </p>
          )}

          {lashists.error && (
            <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {lashists.error}
            </p>
          )}

          {!lashists.loading && lashists.lashists.length === 0 && (
            <p className="mt-5 text-sm text-stone-500">
              No hay lashistas registradas.
            </p>
          )}

          <div className="mt-5 grid gap-3">
            {lashists.lashists.map((item) => (
              <LashistCard
                key={item.id}
                item={item}
                updating={lashists.updatingId === item.id}
                onEdit={() => lashists.startEdit(item)}
                onToggle={() =>
                  lashists.toggleStatus(item.id, item.is_active)
                }
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function LashistCard({
  item,
  updating,
  onEdit,
  onToggle,
}: {
  item: LashistRow
  updating: boolean
  onEdit: () => void
  onToggle: () => void
}) {
  return (
    <article className="rounded-2xl border border-stone-200 p-4 transition hover:bg-stone-50/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-stone-950">{item.name}</h3>

            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                item.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-stone-200 text-stone-600"
              }`}
            >
              {item.is_active ? "Activa" : "Inactiva"}
            </span>
          </div>

          <p className="mt-1 text-sm text-stone-500">
            {item.phone || "Sin celular"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
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
            disabled={updating}
            className={`rounded-xl border px-3 py-2 text-xs font-medium disabled:opacity-60 ${
              item.is_active
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {updating
              ? "Actualizando..."
              : item.is_active
              ? "Desactivar"
              : "Activar"}
          </button>
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

export default AdminLashistsPage