import { supabase } from "../../../lib/supabase"
import type { ScheduleBlockRow } from "../../reservations/utils/reservationAvailability"

export type AppointmentType = "normal" | "retouch"

export type AdminServiceRow = {
  id: string
  name: string
  price: number
  category: string | null
  duration_minutes: number | null
  allows_retouch: boolean
  retouch_price: number | null
  retouch_days: number | null
}

export type AdminLashistRow = {
  id: string
  name: string
  phone: string | null
  is_active: boolean
}

export async function fetchAdminServices(): Promise<AdminServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select(`
      id,
      name,
      price,
      category,
      duration_minutes,
      allows_retouch,
      retouch_price,
      retouch_days
    `)
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error("No se pudieron cargar los servicios.")
  }

  return (data ?? []) as AdminServiceRow[]
}

export async function fetchAdminLashists(): Promise<AdminLashistRow[]> {
  const { data, error } = await supabase
    .from("lashists")
    .select("id, name, phone, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error("No se pudieron cargar las lashistas.")
  }

  return (data ?? []) as AdminLashistRow[]
}

export async function fetchAdminAvailability(date: string) {
  const [
    { data: appointmentsData, error: appointmentsError },
    { data: blocksData, error: blocksError },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        status,
        lashista,
        lashist_id,
        appointment_type,
        services (
          category,
          duration_minutes
        )
      `)
      .eq("date", date)
      .neq("status", "cancelled"),

    supabase
      .from("schedule_blocks")
      .select("id, date, time, reason, is_full_day")
      .eq("date", date),
  ])

  if (appointmentsError) {
    throw new Error("No se pudieron cargar las reservas del día.")
  }

  if (blocksError) {
    throw new Error("No se pudieron cargar los bloqueos del día.")
  }

  return {
    appointmentsData: appointmentsData ?? [],
    blocks: (blocksData ?? []) as ScheduleBlockRow[],
  }
}

export async function findOrCreateAdminClient(fullName: string, phone: string) {
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .select("id, full_name, phone")
    .eq("phone", phone)
    .maybeSingle()

  if (clientError) {
    throw new Error("Error al buscar cliente.")
  }

  if (!clientData?.id) {
    const { data: newClient, error: newClientError } = await supabase
      .from("clients")
      .insert([
        {
          full_name: fullName,
          phone,
        },
      ])
      .select("id")
      .single()

    if (newClientError || !newClient) {
      throw new Error("No se pudo crear el cliente.")
    }

    return newClient.id
  }

  const { error: updateClientError } = await supabase
    .from("clients")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", clientData.id)

  if (updateClientError) {
    throw new Error("No se pudo actualizar el cliente.")
  }

  return clientData.id
}

export async function createAdminReservationWithPayment(payload: {
  clientId: string
  serviceId: string
  date: string
  time: string
  notes: string
  lashistId: string | null
  lashista: string | null
  totalPrice: number
  deposit: number
  appointmentType: AppointmentType
}) {
  const remainingAmount = Math.max(payload.totalPrice - payload.deposit, 0)

  const { data: insertedAppointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert([
      {
        client_id: payload.clientId,
        service_id: payload.serviceId,
        date: payload.date,
        time: payload.time,
        status: "confirmed",
        notes: payload.notes || null,
        lashist_id: payload.lashistId,
        lashista: payload.lashista,
        appointment_type: payload.appointmentType,
        total_price: payload.totalPrice,
        deposit_amount: payload.deposit,
        remaining_amount: remainingAmount,
      },
    ])
    .select("id")
    .single()

  if (appointmentError || !insertedAppointment) {
    console.error("Error creando reserva admin:", appointmentError)

    throw new Error(
      appointmentError?.message ?? "No se pudo crear la reserva."
    )
  }

  const { error: paymentError } = await supabase.from("payments").insert([
    {
      appointment_id: insertedAppointment.id,
      amount: payload.deposit,
      payment_method: "efectivo",
      payment_type: "deposit",
      status: "completed",
    },
  ])

  if (paymentError) {
    console.error("Error creando pago admin:", paymentError)

    throw new Error(
      paymentError.message ??
        "Se creó la reserva, pero no se pudo registrar el abono."
    )
  }

  return insertedAppointment.id
}