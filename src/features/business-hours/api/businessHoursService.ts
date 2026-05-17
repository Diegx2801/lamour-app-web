import { supabase } from "../../../lib/supabase"
import {
  fallbackBusinessHours,
  type BusinessHour,
} from "../utils/businessHoursUtils"

export async function fetchBusinessHours() {
  const { data, error } = await supabase
    .from("business_hours")
    .select(
      "id, day_of_week, day_label, open_time, close_time, is_closed, slot_interval_minutes"
    )
    .order("day_of_week", { ascending: true })

  if (error) {
    console.warn("No se pudieron cargar horarios de atención:", error.message)
    return fallbackBusinessHours
  }

  return (data ?? fallbackBusinessHours) as BusinessHour[]
}

export async function updateBusinessHour(hour: BusinessHour) {
  const { error } = await supabase.from("business_hours").upsert(
    {
      id: hour.id,
      day_of_week: hour.day_of_week,
      day_label: hour.day_label,
      open_time: hour.is_closed ? null : hour.open_time,
      close_time: hour.is_closed ? null : hour.close_time,
      is_closed: hour.is_closed,
      slot_interval_minutes: Number(hour.slot_interval_minutes || 60),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "day_of_week" }
  )

  if (error) {
    throw new Error("No se pudo guardar el horario.")
  }
}
