import { supabase } from "../../../lib/supabase"

export type RetentionAppointmentRow = {
  id: string
  client_id: string | null
  date: string | null
  time: string | null
  status: string | null
  clients:
    | { full_name: string | null; phone: string | null }
    | { full_name: string | null; phone: string | null }[]
    | null
  services:
    | { name: string | null; category: string | null }
    | { name: string | null; category: string | null }[]
    | null
}

export async function fetchRetentionAppointments() {
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
    .in("status", ["confirmed", "completed"])
    .order("date", { ascending: false })
    .limit(500)

  if (error) {
    throw new Error("No se pudo cargar fidelización.")
  }

  return (data ?? []) as RetentionAppointmentRow[]
}
