import { supabase } from "../../../lib/supabase"

export type PaymentRow = {
  id: string
  amount: number
  payment_method: string | null
  payment_type: string | null
  status: string | null
  created_at?: string
}

export type AppointmentPaymentSummary = {
  id: string
  total_price: number
  deposit_amount: number
  remaining_amount: number
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

export async function fetchAppointmentPaymentSummary(appointmentId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      total_price,
      deposit_amount,
      remaining_amount,
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
    .eq("id", appointmentId)
    .single()

  if (error || !data) {
    throw new Error("No se pudo cargar la información de la reserva.")
  }

  return data as AppointmentPaymentSummary
}

export async function fetchAppointmentPayments(appointmentId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, payment_method, payment_type, status, created_at")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("No se pudo cargar el historial de pagos.")
  }

  return (data ?? []) as PaymentRow[]
}

export async function createAppointmentPayment(payload: {
  appointmentId: string
  amount: number
  paymentMethod: string
}) {
  const { error } = await supabase.from("payments").insert([
    {
      appointment_id: payload.appointmentId,
      amount: payload.amount,
      payment_method: payload.paymentMethod,
      payment_type: "deposit",
      status: "completed",
    },
  ])

  if (error) {
    throw new Error("No se pudo registrar el pago.")
  }
}

export async function updateAppointmentPaymentTotals(payload: {
  appointmentId: string
  totalPaid: number
  remainingAmount: number
}) {
  const { error } = await supabase
    .from("appointments")
    .update({
      deposit_amount: payload.totalPaid,
      remaining_amount: payload.remainingAmount,
      status: payload.remainingAmount <= 0 ? "completed" : "confirmed",
    })
    .eq("id", payload.appointmentId)

  if (error) {
    throw new Error("No se pudo actualizar el saldo de la reserva.")
  }
}