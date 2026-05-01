import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  fetchLashists,
  createLashist,
  updateLashist,
  toggleLashist,
} from "../api/adminLashistsService"

export function useAdminLashists() {
  const [lashists, setLashists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const data = await fetchLashists()
      setLashists(data)
    } catch {
      toast.error("Error cargando lashistas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (name: string, phone?: string) => {
    await createLashist({ name, phone })
    toast.success("Lashista creado")
    load()
  }

  const handleUpdate = async (id: string, name: string, phone?: string) => {
    await updateLashist(id, { name, phone })
    toast.success("Actualizado")
    load()
  }

  const handleToggle = async (id: string, is_active: boolean) => {
    await toggleLashist(id, is_active)
    toast.success("Estado actualizado")
    load()
  }

  return {
    lashists,
    loading,
    handleCreate,
    handleUpdate,
    handleToggle,
  }
}