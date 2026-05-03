import { supabase } from "../../../lib/supabase"

export type FollowUpAppointmentRow = {
  id: string
  client_id: string
  date: string
  time: string
  status: string
  follow_up_contacted_at: string | null
  follow_up_contacted_channel: string | null
  follow_up_notes: string | null
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

export async function fetchCompletedAppointmentsForFollowUp() {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      client_id,
      date,
      time,
      status,
      follow_up_contacted_at,
      follow_up_contacted_channel,
      follow_up_notes,
      clients (
        full_name,
        phone
      ),
      services (
        name,
        category
      )
    `)
    .eq("status", "completed")
    .order("date", { ascending: false })
    .order("time", { ascending: false })

  if (error) {
    throw new Error("No se pudo cargar el seguimiento de clientes.")
  }

  return (data ?? []) as FollowUpAppointmentRow[]
}

export async function markFollowUpAsContacted(appointmentId: string) {
  const { error } = await supabase
    .from("appointments")
    .update({
      follow_up_contacted_at: new Date().toISOString(),
      follow_up_contacted_channel: "whatsapp",
    })
    .eq("id", appointmentId)

  if (error) {
    throw new Error("No se pudo marcar el seguimiento como contactado.")
  }
}

export async function clearFollowUpContacted(appointmentId: string) {
  const { error } = await supabase
    .from("appointments")
    .update({
      follow_up_contacted_at: null,
      follow_up_contacted_channel: null,
      follow_up_notes: null,
    })
    .eq("id", appointmentId)

  if (error) {
    throw new Error("No se pudo revertir el seguimiento.")
  }
}