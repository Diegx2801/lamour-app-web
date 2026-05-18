import { useAdminUsers } from "../features/admin-users/hooks/useAdminUsers"
import type {
  AdminUserAuditLog,
  AdminUserRow,
} from "../features/admin-users/api/adminUsersService"

function getRoleLabel(role: string | null) {
  if (role === "admin" || role === "owner") return "Dueña"
  if (role === "staff") return "Agenda"
  if (role === "followup") return "Agenda"
  return "Sin rol"
}

function getActionLabel(log: AdminUserAuditLog) {
  const actor = log.actor_email ?? "La dueña"
  const target = log.target_email ?? "un usuario"

  if (log.action === "create") {
    return `${actor} creó el acceso de ${target}.`
  }

  if (log.action === "update") {
    return `${actor} actualizó el acceso de ${target}.`
  }

  if (log.action === "deactivate") {
    return `${actor} desactivó el acceso de ${target}.`
  }

  if (log.action === "reactivate") {
    return `${actor} reactivó el acceso de ${target}.`
  }

  return `${actor} cambió el acceso de ${target}.`
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
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Seguridad
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Usuarios
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Crea accesos individuales para la dueña y el equipo operativo sin
            compartir contraseñas.
          </p>
        </div>

        <button
          type="button"
          onClick={users.reload}
          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
        >
          Actualizar
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <SummaryCard label="Total" value={users.summary.total} />
        <SummaryCard label="Activos" value={users.summary.active} />
        <SummaryCard label="Dueñas" value={users.summary.owners} />
        <SummaryCard label="Equipo" value={users.summary.staff} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
          <h2 className="text-lg font-semibold text-stone-950">
            {users.editingUserId ? "Editar acceso" : "Crear acceso"}
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            Crea accesos separados para dueña y equipo de agenda sin compartir
            contraseñas.
          </p>

          <form onSubmit={users.handleSubmit} className="mt-5 space-y-4">
            <Field label="Nombre" htmlFor="user-full-name">
              <input
                id="user-full-name"
                name="fullName"
                value={users.form.fullName}
                onChange={users.handleChange}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
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
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                placeholder="agenda@lamour.com"
              />
            </Field>

            <Field
              label={
                users.editingUserId
                  ? "Nueva contraseña temporal"
                  : "Contraseña temporal"
              }
              htmlFor="user-password"
            >
              <input
                id="user-password"
                name="password"
                type="password"
                value={users.form.password}
                onChange={users.handleChange}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                placeholder={
                  users.editingUserId
                    ? "Déjalo vacío si no cambia"
                    : "Mínimo 8 caracteres"
                }
              />
            </Field>

            <Field label="Rol" htmlFor="user-role">
              <select
                id="user-role"
                name="role"
                value={users.form.role}
                onChange={users.handleChange}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
              >
                <option value="staff">Agenda</option>
                <option value="owner">Dueña</option>
              </select>
            </Field>

            <label className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
              <input
                type="checkbox"
                name="isActive"
                checked={users.form.isActive}
                onChange={users.handleChange}
                className="h-4 w-4"
              />
              Acceso activo
            </label>

            <div className="grid gap-2 sm:flex">
              <button
                type="submit"
                disabled={users.saving}
                className="rounded-xl bg-stone-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-60"
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
            Accesos del equipo
          </h2>

          {users.loading && (
            <p className="mt-5 text-sm text-stone-500">Cargando usuarios...</p>
          )}

          {users.error && (
            <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {users.error}
            </p>
          )}

          <div className="mt-5 grid gap-3">
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

      <section className="mt-5 rounded-[1.5rem] bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
        <h2 className="text-lg font-semibold text-stone-950">
          Historial de accesos
        </h2>

        <div className="mt-4 grid gap-3">
          {users.auditLogs.length === 0 && (
            <p className="text-sm text-stone-500">Aún no hay movimientos.</p>
          )}

          {users.auditLogs.map((log) => (
            <article
              key={log.id}
              className="rounded-2xl border border-stone-200 p-4"
            >
              <p className="text-sm font-medium text-stone-950">
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
      <label htmlFor={htmlFor} className="text-sm font-medium text-stone-700">
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
    <article className="rounded-2xl border border-stone-200 p-4 transition hover:bg-stone-50/60">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-stone-950">
              {user.full_name || user.email || "Sin nombre"}
            </h3>

            <span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
              {getRoleLabel(user.role)}
            </span>

            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                user.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-stone-200 text-stone-600"
              }`}
            >
              {user.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <p className="mt-1 text-sm text-stone-500">
            {user.email || "Sin correo"}
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
              user.is_active
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-green-200 bg-green-50 text-green-700"
            }`}
          >
            {updating
              ? "Actualizando..."
              : user.is_active
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

export default AdminUsersPage
