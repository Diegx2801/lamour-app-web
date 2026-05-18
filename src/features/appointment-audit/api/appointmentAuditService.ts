import { supabase } from "../../../lib/supabase"

export type AppointmentAuditLog = {
  id: string
  appointment_id: string
  action: string
  actor_email: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export type AppointmentAuditActivity = AppointmentAuditLog & {
  type?: "appointment"
  appointments:
    | {
        date: string | null
        time: string | null
        clients:
          | {
              full_name: string | null
              phone: string | null
            }
          | {
              full_name: string | null
              phone: string | null
            }[]
          | null
        services:
          | {
              name: string | null
              category: string | null
            }
          | {
              name: string | null
              category: string | null
            }[]
          | null
      }
    | {
        date: string | null
        time: string | null
        clients:
          | {
              full_name: string | null
              phone: string | null
            }
          | {
              full_name: string | null
              phone: string | null
            }[]
          | null
        services:
          | {
              name: string | null
              category: string | null
            }
          | {
              name: string | null
              category: string | null
            }[]
          | null
      }[]
    | null
}

export type AdminActivityLog = {
  id: string
  type: "admin"
  entity_type: string
  entity_id: string | null
  action: string
  actor_email: string | null
  details: Record<string, unknown> | null
  created_at: string
  appointment_id: null
  appointments: null
}

export async function createAppointmentAuditLog(payload: {
  appointmentId: string
  action: string
  details?: Record<string, unknown>
}) {
  const { data } = await supabase.auth.getUser()

  const { error } = await supabase.from("appointment_audit_logs").insert([
    {
      appointment_id: payload.appointmentId,
      action: payload.action,
      actor_id: data.user?.id ?? null,
      actor_email: data.user?.email ?? null,
      details: payload.details ?? {},
    },
  ])

  if (error) {
    console.warn("No se pudo registrar historial de cita:", error.message)
  }
}

export async function createAdminActivityLog(payload: {
  entityType: string
  entityId?: string | number | null
  action: string
  details?: Record<string, unknown>
}) {
  const { data } = await supabase.auth.getUser()

  const { error } = await supabase.from("admin_activity_logs").insert([
    {
      entity_type: payload.entityType,
      entity_id:
        payload.entityId === null || payload.entityId === undefined
          ? null
          : String(payload.entityId),
      action: payload.action,
      actor_id: data.user?.id ?? null,
      actor_email: data.user?.email ?? null,
      details: payload.details ?? {},
    },
  ])

  if (error) {
    console.warn("No se pudo registrar actividad administrativa:", error.message)
  }
}

export async function fetchAppointmentAuditLogs(appointmentId: string) {
  const { data, error } = await supabase
    .from("appointment_audit_logs")
    .select("id, appointment_id, action, actor_email, details, created_at")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false })

  if (error) {
    console.warn("No se pudo cargar historial de cita:", error.message)
    return []
  }

  return (data ?? []) as AppointmentAuditLog[]
}

async function fetchAppointmentAuditActivity(limit = 80) {
  const { data, error } = await supabase
    .from("appointment_audit_logs")
    .select(`
      id,
      appointment_id,
      action,
      actor_email,
      details,
      created_at,
      appointments (
        date,
        time,
        clients (
          full_name,
          phone
        ),
        services (
          name,
          category
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error("No se pudo cargar la actividad.")
  }

  return ((data ?? []) as AppointmentAuditActivity[]).map((item) => ({
    ...item,
    type: "appointment" as const,
  }))
}

async function fetchAdminActivityLogs(limit = 80) {
  const { data, error } = await supabase
    .from("admin_activity_logs")
    .select("id, entity_type, entity_id, action, actor_email, details, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.warn("No se pudo cargar actividad administrativa:", error.message)
    return []
  }

  return (data ?? []).map((item) => ({
    ...item,
    type: "admin" as const,
    appointment_id: null,
    appointments: null,
  })) as AdminActivityLog[]
}

export async function fetchUnifiedAdminActivity(limit = 80) {
  const [appointmentLogs, adminLogs] = await Promise.all([
    fetchAppointmentAuditActivity(limit),
    fetchAdminActivityLogs(limit),
  ])

  return [...appointmentLogs, ...adminLogs]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, limit)
}
