import { supabase } from "../../../lib/supabase"

export type DashboardAppointmentRow = {
  id: string
  date: string
  time: string
  status: string
  total_price: number | null
  remaining_amount: number | null
  clients:
    | {
        full_name: string | null
      }
    | {
        full_name: string | null
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

export type DashboardPaymentRow = {
  id: string
  amount: number | null
  status: string | null
  created_at: string | null
}

export async function fetchDashboardAppointments() {
  const { data, error } = await supabase.from("appointments").select(`
    id,
    date,
    time,
    status,
    total_price,
    remaining_amount,
    clients (full_name),
    services (name, category)
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