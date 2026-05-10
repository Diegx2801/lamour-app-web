export const serviceInputClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200 disabled:bg-stone-100 disabled:text-stone-500"

export function SummaryCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
      <p className="text-sm text-stone-500">{title}</p>
      <h2 className="mt-2 text-2xl font-semibold text-stone-950 md:text-3xl">
        {value}
      </h2>
    </div>
  )
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`min-w-fit rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-700"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  )
}

export function ServiceActions({
  active,
  onEdit,
  onToggle,
}: {
  active: boolean
  onEdit: () => void
  onToggle: () => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium text-stone-700"
      >
        Editar
      </button>

      <button
        type="button"
        onClick={onToggle}
        className={`rounded-lg px-3 py-2 text-xs font-medium ${
          active ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}
      >
        {active ? "Desactivar" : "Activar"}
      </button>
    </div>
  )
}

export function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <p className="text-[11px] uppercase tracking-wide text-stone-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-stone-950">{value}</p>
    </div>
  )
}

export function Field({
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

export function Alert({
  type,
  message,
}: {
  type: "error" | "success"
  message: string
}) {
  const classes =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-green-200 bg-green-50 text-green-700"

  return (
    <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${classes}`}>
      {message}
    </div>
  )
}
