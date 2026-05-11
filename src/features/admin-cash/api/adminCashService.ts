import { supabase } from "../../../lib/supabase"

export type CashPaymentRow = {
  id: string
  amount: number | null
  payment_method: string | null
  payment_type: string | null
  status: string | null
  created_at: string | null
}

export type CashAppointmentRow = {
  id: string
  date: string
  time: string
  status: string
  total_price: number | null
  deposit_amount: number | null
  remaining_amount: number | null
  clients:
    | { full_name: string | null; phone: string | null }
    | { full_name: string | null; phone: string | null }[]
    | null
  services:
    | { name: string | null }
    | { name: string | null }[]
    | null
}

function getNextDate(date: string) {
  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + 1)
  return next.toISOString().slice(0, 10)
}

export async function fetchCashPaymentsByDate(date: string) {
  const nextDate = getNextDate(date)

  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, payment_method, payment_type, status, created_at")
    .eq("status", "completed")
    .gte("created_at", `${date}T00:00:00`)
    .lt("created_at", `${nextDate}T00:00:00`)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("No se pudieron cargar los pagos de caja.")
  }

  return (data ?? []) as CashPaymentRow[]
}

export async function fetchCashAppointmentsByDate(date: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      date,
      time,
      status,
      total_price,
      deposit_amount,
      remaining_amount,
      clients (
        full_name,
        phone
      ),
      services (
        name
      )
    `)
    .eq("date", date)
    .order("time", { ascending: true })

  if (error) {
    throw new Error("No se pudieron cargar las reservas de caja.")
  }

  return (data ?? []) as CashAppointmentRow[]
}
