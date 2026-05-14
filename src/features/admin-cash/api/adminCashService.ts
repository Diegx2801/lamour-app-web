import { supabase } from "../../../lib/supabase"

export type CashPaymentRow = {
  id: string
  amount: number | null
  payment_method: string | null
  payment_type: string | null
  status: string | null
  created_at: string | null
  appointment_id?: string | null
  appointments?:
    | {
        clients:
          | { full_name: string | null; phone: string | null }
          | { full_name: string | null; phone: string | null }[]
          | null
        services:
          | { name: string | null; category: string | null }
          | { name: string | null; category: string | null }[]
          | null
      }
    | {
        clients:
          | { full_name: string | null; phone: string | null }
          | { full_name: string | null; phone: string | null }[]
          | null
        services:
          | { name: string | null; category: string | null }
          | { name: string | null; category: string | null }[]
          | null
      }[]
    | null
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

export type CashClosureRow = {
  id: string
  cash_date: string
  expected_amount: number | null
  counted_amount: number | null
  difference_amount: number | null
  notes: string | null
  closed_by_email: string | null
  closed_at: string | null
  reopened_at: string | null
  is_closed: boolean
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
    .select(`
      id,
      amount,
      payment_method,
      payment_type,
      status,
      created_at,
      appointment_id,
      appointments (
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
    .eq("status", "completed")
    .gte("created_at", `${date}T00:00:00`)
    .lt("created_at", `${nextDate}T00:00:00`)
    .order("created_at", { ascending: false })

  if (!error) {
    return (data ?? []) as CashPaymentRow[]
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("payments")
    .select("id, amount, payment_method, payment_type, status, created_at")
    .eq("status", "completed")
    .gte("created_at", `${date}T00:00:00`)
    .lt("created_at", `${nextDate}T00:00:00`)
    .order("created_at", { ascending: false })

  if (fallbackError) {
    throw new Error("No se pudieron cargar los pagos de caja.")
  }

  return (fallbackData ?? []) as CashPaymentRow[]
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

export async function fetchCashClosureByDate(date: string) {
  const { data, error } = await supabase
    .from("cash_closures")
    .select(
      "id, cash_date, expected_amount, counted_amount, difference_amount, notes, closed_by_email, closed_at, reopened_at, is_closed"
    )
    .eq("cash_date", date)
    .maybeSingle()

  if (error) {
    console.warn("No se pudo cargar cierre de caja:", error.message)
    return null
  }

  return data as CashClosureRow | null
}

export async function closeCashDay(payload: {
  date: string
  expectedAmount: number
  countedAmount: number
  notes: string
}) {
  const { data: userData } = await supabase.auth.getUser()
  const differenceAmount = payload.countedAmount - payload.expectedAmount

  const { error } = await supabase.from("cash_closures").upsert(
    {
      cash_date: payload.date,
      expected_amount: payload.expectedAmount,
      counted_amount: payload.countedAmount,
      difference_amount: differenceAmount,
      notes: payload.notes.trim() || null,
      closed_by: userData.user?.id ?? null,
      closed_by_email: userData.user?.email ?? null,
      closed_at: new Date().toISOString(),
      reopened_at: null,
      reopened_by: null,
      is_closed: true,
    },
    { onConflict: "cash_date" }
  )

  if (error) {
    throw new Error("No se pudo cerrar la caja.")
  }
}

export async function reopenCashDay(date: string) {
  const { data: userData } = await supabase.auth.getUser()

  const { error } = await supabase
    .from("cash_closures")
    .update({
      reopened_at: new Date().toISOString(),
      reopened_by: userData.user?.id ?? null,
      is_closed: false,
    })
    .eq("cash_date", date)

  if (error) {
    throw new Error("No se pudo reabrir la caja.")
  }
}
