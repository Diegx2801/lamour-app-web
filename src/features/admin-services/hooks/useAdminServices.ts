import { useEffect, useMemo, useState } from "react"
import {
  createAdminService,
  fetchAdminServices,
  updateAdminService,
  updateAdminServiceStatus,
  type AdminServicePayload,
  type AdminServiceRow,
} from "../api/adminServicesService"

type ServiceFormState = {
  name: string
  description: string
  price: string
  duration_minutes: string
  category: string
  is_active: boolean
  allows_retouch: boolean
  retouch_price: string
  retouch_days: string
}

const initialForm: ServiceFormState = {
  name: "",
  description: "",
  price: "",
  duration_minutes: "",
  category: "",
  is_active: true,
  allows_retouch: false,
  retouch_price: "",
  retouch_days: "15",
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
    () => services.filter((service) => service.is_active).length,
    [services]
  )

  const inactiveCount = useMemo(
    () => services.filter((service) => !service.is_active).length,
    [services]
  )

  const retouchCount = useMemo(
    () => services.filter((service) => service.allows_retouch).length,
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
      allows_retouch: Boolean(service.allows_retouch),
      retouch_price: service.retouch_price != null ? String(service.retouch_price) : "",
      retouch_days: String(service.retouch_days ?? 15),
    })

    setError("")
    setSuccess("")
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return

    setIsModalOpen(false)
    setEditingServiceId(null)
    setForm(initialForm)
    setError("")
    setSuccess("")
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target
    const checked =
      event.target instanceof HTMLInputElement ? event.target.checked : false

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

    if (form.allows_retouch) {
      const retouchPrice = Number(form.retouch_price)
      const retouchDays = Number(form.retouch_days)

      if (!retouchPrice || retouchPrice <= 0) {
        return "Ingresa un precio de retoque válido."
      }

      if (retouchPrice >= price) {
        return "El precio de retoque debe ser menor al precio normal."
      }

      if (!retouchDays || retouchDays <= 0) {
        return "Ingresa días de retoque válidos."
      }
    }

    const duplicated = services.some((service) => {
      const sameName =
        service.name.toLowerCase().trim() === form.name.toLowerCase().trim()

      if (!sameName) return false

      return editingServiceId ? service.id !== editingServiceId : true
    })

    if (duplicated) return "Servicio duplicado."

    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
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
        allows_retouch: form.allows_retouch,
        retouch_price: form.allows_retouch ? Number(form.retouch_price) : null,
        retouch_days: form.allows_retouch ? Number(form.retouch_days) : 15,
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
    retouchCount,

    openCreateModal,
    openEditModal,
    closeModal,

    handleChange,
    handleSubmit,
    toggleStatus,
  }
}