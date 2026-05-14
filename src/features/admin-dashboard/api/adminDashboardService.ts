import { supabase } from "../../../lib/supabase"

export type DashboardAppointmentRow = {
  id: string
  client_id: string | null
  created_at: string | null
  date: string
  time: string
  status: string
  lashista: string | null
  lashist_id: string | null
  total_price: number | null
  remaining_amount: number | null
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
        duration_minutes: number | null
      }
    | {
        name: string | null
        category: string | null
        duration_minutes: number | null
      }[]
    | null
}

export type DashboardPaymentRow = {
  id: string
  amount: number | null
  status: string | null
  created_at: string | null
}

export async function fetchDashboardAppointments() {
  const { data, error } = await supabase.from("appointments").select(`
    id,
    client_id,
    created_at,
    date,
    time,
    status,
    lashista,
    lashist_id,
    total_price,
    remaining_amount,
    clients (
      full_name,
      phone
    ),
    services (
      name,
      category,
      duration_minutes
    )
  `)

  if (error) {
    throw new Error("No se pudieron cargar las reservas del dashboard.")
  }

  return (data ?? []) as DashboardAppointmentRow[]
}

export async function fetchDashboardPayments() {
  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, status, created_at")

  if (error) {
    throw new Error("No se pudieron cargar los pagos del dashboard.")
  }

  return (data ?? []) as DashboardPaymentRow[]
}
