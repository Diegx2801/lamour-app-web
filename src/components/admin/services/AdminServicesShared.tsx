export const serviceInputClass =
  "w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-4 focus:ring-stone-100 disabled:bg-stone-100 disabled:text-stone-500"

export function SummaryCard({
  title,
  value,
  hint,
  tone = "stone",
}: {
  title: string
  value: string | number
  hint?: string
  tone?: "stone" | "green" | "amber" | "red" | "blue"
}) {
  const classes = {
    stone: "border-stone-200 bg-white text-stone-950",
    green: "border-emerald-200 bg-emerald-50 text-emerald-950",
    amber: "border-amber-200 bg-amber-50 text-amber-950",
    red: "border-red-200 bg-red-50 text-red-950",
    blue: "border-blue-200 bg-blue-50 text-blue-950",
  }

  return (
    <div className={`rounded-[1.35rem] border p-4 shadow-sm ${classes[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60">
        {title}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
        {value}
      </h2>
      {hint && <p className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  )
}

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`min-w-fit rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-stone-200 text-stone-700 ring-1 ring-stone-300"
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
        className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-800 transition hover:bg-stone-100"
      >
        Editar
      </button>

      <button
        type="button"
        onClick={onToggle}
        className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
          active
            ? "bg-red-50 text-red-700 hover:bg-red-100"
            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {active ? "Desactivar" : "Activar"}
      </button>
    </div>
  )
}

export function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
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
