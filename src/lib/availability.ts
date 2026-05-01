export type AppointmentAvailabilityRow = {
  date: string
  time: string
  status: string
  serviceCategory: string | null
  durationMinutes: number | null
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
) {
  return startA < endB && startB < endA
}

export function hasCapacityForLashes(
  appointments: AppointmentAvailabilityRow[],
  date: string,
  slot: string,
  lashistas = 2,
  serviceDuration = 120
) {
  const newStart = timeToMinutes(slot)
  const newEnd = newStart + serviceDuration

  const overlappingAppointments = appointments.filter((appointment) => {
    if (appointment.date !== date) return false
    if (appointment.status === "cancelled") return false
    if (appointment.serviceCategory !== "Pestañas") return false
    if (!appointment.time) return false

    const existingStart = timeToMinutes(appointment.time)
    const existingDuration = Number(appointment.durationMinutes ?? 120)
    const existingEnd = existingStart + existingDuration

    return rangesOverlap(newStart, newEnd, existingStart, existingEnd)
  })

  return overlappingAppointments.length < lashistas
}

export function getAvailableLashTimeSlots(
  appointments: AppointmentAvailabilityRow[],
  date: string,
  timeSlots: string[],
  lashistas = 2,
  serviceDuration = 120
) {
  return timeSlots.filter((slot) =>
    hasCapacityForLashes(
      appointments,
      date,
      slot,
      lashistas,
      serviceDuration
    )
  )
}