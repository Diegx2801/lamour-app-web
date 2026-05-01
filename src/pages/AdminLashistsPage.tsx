import { useState } from "react"
import { useAdminLashists } from "../features/admin-lashists/hooks/useAdminLashists"

function AdminLashistsPage() {
  const { lashists, loading, handleCreate, handleUpdate, handleToggle } =
    useAdminLashists()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Lashistas</h1>

      <div className="mb-6 flex gap-2">
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <input
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={() => {
            if (!name) return
            handleCreate(name, phone)
            setName("")
            setPhone("")
          }}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Crear
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-3">
          {lashists.map((l) => (
            <div
              key={l.id}
              className="border p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{l.name}</p>
                <p className="text-sm text-gray-500">{l.phone}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleToggle(l.id, !l.is_active)
                  }
                  className="text-xs border px-2 py-1 rounded"
                >
                  {l.is_active ? "Desactivar" : "Activar"}
                </button>

                <button
                  onClick={() => {
                    const newName = prompt("Nuevo nombre", l.name)
                    if (!newName) return
                    handleUpdate(l.id, newName, l.phone)
                  }}
                  className="text-xs border px-2 py-1 rounded"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminLashistsPage