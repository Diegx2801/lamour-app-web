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
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Clientes</h1>

          <Link
            to="/admin/reservas"
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            ← Volver
          </Link>
        </div>

        <input
          placeholder="Buscar cliente o teléfono"
          value={clientState.search}
          onChange={(e) => clientState.setSearch(e.target.value)}
          className="mb-6 w-full rounded-xl border p-3"
        />

        {clientState.loading && <p>Cargando...</p>}
        {clientState.error && <p>{clientState.error}</p>}

        <div className="space-y-4">
          {clientState.clients.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between rounded-2xl border p-5 ${
                c.is_active ? "bg-white" : "bg-stone-100 opacity-60"
              }`}
            >
              <div className="w-full">
                {editingId === c.id ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="rounded-xl border p-3"
                      placeholder="Nombre y apellido"
                    />

                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl border p-3"
                      placeholder="Celular"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{c.full_name}</p>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          c.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500">{c.phone}</p>
                  </>
                )}
              </div>

              <div className="ml-4 flex shrink-0 gap-2">
                {editingId === c.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(c.id)}
                      className="rounded-full bg-stone-950 px-3 py-1 text-sm text-white"
                    >
                      Guardar
                    </button>

                    <button
                      onClick={cancelEdit}
                      className="rounded-full border px-3 py-1 text-sm"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(c)}
                      className="rounded-full border px-3 py-1 text-sm"
                    >
                      Editar
                    </button>

                    <Link
                      to={`/admin/clientes/${c.id}/historial`}
                      className="rounded-full border px-3 py-1 text-sm"
                    >
                      Historial
                    </Link>

                    {c.is_active ? (
                      <button
                        onClick={async () => {
                          await clientState.deactivateClient(c.id)
                          await clientState.reload()
                        }}
                        className="rounded-full bg-red-500 px-3 py-1 text-sm text-white"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await clientState.activateClient(c.id)
                          await clientState.reload()
                        }}
                        className="rounded-full bg-green-600 px-3 py-1 text-sm text-white"
                      >
                        Reactivar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminClientsPage