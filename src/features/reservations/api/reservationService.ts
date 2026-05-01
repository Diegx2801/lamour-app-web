import { supabase } from "../../../lib/supabase"
import { getRelatedService } from "../utils/reservationUtils"
import type { ScheduleBlockRow } from "../utils/reservationAvailability"

export type ServiceRow = {
  id: string
  name: string
  price: number
  category: string | null
  duration_minutes: number | null
  is_active?: boolean
}

export type AppointmentAvailabilityRow = {
  date: string
  time: string
  status: string
  serviceCategory: string | null
  durationMinutes: number | null
}

export async function fetchActiveServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, price, category, duration_minutes, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error("No se pudieron cargar los servicios.")
  }

  return (data ?? []) as ServiceRow[]
}

export async function fetchAppointmentsByDate(
  date: string
): Promise<AppointmentAvailabilityRow[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      date,
      time,
      status,
      services (
        category,
        duration_minutes
      )
    `)
    .eq("date", date)
    .neq("status", "cancelled")

  if (error) {
    throw new Error("Error al verificar disponibilidad del horario.")
  }

  return ((data ?? []) as any[]).map((item) => {
    const relatedService = getRelatedService(item.services)

    return {
      date: item.date,
      time: String(item.time).slice(0, 5),
      status: item.status,
      serviceCategory: relatedService?.category ?? null,
      durationMinutes:
        relatedService?.category === "Pestañas"
          ? 120
          : relatedService?.duration_minutes ?? null,
    }
  })
}

export async function fetchScheduleBlocksByDate(
  date: string
): Promise<ScheduleBlockRow[]> {
  const { data, error } = await supabase
    .from("schedule_blocks")
    .select("id, date, time, reason, is_full_day")
    .eq("date", date)

  if (error) {
    throw new Error("Error al verificar bloqueos de agenda.")
  }

  return (data ?? []) as ScheduleBlockRow[]
}

export async function fetchPublicAvailability(date: string) {
  const [appointments, blocks] = await Promise.all([
    fetchAppointmentsByDate(date),
    fetchScheduleBlocksByDate(date),
  ])

  return {
    appointments,
    blocks,
  }
}

export async function findClientByPhone(phone: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, full_name, phone")
    .eq("phone", phone)
    .maybeSingle()

  if (error) {
    throw new Error("Error al verificar cliente.")
  }

  return data
}

export async function createClient(fullName: string, phone: string) {
  const { data, error } = await supabase
    .from("clients")
    .insert([
      {
        full_name: fullName,
        phone,
      },
    ])
    .select("id")
    .single()

  if (error || !data) {
    throw new Error("No se pudo registrar el cliente.")
  }

  return data
}

export async function updateClient(
  clientId: string,
  fullName: string,
  phone: string
) {
  const { error } = await supabase
    .from("clients")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", clientId)

  if (error) {
    throw new Error("No se pudo actualizar el cliente.")
  }
}

type CreateAppointmentInput = {
  clientId: string
  serviceId: string
  date: string
  time: string
  notes: string
  totalPrice: number
  depositAmount: number
  remainingAmount: number
}

export async function createAppointment(input: CreateAppointmentInput) {
  const { error } = await supabase.from("appointments").insert([
    {
      client_id: input.clientId,
      service_id: input.serviceId,
      date: input.date,
      time: input.time,
      status: "pending",
      notes: input.notes || null,
      total_price: input.totalPrice,
      deposit_amount: input.depositAmount,
      remaining_amount: input.remainingAmount,
    },
  ])

  if (error) {
    throw new Error("No se pudo registrar la reserva.")
  }
}