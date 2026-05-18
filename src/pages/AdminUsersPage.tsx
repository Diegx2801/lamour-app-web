import { useAdminUsers } from "../features/admin-users/hooks/useAdminUsers"
import type {
  AdminUserAuditLog,
  AdminUserRow,
} from "../features/admin-users/api/adminUsersService"

const inputClass =
  "w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-700 focus:ring-4 focus:ring-stone-100"

function getRoleLabel(role: string | null) {
  if (role === "admin" || role === "owner") return "Duena"
  if (role === "staff") return "Agenda"
  if (role === "followup") return "Agenda"
  return "Sin rol"
}

function getActionLabel(log: AdminUserAuditLog) {
  const actor = log.actor_email ?? "La duena"
  const target = log.target_email ?? "un usuario"

  if (log.action === "create") return `${actor} creo el acceso de ${target}.`
  if (log.action === "update") return `${actor} actualizo el acceso de ${target}.`
  if (log.action === "deactivate") return `${actor} desactivo el acceso de ${target}.`
  if (log.action === "reactivate") return `${actor} reactivo el acceso de ${target}.`

  return `${actor} cambio el acceso de ${target}.`
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

function AdminUsersPage() {
  const users = useAdminUsers()

  return (
    <div className="pb-8">
      <section className="mb-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Seguridad
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Usuarios
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Crea accesos individuales para la duena y equipo operativo sin
              compartir contrasenas.
            </p>
          </div>

          <button
            type="button"
            onClick={users.reload}
            className="rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            Actualizar
          </button>
        </div>
      </section>

      <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard label="Total" value={users.summary.total} />
        <SummaryCard label="Activos" value={users.summary.active} tone="green" />
        <SummaryCard label="Duenas" value={users.summary.owners} tone="blue" />
        <SummaryCard label="Equipo" value={users.summary.staff} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-stone-950">
              {users.editingUserId ? "Editar acceso" : "Crear acceso"}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Define correo, contrasena temporal, rol y estado.
            </p>
          </div>

          <form onSubmit={users.handleSubmit} className="space-y-4">
            <Field label="Nombre" htmlFor="user-full-name">
              <input
                id="user-full-name"
                name="fullName"
                value={users.form.fullName}
                onChange={users.handleChange}
                className={inputClass}
                placeholder="Ej. Ana Torres"
              />
            </Field>

            <Field label="Correo" htmlFor="user-email">
              <input
                id="user-email"
                name="email"
                type="email"
                value={users.form.email}
                onChange={users.handleChange}
                className={inputClass}
                placeholder="agenda@lamour.com"
              />
            </Field>

            <Field
              label={
                users.editingUserId
                  ? "Nueva contrasena temporal"
                  : "Contrasena temporal"
              }
              htmlFor="user-password"
            >
              <input
                id="user-password"
                name="password"
                type="password"
                value={users.form.password}
                onChange={users.handleChange}
                className={inputClass}
                placeholder={
                  users.editingUserId
                    ? "Dejalo vacio si no cambia"
                    : "Minimo 8 caracteres"
                }
              />
            </Field>

            <Field label="Rol" htmlFor="user-role">
              <select
                id="user-role"
                name="role"
                value={users.form.role}
                onChange={users.handleChange}
                className={inputClass}
              >
                <option value="staff">Agenda</option>
                <option value="owner">Duena</option>
              </select>
            </Field>

            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                name="isActive"
                checked={users.form.isActive}
                onChange={users.handleChange}
                className="h-4 w-4"
              />
              Acceso activo
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="submit"
                disabled={users.saving}
                className="rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
              >
                {users.saving
                  ? "Guardando..."
                  : users.editingUserId
                    ? "Guardar cambios"
                    : "Crear acceso"}
              </button>

              {users.editingUserId && (
                <button
                  type="button"
                  onClick={users.resetForm}
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
                Accesos del equipo
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Edita rol o desactiva accesos sin borrar historial.
              </p>
            </div>
            <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
              {users.users.length} usuarios
            </span>
          </div>

          {users.loading && <StateBox text="Cargando usuarios..." />}
          {users.error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {users.error}
            </p>
          )}

          <div className="grid gap-3">
            {users.users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                updating={users.updatingId === user.id}
                onEdit={() => users.startEdit(user)}
                onToggle={() => users.toggleStatus(user)}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">
              Historial de accesos
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Movimientos de creacion, cambios y desactivaciones.
            </p>
          </div>
          <span className="w-fit rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
            {users.auditLogs.length}
          </span>
        </div>

        <div className="grid gap-3">
          {users.auditLogs.length === 0 && (
            <StateBox text="Aun no hay movimientos." />
          )}

          {users.auditLogs.map((log) => (
            <article
              key={log.id}
              className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4"
            >
              <p className="text-sm font-semibold text-stone-950">
                {getActionLabel(log)}
              </p>
              <p className="mt-1 text-xs text-stone-500">
                {formatDateTime(log.created_at)}
              </p>
            </article>
          ))}
        </div>
      </section>
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

function UserCard({
  user,
  updating,
  onEdit,
  onToggle,
}: {
  user: AdminUserRow
  updating: boolean
  onEdit: () => void
  onToggle: () => void
}) {
  return (
    <article className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-stone-950">
              {user.full_name || user.email || "Sin nombre"}
            </h3>
            <StatusBadge label={getRoleLabel(user.role)} />
            <StatusBadge label={user.is_active ? "Activo" : "Inactivo"} active={user.is_active} />
          </div>

          <p className="mt-1 text-sm text-stone-500">
            {user.email || "Sin correo"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <SmallButton onClick={onEdit}>Editar</SmallButton>
          <SmallButton danger={user.is_active} onClick={onToggle} disabled={updating}>
            {updating ? "Actualizando..." : user.is_active ? "Desactivar" : "Activar"}
          </SmallButton>
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

function StatusBadge({
  label,
  active,
}: {
  label: string
  active?: boolean
}) {
  const activeClasses =
    active === undefined
      ? "bg-stone-100 text-stone-700 ring-stone-200"
      : active
        ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
        : "bg-stone-200 text-stone-700 ring-stone-300"

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${activeClasses}`}
    >
      {label}
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

export default AdminUsersPage
