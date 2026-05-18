import { supabase } from "../../../lib/supabase"

export type AdminUserRole = "owner" | "staff"

export type AdminUserRow = {
  id: string
  full_name: string | null
  email: string | null
  role: AdminUserRole | "admin" | "followup" | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export type AdminUserAuditLog = {
  id: string
  target_user_id: string | null
  target_email: string | null
  action: string
  actor_email: string | null
  details: Record<string, unknown> | null
  created_at: string
}

type ManageAdminUserPayload =
  | {
      action: "create"
      fullName: string
      email: string
      password: string
      role: AdminUserRole
      isActive: boolean
    }
  | {
      action: "update"
      userId: string
      fullName: string
      email: string
      password?: string
      role: AdminUserRole
      isActive: boolean
    }
  | {
      action: "deactivate" | "reactivate"
      userId: string
    }

export async function fetchAdminUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_active, created_at, updated_at")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("No se pudieron cargar los usuarios.")
  }

  return (data ?? []) as AdminUserRow[]
}

export async function fetchAdminUserAuditLogs(limit = 30) {
  const { data, error } = await supabase
    .from("admin_user_audit_logs")
    .select(
      "id, target_user_id, target_email, action, actor_email, details, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error("No se pudo cargar el historial de usuarios.")
  }

  return (data ?? []) as AdminUserAuditLog[]
}

export async function manageAdminUser(payload: ManageAdminUserPayload) {
  const { data, error } = await supabase.functions.invoke(
    "manage-admin-user",
    {
      body: payload,
    }
  )

  if (error) {
    throw new Error(error.message)
  }

  if (data?.error) {
    throw new Error(String(data.error))
  }

  return data
}
