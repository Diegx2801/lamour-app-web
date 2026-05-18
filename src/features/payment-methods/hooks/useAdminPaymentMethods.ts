import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  createPaymentMethod,
  deactivatePaymentMethod,
  fetchAdminPaymentMethods,
  normalizePaymentMethodCode,
  updatePaymentMethod,
  type PaymentMethodInput,
  type PaymentMethodRow,
} from "../api/paymentMethodsService"

type PaymentMethodForm = {
  name: string
  code: string
  sort_order: string
  is_active: boolean
}

const initialForm: PaymentMethodForm = {
  name: "",
  code: "",
  sort_order: "0",
  is_active: true,
}

export function useAdminPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethodRow[]>([])
  const [form, setForm] = useState<PaymentMethodForm>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const activeCount = useMemo(
    () => methods.filter((method) => method.is_active).length,
    [methods]
  )

  const loadMethods = async () => {
    try {
      setLoading(true)
      setError("")
      setMethods(await fetchAdminPaymentMethods())
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los métodos de pago."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMethods()
  }, [])

  const updateForm = (field: keyof PaymentMethodForm, value: string | boolean) => {
    setForm((current) => {
      const next = { ...current, [field]: value }

      if (field === "name" && !editingId) {
        next.code = normalizePaymentMethodCode(String(value))
      }

      return next
    })
  }

  const editMethod = (method: PaymentMethodRow) => {
    setEditingId(method.id)
    setForm({
      name: method.name,
      code: method.code,
      sort_order: String(method.sort_order ?? 0),
      is_active: method.is_active,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(initialForm)
    setError("")
  }

  const getPayload = (): PaymentMethodInput | null => {
    const name = form.name.trim()
    const code = normalizePaymentMethodCode(form.code || form.name)
    const sortOrder = Number(form.sort_order || 0)

    if (!name) {
      setError("Ingresa el nombre del método de pago.")
      return null
    }

    if (!code) {
      setError("Ingresa un código válido.")
      return null
    }

    if (Number.isNaN(sortOrder)) {
      setError("El orden debe ser un número.")
      return null
    }

    return {
      name,
      code,
      sort_order: sortOrder,
      is_active: form.is_active,
    }
  }

  const saveMethod = async (event: React.FormEvent) => {
    event.preventDefault()
    const payload = getPayload()
    if (!payload) return

    try {
      setSaving(true)
      setError("")

      if (editingId) {
        await updatePaymentMethod(editingId, payload)
        toast.success("Método de pago actualizado.")
      } else {
        await createPaymentMethod(payload)
        toast.success("Método de pago creado.")
      }

      resetForm()
      await loadMethods()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar el método."
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const deactivateMethod = async (method: PaymentMethodRow) => {
    if (
      !window.confirm(
        `¿Desactivar "${method.name}"? Ya no aparecerá al registrar pagos.`
      )
    ) {
      return
    }

    try {
      setError("")
      await deactivatePaymentMethod(method.id)
      toast.success("Método desactivado.")
      await loadMethods()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo desactivar el método."
      setError(message)
      toast.error(message)
    }
  }

  return {
    methods,
    form,
    editingId,
    activeCount,
    loading,
    saving,
    error,
    updateForm,
    editMethod,
    resetForm,
    saveMethod,
    deactivateMethod,
    reload: loadMethods,
  }
}
