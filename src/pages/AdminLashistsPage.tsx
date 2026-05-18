import { useAdminLashists } from "../features/admin-lashists/hooks/useAdminLashists"
import type { LashistRow } from "../features/admin-lashists/api/adminLashistsService"

const inputClass =
  "w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-700 focus:ring-4 focus:ring-stone-100"

function AdminLashistsPage() {
  const lashists = useAdminLashists()

  return (
    <div className="pb-8">
      <section className="mb-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Equipo operativo
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Lashistas
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Gestiona el equipo disponible para asignar reservas y avisos de
              agenda.
            </p>
          </div>

          <button
            type="button"
            onClick={lashists.reload}
            className="rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            Actualizar
          </button>
        </div>
      </section>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <SummaryCard label="Total" value={lashists.lashists.length} />
        <SummaryCard label="Activas" value={lashists.activeCount} tone="green" />
        <SummaryCard
          label="Inactivas"
          value={lashists.inactiveCount}
          tone={lashists.inactiveCount > 0 ? "amber" : "stone"}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-stone-950">
              {lashists.editingId ? "Editar lashista" : "Nueva lashista"}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Nombre, celular y estado para asignacion de citas.
            </p>
          </div>

          <form onSubmit={lashists.handleSubmit} className="space-y-4">
            <Field label="Nombre" htmlFor="lashist-name">
              <input
                id="lashist-name"
                name="name"
                value={lashists.formData.name}
                onChange={lashists.handleChange}
                className={inputClass}
                placeholder="Ej. Melissa"
              />
            </Field>

            <Field label="Celular" htmlFor="lashist-phone">
              <input
                id="lashist-phone"
                name="phone"
                value={lashists.formData.phone}
                onChange={lashists.handleChange}
                className={inputClass}
                placeholder="Ej. 999999999"
              />
            </Field>

            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                name="isActive"
                checked={lashists.formData.isActive}
                onChange={lashists.handleChange}
                className="h-4 w-4"
              />
              Lashista activa
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="submit"
                disabled={lashists.saving}
                className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
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
                Lista de lashistas
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Activa o desactiva sin eliminar historial.
              </p>
            </div>
            <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
              {lashists.lashists.length} registros
            </span>
          </div>

          {lashists.loading && <StateBox text="Cargando lashistas..." />}
          {lashists.error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {lashists.error}
            </p>
          )}
          {!lashists.loading && lashists.lashists.length === 0 && (
            <StateBox text="No hay lashistas registradas." />
          )}

          <div className="grid gap-3">
            {lashists.lashists.map((item) => (
              <LashistCard
                key={item.id}
                item={item}
                updating={lashists.updatingId === item.id}
                onEdit={() => lashists.startEdit(item)}
                onToggle={() => lashists.toggleStatus(item.id, item.is_active)}
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
    <article className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-stone-950">{item.name}</h3>
            <StatusBadge active={Boolean(item.is_active)} activeText="Activa" />
          </div>
          <p className="mt-1 text-sm text-stone-500">
            {item.phone || "Sin celular"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <SmallButton onClick={onEdit}>Editar</SmallButton>
          <SmallButton danger={item.is_active} onClick={onToggle} disabled={updating}>
            {updating ? "Actualizando..." : item.is_active ? "Desactivar" : "Activar"}
          </SmallButton>
        </div>
      </div>
    </article>
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

function SummaryCard({
  label,
  value,
  tone = "stone",
}: {
  label: string
  value: number
  tone?: "stone" | "green" | "amber"
}) {
  const classes = {
    stone: "border-stone-200 bg-white text-stone-950",
    green: "border-emerald-200 bg-emerald-50 text-emerald-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
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

function StatusBadge({
  active,
  activeText = "Activo",
}: {
  active: boolean
  activeText?: string
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-stone-200 text-stone-700 ring-1 ring-stone-300"
      }`}
    >
      {active ? activeText : "Inactiva"}
    </span>
  )
}

function SmallButton({
  children,
  onClick,
  disabled,
  danger = false,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition disabled:opacity-60 ${
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

export default AdminLashistsPage
