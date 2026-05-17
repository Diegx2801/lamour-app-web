import { timeSlots as fallbackTimeSlots } from "../../../data/timeSlots"

export type BusinessHour = {
  id?: string
  day_of_week: number
  day_label: string
  open_time: string | null
  close_time: string | null
  is_closed: boolean
  slot_interval_minutes: number
}

export const fallbackBusinessHours: BusinessHour[] = [
  { day_of_week: 1, day_label: "Lunes", open_time: "09:00", close_time: "19:00", is_closed: false, slot_interval_minutes: 60 },
  { day_of_week: 2, day_label: "Martes", open_time: "09:00", close_time: "19:00", is_closed: false, slot_interval_minutes: 60 },
  { day_of_week: 3, day_label: "Miércoles", open_time: "09:00", close_time: "19:00", is_closed: false, slot_interval_minutes: 60 },
  { day_of_week: 4, day_label: "Jueves", open_time: "09:00", close_time: "19:00", is_closed: false, slot_interval_minutes: 60 },
  { day_of_week: 5, day_label: "Viernes", open_time: "09:00", close_time: "19:00", is_closed: false, slot_interval_minutes: 60 },
  { day_of_week: 6, day_label: "Sábado", open_time: "09:00", close_time: "19:00", is_closed: false, slot_interval_minutes: 60 },
  { day_of_week: 0, day_label: "Domingo", open_time: null, close_time: null, is_closed: true, slot_interval_minutes: 60 },
]

function normalizeTime(time: string | null | undefined) {
  return String(time ?? "").slice(0, 5)
}

function timeToMinutes(time: string) {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number)
  return hours * 60 + minutes
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function getDayOfWeek(date: string) {
  return new Date(`${date}T12:00:00`).getDay()
}

export function getBusinessHourForDate(
  businessHours: BusinessHour[],
  date: string
) {
  const source = businessHours.length > 0 ? businessHours : fallbackBusinessHours
  const day = getDayOfWeek(date)
  return source.find((item) => item.day_of_week === day) ?? fallbackBusinessHours[day]
}

export function getTimeSlotsForBusinessHour(hour: BusinessHour | null | undefined) {
  if (!hour) return fallbackTimeSlots
  if (hour.is_closed || !hour.open_time || !hour.close_time) return []

  const interval = Number(hour.slot_interval_minutes || 60)
  const start = timeToMinutes(hour.open_time)
  const end = timeToMinutes(hour.close_time)
  const slots: string[] = []

  for (let current = start; current < end; current += interval) {
    slots.push(minutesToTime(current))
  }

  return slots
}

export function formatBusinessHour(hour: BusinessHour) {
  if (hour.is_closed || !hour.open_time || !hour.close_time) return "Cerrado"
  return `${hour.open_time} - ${hour.close_time}`
}
