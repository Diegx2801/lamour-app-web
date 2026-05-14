import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  fetchAdminUserAuditLogs,
  fetchAdminUsers,
  manageAdminUser,
  type AdminUserAuditLog,
  type AdminUserRole,
  type AdminUserRow,
} from "../api/adminUsersService"

type AdminUserForm = {
  fullName: string
  email: string
  password: string
  role: AdminUserRole
  isActive: boolean
}

const initialForm: AdminUserForm = {
  fullName: "",
  email: "",
  password: "",
  role: "staff",
  isActive: true,
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [auditLogs, setAuditLogs] = useState<AdminUserAuditLog[]>([])
  const [form, setForm] = useState<AdminUserForm>(initialForm)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [usersData, logsData] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminUserAuditLogs(),
      ])

      setUsers(usersData)
      setAuditLogs(logsData)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar usuarios."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const summary = useMemo(() => {
    const active = users.filter((user) => user.is_active).length
    const owners = users.filter((user) =>
      ["admin", "owner"].includes(String(user.role))
    ).length
    const staff = users.filter((user) => user.role === "staff").length
    const followup = users.filter((user) => user.role === "followup").length

    return {
      total: users.length,
      active,
      inactive: users.length - active,
      owners,
      staff,
      followup,
    }
  }, [users])

  const resetForm = () => {
    setEditingUserId(null)
    setForm(initialForm)
  }

  const startEdit = (user: AdminUserRow) => {
    setEditingUserId(user.id)
    setForm({
      fullName: user.full_name ?? "",
      email: user.email ?? "",
      password: "",
      role:
        user.role === "owner" || user.role === "admin"
          ? "owner"
          : user.role === "followup"
            ? "followup"
            : "staff",
      isActive: user.is_active,
    })
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : value,
    }))
  }

  const validateForm = () => {
    if (!form.fullName.trim()) {
      throw new Error("Ingresa el nombre.")
    }

    if (!normalizeEmail(form.email).includes("@")) {
      throw new Error("Ingresa un correo válido.")
    }

    if (!editingUserId && form.password.length < 8) {
      throw new Error("La contraseña temporal debe tener al menos 8 caracteres.")
    }

    if (editingUserId && form.password && form.password.length < 8) {
      throw new Error("La nueva contraseña debe tener al menos 8 caracteres.")
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      setSaving(true)
      validateForm()

      if (editingUserId) {
        await manageAdminUser({
          action: "update",
          userId: editingUserId,
          fullName: form.fullName.trim(),
          email: normalizeEmail(form.email),
          password: form.password || undefined,
          role: form.role,
          isActive: form.isActive,
        })
        toast.success("Acceso actualizado.")
      } else {
        await manageAdminUser({
          action: "create",
          fullName: form.fullName.trim(),
          email: normalizeEmail(form.email),
          password: form.password,
          role: form.role,
          isActive: form.isActive,
        })
        toast.success("Acceso creado.")
      }

      resetForm()
      await loadData()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar el acceso."
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (user: AdminUserRow) => {
    try {
      setUpdatingId(user.id)
      await manageAdminUser({
        action: user.is_active ? "deactivate" : "reactivate",
        userId: user.id,
      })
      toast.success(user.is_active ? "Acceso desactivado." : "Acceso activado.")
      await loadData()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar el acceso."
      toast.error(message)
    } finally {
      setUpdatingId(null)
    }
  }

  return {
    users,
    auditLogs,
    form,
    editingUserId,
    loading,
    saving,
    updatingId,
    error,
    summary,
    reload: loadData,
    resetForm,
    startEdit,
    handleChange,
    handleSubmit,
    toggleStatus,
  }
}
