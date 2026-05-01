import { supabase } from "../../../lib/supabase"

export async function fetchReservations() {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      client_id,
      date,
      time,
      status,
      total_price,
      deposit_amount,
      remaining_amount,
      notes,
      lashista,
      clients (full_name, phone),
      services (name, category)
    `)
    .order("date", { ascending: true })
    .order("time", { ascending: true })

  if (error) {
    throw new Error("No se pudieron cargar las reservas.")
  }

  return data ?? []
}

export async function updateReservationStatus(id: string, status: string) {
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo actualizar el estado.")
  }
}