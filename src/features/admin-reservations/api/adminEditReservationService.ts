import { supabase } from "../../../lib/supabase"
import type { ScheduleBlockRow } from "../../reservations/utils/reservationAvailability"

export type EditReservationService =
  | {
      id: string
      name: string
      category: string | null
      duration_minutes: number | null
      package_includes_lashes?: boolean | null
    }
  | {
      id: string
      name: string
      category: string | null
      duration_minutes: number | null
      package_includes_lashes?: boolean | null
    }[]
  | null

export type EditReservationData = {
  id: string
  date: string
  time: string
  status: string
  notes: string | null
  lashista: string | null
  lashist_id: string | null
  remaining_amount: number | null
  services: EditReservationService
}

export type EditLashistRow = {
  id: string
  name: string
  phone: string | null
  is_active: boolean
}

export async function fetchEditLashists() {
  const { data, error } = await supabase
    .from("lashists")
    .select("id, name, phone, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) throw new Error("No se pudieron cargar las lashistas.")

  return (data ?? []) as EditLashistRow[]
}

export async function fetchReservationById(id: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      date,
      time,
      status,
      notes,
      lashista,
      lashist_id,
      remaining_amount,
      services (
        id,
        name,
        category,
        duration_minutes,
        package_includes_lashes
      )
    `)
    .eq("id", id)
    .single()

  if (!error && data) {
    return data as EditReservationData
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("appointments")
    .select(`
      id,
      date,
      time,
      status,
      notes,
      lashista,
      lashist_id,
      remaining_amount,
      services (
        id,
        name,
        category,
        duration_minutes
      )
    `)
    .eq("id", id)
    .single()

  if (fallbackError || !fallbackData) {
    throw new Error("No se pudo cargar la reserva.")
  }

  return fallbackData as EditReservationData
}

export async function fetchEditAvailability(date: string) {
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
        services (
          category,
          duration_minutes,
          package_includes_lashes
        )
      `)
      .eq("date", date)
      .neq("status", "cancelled"),

    supabase
      .from("schedule_blocks")
      .select("id, date, time, reason, is_full_day")
      .eq("date", date),
  ])

  let appointmentRows = appointmentsData as unknown[] | null
  let appointmentError = appointmentsError

  if (appointmentError) {
    const fallbackRes = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        status,
        lashista,
        lashist_id,
        services (
          category,
          duration_minutes
        )
      `)
      .eq("date", date)
      .neq("status", "cancelled")

    appointmentRows = fallbackRes.data
    appointmentError = fallbackRes.error
  }

  if (appointmentError) {
    throw new Error("No se pudieron cargar las reservas del día.")
  }

  if (blocksError) {
    throw new Error("No se pudieron cargar los bloqueos del día.")
  }

  return {
    appointmentsData: appointmentRows ?? [],
    blocks: (blocksData ?? []) as ScheduleBlockRow[],
  }
}

export async function updateReservationById(
  id: string,
  payload: {
    date: string
    time: string
    status: string
    notes: string
    lashistId: string | null
    lashista: string | null
  }
) {
  const { error } = await supabase
    .from("appointments")
    .update({
      date: payload.date,
      time: payload.time,
      status: payload.status,
      notes: payload.notes || null,
      lashist_id: payload.lashistId,
      lashista: payload.lashista,
    })
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo actualizar la reserva.")
  }
}
