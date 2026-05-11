import { supabase } from "../../../lib/supabase"

export type AppointmentAuditLog = {
  id: string
  appointment_id: string
  action: string
  actor_email: string | null
  details: Record<string, unknown> | null
  created_at: string
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
