import { useState } from "react"
import { Link } from "react-router"
import { useAdminClients } from "../features/admin-clients/hooks/useAdminClients"

function AdminClientsPage() {
  const clientState = useAdminClients()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

  const startEdit = (client: any) => {
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
      alert("Ingresa un celular peruano válido.")
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
      alert("No se pudo actualizar el cliente. Verifica si el teléfono ya existe.")
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Panel administrativo
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-stone-950 md:text-4xl">
            Clientes
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Busca, edita y revisa el historial de clientes registrados.
          </p>
        </div>

        <Link
          to="/admin/reservas"
          className="w-full rounded-xl border border-stone-300 bg-white px-5 py-3 text-center text-sm font-medium text-stone-700 md:w-auto"
        >
          Ver reservas
        </Link>
      </div>

      <div className="mb-5 rounded-[1.5rem] bg-white p-4 shadow-sm md:mb-6 md:rounded-[2rem] md:p-5">
        <label className="mb-2 block text-sm font-medium text-stone-800">
          Buscar cliente o teléfono
        </label>

        <input
          placeholder="Ejemplo: María o 957230015"
          value={clientState.search}
          onChange={(e) => clientState.setSearch(e.target.value)}
          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500"
        />
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
        <div className="grid gap-3">
          {clientState.clients.map((client) => {
            const isEditing = editingId === client.id

            return (
              <article
                key={client.id}
                className={`rounded-[1.5rem] border p-4 shadow-sm md:rounded-[2rem] md:p-5 ${
                  client.is_active
                    ? "border-stone-200 bg-white"
                    : "border-stone-200 bg-stone-100 opacity-70"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid gap-3 md:grid-cols-2">
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500"
                          placeholder="Nombre y apellido"
                        />

                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-stone-500"
                          placeholder="Celular"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-stone-950">
                            {client.full_name ?? "Sin nombre"}
                          </h2>

                          <StatusBadge active={Boolean(client.is_active)} />
                        </div>

                        <p className="mt-1 text-sm text-stone-500">
                          {client.phone ?? "Sin teléfono"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(client.id)}
                          className="rounded-lg bg-stone-950 px-4 py-2 text-sm font-medium text-white"
                        >
                          Guardar
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(client)}
                          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
                        >
                          Editar
                        </button>

                        <Link
                          to={`/admin/clientes/${client.id}/historial`}
                          className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
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
                            className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700"
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
                            className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
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
              No hay clientes para esta búsqueda.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  )
}

export default AdminClientsPage