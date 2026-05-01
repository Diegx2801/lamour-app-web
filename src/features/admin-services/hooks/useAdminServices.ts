import { useEffect, useMemo, useState } from "react"
import {
  fetchAdminServices,
  createAdminService,
  updateAdminService,
  updateAdminServiceStatus,
  type AdminServiceRow,
  type AdminServicePayload,
} from "../api/adminServicesService"

type ServiceFormState = {
  name: string
  description: string
  price: string
  duration_minutes: string
  category: string
  is_active: boolean
}

const initialForm: ServiceFormState = {
  name: "",
  description: "",
  price: "",
  duration_minutes: "",
  category: "",
  is_active: true,
}

export function useAdminServices() {
  const [services, setServices] = useState<AdminServiceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceFormState>(initialForm)

  const activeCount = useMemo(
    () => services.filter((s) => s.is_active).length,
    [services]
  )

  const inactiveCount = useMemo(
    () => services.filter((s) => !s.is_active).length,
    [services]
  )

  const loadServices = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await fetchAdminServices()
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar servicios.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  const openCreateModal = () => {
    setEditingServiceId(null)
    setForm(initialForm)
    setError("")
    setSuccess("")
    setIsModalOpen(true)
  }

  const openEditModal = (service: AdminServiceRow) => {
    setEditingServiceId(service.id)
    setForm({
      name: service.name ?? "",
      description: service.description ?? "",
      price: String(service.price ?? ""),
      duration_minutes: String(service.duration_minutes ?? ""),
      category: service.category ?? "",
      is_active: service.is_active,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setIsModalOpen(false)
    setEditingServiceId(null)
    setForm(initialForm)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const validateForm = () => {
    if (!form.name.trim()) return "Ingresa el nombre del servicio."

    const price = Number(form.price)
    if (!price || price <= 0) return "Precio inválido."

    const duration = Number(form.duration_minutes)
    if (!duration || duration <= 0) return "Duración inválida."

    if (!form.category.trim()) return "Ingresa categoría."

    const duplicated = services.some((s) => {
      const same =
        s.name.toLowerCase().trim() === form.name.toLowerCase().trim()
      if (!same) return false
      return editingServiceId ? s.id !== editingServiceId : true
    })

    if (duplicated) return "Servicio duplicado."

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setSaving(true)

      const payload: AdminServicePayload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes),
        category: form.category.trim(),
        is_active: form.is_active,
      }

      if (editingServiceId) {
        await updateAdminService(editingServiceId, payload)
        setSuccess("Servicio actualizado.")
      } else {
        await createAdminService(payload)
        setSuccess("Servicio creado.")
      }

      await loadServices()
      closeModal()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.")
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (service: AdminServiceRow) => {
    try {
      await updateAdminServiceStatus(service.id, !service.is_active)
      await loadServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error actualizando estado.")
    }
  }

  return {
    services,
    loading,
    saving,
    error,
    success,

    isModalOpen,
    editingServiceId,
    form,

    activeCount,
    inactiveCount,

    openCreateModal,
    openEditModal,
    closeModal,

    handleChange,
    handleSubmit,
    toggleStatus,
  }
}