import { supabase } from "../../../lib/supabase"

export type ClientRelation =
  | {
      full_name: string | null
      phone: string | null
    }
  | {
      full_name: string | null
      phone: string | null
    }[]
  | null

export type ServiceRelation =
  | {
      name: string | null
      category: string | null
    }
  | {
      name: string | null
      category: string | null
    }[]
  | null

export type ClientHistoryRow = {
  id: string
  client_id: string
  date: string
  time: string
  status: string
  notes: string | null
  lashista: string | null
  total_price: number | null
  deposit_amount: number | null
  remaining_amount: number | null
  clients: ClientRelation
  services: ServiceRelation
}

export async function fetchClientHistory(clientId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      client_id,
      date,
      time,
      status,
      notes,
      lashista,
      total_price,
      deposit_amount,
      remaining_amount,
      clients (
        full_name,
        phone
      ),
      services (
        name,
        category
      )
    `)
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .order("time", { ascending: false })

  if (error) {
    throw new Error("No se pudo cargar el historial del cliente.")
  }

  return (data ?? []) as ClientHistoryRow[]
}