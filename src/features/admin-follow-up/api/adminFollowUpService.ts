import { supabase } from "../../../lib/supabase"

export type FollowUpAppointmentRow = {
  id: string
  client_id: string
  date: string
  time: string
  status: string
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