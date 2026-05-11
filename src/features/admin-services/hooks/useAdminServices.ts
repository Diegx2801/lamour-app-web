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
  is_package: boolean
  package_item_ids: string[]
  duration_manually_edited: boolean
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
  is_package: false,
  package_item_ids: [],
  duration_manually_edited: false,
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

  const packageCount = useMemo(
    () => services.filter((service) => service.is_package).length,
    [services]
  )

  const packageBaseServices = useMemo(
    () => services.filter((service) => !service.is_package && service.is_active),
    [services]
  )

  const selectedPackageServices = useMemo(() => {
    return form.package_item_ids
      .map((serviceId) =>
        packageBaseServices.find((service) => service.id === serviceId)
      )
      .filter((service): service is AdminServiceRow => Boolean(service))
  }, [form.package_item_ids, packageBaseServices])

  const packageRegularTotal = useMemo(() => {
    return selectedPackageServices.reduce(
      (total, service) => total + Number(service.price ?? 0),
      0
    )
  }, [selectedPackageServices])

  const packageOfferPrice = Number(form.price || 0)
  const packageSavings = Math.max(packageRegularTotal - packageOfferPrice, 0)

  const packageAutoDuration = useMemo(() => {
    return selectedPackageServices.reduce(
      (total, service) => total + Number(service.duration_minutes ?? 0),
      0
    )
  }, [selectedPackageServices])

  const sortedPackageBaseServices = useMemo(() => {
    return [...packageBaseServices].sort((a, b) => {
      const aSelected = form.package_item_ids.includes(a.id)
      const bSelected = form.package_item_ids.includes(b.id)

      if (aSelected !== bSelected) return aSelected ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }, [form.package_item_ids, packageBaseServices])

  const getPackageDuration = (serviceIds: string[]) => {
    return serviceIds.reduce((total, serviceId) => {
      const service = packageBaseServices.find((item) => item.id === serviceId)
      return total + Number(service?.duration_minutes ?? 0)
    }, 0)
  }

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
      is_package: Boolean(service.is_package),
      package_item_ids: service.package_items ?? [],
      duration_manually_edited: Boolean(service.is_package),
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
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = event.target
    const checked =
      event.target instanceof HTMLInputElement ? event.target.checked : false

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }

      if (name === "is_package" && checked && !prev.category.trim()) {
        next.category = "Paquetes"
      }

      if (name === "is_package" && checked && !prev.duration_minutes.trim()) {
        next.duration_manually_edited = false
      }

      if (name === "is_package" && !checked) {
        next.package_item_ids = []
      }

      if (name === "duration_minutes") {
        next.duration_manually_edited = true
      }

      return next
    })
  }

  const togglePackageItem = (serviceId: string) => {
    setForm((prev) => {
      const exists = prev.package_item_ids.includes(serviceId)
      const packageItemIds = exists
        ? prev.package_item_ids.filter((id) => id !== serviceId)
        : [...prev.package_item_ids, serviceId]
      const autoDuration = getPackageDuration(packageItemIds)

      return {
        ...prev,
        package_item_ids: packageItemIds,
        duration_minutes:
          prev.is_package && !prev.duration_manually_edited
            ? String(autoDuration || "")
            : prev.duration_minutes,
      }
    })
  }

  const useAutoPackageDuration = () => {
    setForm((prev) => ({
      ...prev,
      duration_minutes: String(packageAutoDuration || ""),
      duration_manually_edited: false,
    }))
  }

  const validateForm = () => {
    if (!form.name.trim()) return "Ingresa el nombre del servicio."

    const price = Number(form.price)
    if (!price || price <= 0) return "Precio inválido."

    const duration = Number(form.duration_minutes)
    if (!duration || duration <= 0) return "Duración inválida."

    if (!form.category.trim()) return "Ingresa categoría."

    if (form.is_package && form.package_item_ids.length === 0) {
      return "Selecciona al menos un servicio incluido en el paquete."
    }

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
        is_package: form.is_package,
        package_includes_lashes: form.is_package
          ? form.package_item_ids.some((serviceId) => {
              const service = services.find((item) => item.id === serviceId)
              return (
                service?.category === "Pestañas" ||
                service?.package_includes_lashes
              )
            })
          : false,
        package_item_ids: form.is_package ? form.package_item_ids : [],
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
    packageCount,
    packageBaseServices,
    sortedPackageBaseServices,
    selectedPackageServices,
    packageRegularTotal,
    packageSavings,
    packageAutoDuration,

    openCreateModal,
    openEditModal,
    closeModal,

    handleChange,
    togglePackageItem,
    useAutoPackageDuration,
    handleSubmit,
    toggleStatus,
  }
}
