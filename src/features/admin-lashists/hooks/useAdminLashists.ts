import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  createLashist,
  fetchLashists,
  toggleLashistStatus,
  updateLashist,
  type LashistInput,
  type LashistRow,
} from "../api/adminLashistsService"

const initialForm: LashistInput = {
  name: "",
  phone: "",
  isActive: true,
}

export function useAdminLashists() {
  const [lashists, setLashists] = useState<LashistRow[]>([])
  const [formData, setFormData] = useState<LashistInput>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadLashists = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await fetchLashists()
      setLashists(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error cargando lashistas."

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLashists()
  }, [])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const startEdit = (lashist: LashistRow) => {
    setEditingId(lashist.id)
    setFormData({
      name: lashist.name,
      phone: lashist.phone ?? "",
      isActive: lashist.is_active,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData(initialForm)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Ingresa el nombre de la lashista.")
      return
    }

    try {
      setSaving(true)

      if (editingId) {
        await updateLashist(editingId, formData)
        toast.success("Lashista actualizada correctamente.")
      } else {
        await createLashist(formData)
        toast.success("Lashista creada correctamente.")
      }

      resetForm()
      await loadLashists()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo guardar la lashista."
      )
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setUpdatingId(id)

      await toggleLashistStatus(id, !currentStatus)

      toast.success(
        currentStatus
          ? "Lashista desactivada correctamente."
          : "Lashista activada correctamente."
      )

      await loadLashists()
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const activeCount = lashists.filter((item) => item.is_active).length
  const inactiveCount = lashists.filter((item) => !item.is_active).length

  return {
    lashists,
    formData,
    editingId,

    loading,
    saving,
    updatingId,
    error,

    activeCount,
    inactiveCount,

    handleChange,
    handleSubmit,
    startEdit,
    resetForm,
    toggleStatus: handleToggleStatus,
    reload: loadLashists,
  }
}