import { supabase } from "../../../lib/supabase"

export type AgendaLashistRow = {
  id: string
  name: string
  phone: string | null
  is_active: boolean
}

export async function fetchAgendaLashists() {
  const { data, error } = await supabase
    .from("lashists")
    .select("id, name, phone, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) {
    throw new Error("Error cargando lashistas")
  }

  return (data ?? []) as AgendaLashistRow[]
}

export async function fetchAgendaByDate(date: string) {
  const [reservationsRes, blocksRes] = await Promise.all([
    supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        status,
        notes,
        lashista,
        lashist_id,
        appointment_type,
        total_price,
        deposit_amount,
        remaining_amount,
        clients (
          full_name,
          phone
        ),
        services (
          name,
          category,
          duration_minutes,
          package_includes_lashes
        )
      `)
      .eq("date", date)
      .order("time", { ascending: true }),

    supabase
      .from("schedule_blocks")
      .select("*")
      .eq("date", date),
  ])

  let reservationsData = reservationsRes.data as unknown[] | null
  let reservationsError = reservationsRes.error

  if (reservationsError) {
    const fallbackRes = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        time,
        status,
        notes,
        lashista,
        lashist_id,
        appointment_type,
        total_price,
        deposit_amount,
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
      .eq("date", date)
      .order("time", { ascending: true })

    reservationsData = fallbackRes.data
    reservationsError = fallbackRes.error
  }

  if (reservationsError || blocksRes.error) {
    console.error("Error cargando agenda:", {
      reservationsError,
      blocksError: blocksRes.error,
    })

    throw new Error("Error cargando agenda")
  }

  return {
    reservations: reservationsData ?? [],
    blocks: blocksRes.data ?? [],
  }
}

export async function fetchAgendaWeek(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, date, status, remaining_amount")
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    throw new Error("Error cargando resumen semanal")
  }

  return data ?? []
}

export async function blockTime(
  date: string,
  time: string,
  reason?: string,
  lashistId?: string | null
) {
  const payload: Record<string, string | boolean | null> = {
    date,
    time,
    reason: reason || null,
    is_full_day: false,
  }

  if (lashistId) {
    payload.lashist_id = lashistId
  }

  const { error } = await supabase.from("schedule_blocks").insert([payload])

  if (error) {
    throw new Error("Error bloqueando horario")
  }
}

export async function unblockTime(blockId: string) {
  const { error } = await supabase
    .from("schedule_blocks")
    .delete()
    .eq("id", blockId)

  if (error) {
    throw new Error("Error desbloqueando horario")
  }
}

export async function blockFullDay(
  date: string,
  reason?: string,
  lashistId?: string | null
) {
  const payload: Record<string, string | boolean | null> = {
    date,
    time: null,
    reason: reason || null,
    is_full_day: true,
  }

  if (lashistId) {
    payload.lashist_id = lashistId
  }

  const { error } = await supabase.from("schedule_blocks").insert([payload])

  if (error) {
    throw new Error("Error bloqueando día")
  }
}

export async function unblockFullDay(blockId: string) {
  const { error } = await supabase
    .from("schedule_blocks")
    .delete()
    .eq("id", blockId)

  if (error) {
    throw new Error("Error desbloqueando día")
  }
}

export async function updateAppointmentStatus(id: string, status: string) {
  if (status === "completed") {
    const { data, error: fetchError } = await supabase
      .from("appointments")
      .select("remaining_amount")
      .eq("id", id)
      .single()

    if (fetchError || !data) {
      throw new Error("No se pudo validar el saldo de la reserva")
    }

    if (Number(data.remaining_amount ?? 0) > 0) {
      throw new Error(
        "No puedes marcar como completada una cita con saldo pendiente."
      )
    }
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)

  if (error) {
    throw new Error("Error actualizando estado")
  }
}
