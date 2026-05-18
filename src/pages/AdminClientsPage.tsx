import { useMemo, useState } from "react"
import { Link } from "react-router"
import type { ClientRow } from "../features/admin-clients/api/adminClientsService"
import { useAdminClients } from "../features/admin-clients/hooks/useAdminClients"

const inputClass =
  "w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-900 focus:ring-2 focus:ring-stone-200"

function AdminClientsPage() {
  const clientState = useAdminClients()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

  const summary = useMemo(() => {
    const active = clientState.clients.filter((client) => client.is_active).length
    const inactive = clientState.clients.length - active

    return {
      total: clientState.clients.length,
      active,
      inactive,
    }
  }, [clientState.clients])

  const startEdit = (client: ClientRow) => {
    setEditingId(client.id)
    setFullName(client.full_name ?? "")
    setPhone(client.phone ?? "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFullName("")
    setPhone("")
  }

  const saveEdit = async (id: string) => {
    const cleanName = fullName.trim()
    const cleanPhone = phone.replace(/\D/g, "")

    if (cleanName.split(/\s+/).length < 2) {
      alert("Ingresa nombre y apellido.")
      return
    }

    if (!/^9\d{8}$/.test(cleanPhone)) {
      alert("Ingresa un celular peruano valido.")
      return
    }

    try {
      await clientState.updateClient(id, {
        full_name: cleanName,
        phone: cleanPhone,
      })
      await clientState.reload()
      cancelEdit()
    } catch {
      alert("No se pudo actualizar el cliente. Verifica si el telefono ya existe.")
    }
  }

  return (
    <div>
      <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              Panel administrativo
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 md:text-4xl">
              Clientes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Consulta datos, edita contactos y revisa historial antes de hacer
              seguimiento.
            </p>
          </div>

          <Link
            to="/admin/reservas"
            className="rounded-2xl bg-stone-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            Nueva reserva
          </Link>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 md:mb-5 md:gap-3">
        <MetricCard label="Total" value={summary.total} />
        <MetricCard label="Activos" value={summary.active} tone="green" />
        <MetricCard label="Inactivos" value={summary.inactive} tone="red" />
      </div>

      <div className="mb-5 rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm md:rounded-[2rem] md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <label htmlFor="client-search" className="block flex-1">
            <span className="mb-2 block text-sm font-semibold text-stone-800">
              Buscar cliente o telefono
            </span>
            <input
              id="client-search"
              placeholder="Nombre, apellido o 957230015"
              value={clientState.search}
              onChange={(e) => clientState.setSearch(e.target.value)}
              className={inputClass}
            />
          </label>

          <button
            type="button"
            onClick={clientState.reload}
            className="rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Actualizar
          </button>
        </div>
      </div>

      {clientState.loading && (
        <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-600 shadow-sm">
          Cargando clientes...
        </div>
      )}

      {clientState.error && (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {clientState.error}
        </div>
      )}

      {!clientState.loading && !clientState.error && (
        <div className="grid gap-3 xl:grid-cols-2">
          {clientState.clients.map((client) => {
            const isEditing = editingId === client.id

            return (
              <article
                key={client.id}
                className={`rounded-[1.5rem] border p-4 shadow-sm transition md:rounded-[2rem] md:p-5 ${
                  client.is_active
                    ? "border-stone-200 bg-white"
                    : "border-stone-200 bg-stone-100 opacity-75"
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {isEditing ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputClass}
                            placeholder="Nombre y apellido"
                          />
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputClass}
                            placeholder="Celular"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-base font-semibold text-stone-950 md:text-lg">
                              {client.full_name ?? "Sin nombre"}
                            </h2>
                            <StatusBadge active={Boolean(client.is_active)} />
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600">
                            <InfoPill label="Telefono" value={client.phone ?? "Sin telefono"} />
                            <InfoPill
                              label="Registro"
                              value={formatClientDate(client.created_at)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(client.id)}
                          className="rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(client)}
                          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700"
                        >
                          Editar
                        </button>
                        <Link
                          to={`/admin/clientes/${client.id}/historial`}
                          className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-stone-700"
                        >
                          Historial
                        </Link>
                        {client.is_active ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await clientState.deactivateClient(client.id)
                              await clientState.reload()
                            }}
                            className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              await clientState.activateClient(client.id)
                              await clientState.reload()
                            }}
                            className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700"
                          >
                            Reactivar
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })}

          {clientState.clients.length === 0 && (
            <div className="rounded-[1.5rem] bg-white p-5 text-sm text-stone-500 shadow-sm">
              No hay clientes para esta busqueda.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetricCard({
  label,
  value,
  tone = "stone",
}: {
  label: string
  value: number
  tone?: "stone" | "green" | "red"
}) {
  const tones = {
    stone: "border-stone-200 bg-white text-stone-950",
    green: "border-green-200 bg-green-50 text-green-900",
    red: "border-red-200 bg-red-50 text-red-900",
  }

  return (
    <div className={`rounded-2xl border p-3 shadow-sm md:rounded-3xl md:p-4 ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60 md:text-xs">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold md:text-2xl">{value}</p>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <p className="min-w-0 rounded-xl bg-stone-50 px-3 py-2">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
        {label}
      </span>
      <span className="mt-1 block truncate font-semibold text-stone-700">
        {value}
      </span>
    </p>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  )
}

function formatClientDate(date: string) {
  if (!date) return "Sin fecha"

  return new Date(date).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default AdminClientsPage
