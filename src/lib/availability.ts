export type AppointmentLike = {
  date: string
  time: string
  status: string
  serviceCategory?: string | null
  durationMinutes?: number | null
}

const ACTIVE_STATUSES = new Set(["pending", "confirmed", "completed"])

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.slice(0, 5).split(":").map(Number)
  return hours * 60 + minutes
}

function overlaps(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && startB < endA
}

export function hasCapacityForLashes(
  appointments: AppointmentLike[],
  selectedDate: string,
  selectedTime: string,
  capacity = 2,
  durationMinutes = 120
): boolean {
  const newStart = timeToMinutes(selectedTime)
  const newEnd = newStart + durationMinutes

  let overlappingCount = 0

  for (const appointment of appointments) {
    if (appointment.date !== selectedDate) continue
    if (!ACTIVE_STATUSES.has(appointment.status)) continue
    if (appointment.serviceCategory !== "Pestañas") continue

    const existingStart = timeToMinutes(appointment.time)
    const existingDuration = appointment.durationMinutes ?? 120
    const existingEnd = existingStart + existingDuration

    if (overlaps(newStart, newEnd, existingStart, existingEnd)) {
      overlappingCount += 1
    }
  }

  return overlappingCount < capacity
}

export function getAvailableLashTimeSlots(
  appointments: AppointmentLike[],
  selectedDate: string,
  allSlots: string[],
  capacity = 2,
  durationMinutes = 120
): string[] {
  return allSlots.filter((slot) =>
    hasCapacityForLashes(
      appointments,
      selectedDate,
      slot,
      capacity,
      durationMinutes
    )
  )
}