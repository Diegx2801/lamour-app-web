import {
  getAvailableLashTimeSlots,
  hasCapacityForLashes,
} from "../../../lib/availability"

export type RelatedAvailabilityService =
  | {
      category: string | null
      duration_minutes: number | null
    }
  | {
      category: string | null
      duration_minutes: number | null
    }[]
  | null
  | undefined

export type AppointmentAvailabilityRow = {
  id?: string
  date: string
  time: string
  status: string
  serviceCategory: string | null
  durationMinutes: number | null
}

export type ScheduleBlockRow = {
  id: string
  date: string
  time: string | null
  reason: string | null
  is_full_day: boolean
}

export type BasicServiceForAvailability = {
  category: string | null
  duration_minutes: number | null
}

type RawAppointmentForAvailability = {
  id?: string
  date: string
  time: string
  status: string
  services?: RelatedAvailabilityService
}

type GetAvailableSlotsInput = {
  appointments: AppointmentAvailabilityRow[]
  selectedService: BasicServiceForAvailability | null
  date: string
  timeSlots: string[]
  blockedTimes?: string[]
  excludeAppointmentId?: string
  lashistas?: number
  removePastSlots?: boolean
}

type ValidateSlotInput = {
  appointments: AppointmentAvailabilityRow[]
  selectedService: BasicServiceForAvailability | null
  date: string
  time: string
  blockedTimes?: string[]
  excludeAppointmentId?: string
  lashistas?: number
  removePastSlots?: boolean
}

function normalizeTime(time: string | null | undefined) {
  return String(time ?? "").slice(0, 5)
}

function getTodayLocalDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function timeToMinutes(time: string) {
  const [hours, minutes] = normalizeTime(time).split(":").map(Number)
  return hours * 60 + minutes
}

export function getPastTimesForDate(date: string, timeSlots: string[]) {
  const today = getTodayLocalDate()

  if (date !== today) return []

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  return timeSlots.filter((slot) => timeToMinutes(slot) <= currentMinutes)
}

export function getRelatedAvailabilityService(
  service: RelatedAvailabilityService
) {
  if (!service) return null
  return Array.isArray(service) ? service[0] ?? null : service
}

export function mapAppointmentsForAvailability(
  rawAppointments: (RawAppointmentForAvailability | AppointmentAvailabilityRow)[]
): AppointmentAvailabilityRow[] {
  return (rawAppointments ?? []).map((item) => {
    const relatedService =
      "services" in item ? getRelatedAvailabilityService(item.services) : null

    return {
      id: item.id,
      date: item.date,
      time: normalizeTime(item.time),
      status: item.status,
      serviceCategory:
        "serviceCategory" in item
          ? item.serviceCategory
          : relatedService?.category ?? null,
      durationMinutes:
        relatedService?.category === "Pestañas"
          ? 120
          : relatedService?.duration_minutes ?? null,
    }
  })
}

export function getFullDayBlock(blocks: ScheduleBlockRow[]) {
  return blocks.find((block) => block.is_full_day) ?? null
}

export function getBlockedTimes(blocks: ScheduleBlockRow[]) {
  return blocks
    .filter((block) => !block.is_full_day && block.time)
    .map((block) => normalizeTime(block.time))
}

function getRelevantAppointments(
  appointments: AppointmentAvailabilityRow[],
  excludeAppointmentId?: string
) {
  return excludeAppointmentId
    ? appointments.filter((item) => item.id !== excludeAppointmentId)
    : appointments
}

export function getAvailableSlotsForService({
  appointments,
  selectedService,
  date,
  timeSlots,
  blockedTimes = [],
  excludeAppointmentId,
  lashistas = 2,
  removePastSlots = false,
}: GetAvailableSlotsInput) {
  if (!selectedService || !date) return []

  const relevantAppointments = getRelevantAppointments(
    appointments,
    excludeAppointmentId
  )

  let filteredSlots: string[] = []

  if (selectedService.category === "Pestañas") {
    filteredSlots = getAvailableLashTimeSlots(
      relevantAppointments,
      date,
      timeSlots,
      lashistas,
      Number(selectedService.duration_minutes ?? 120)
    )
  } else {
    const occupiedTimes = new Set(
      relevantAppointments
        .filter((item) => item.serviceCategory !== "Pestañas")
        .map((item) => item.time)
    )

    filteredSlots = timeSlots.filter((slot) => !occupiedTimes.has(slot))
  }

  const blockedTimesSet = new Set(blockedTimes)

  let finalSlots = filteredSlots.filter((slot) => !blockedTimesSet.has(slot))

  if (removePastSlots) {
    const pastTimesSet = new Set(getPastTimesForDate(date, timeSlots))
    finalSlots = finalSlots.filter((slot) => !pastTimesSet.has(slot))
  }

  return finalSlots
}

export function validateSlotAvailability({
  appointments,
  selectedService,
  date,
  time,
  blockedTimes = [],
  excludeAppointmentId,
  lashistas = 2,
  removePastSlots = false,
}: ValidateSlotInput) {
  if (!selectedService) {
    throw new Error("Servicio no encontrado.")
  }

  if (blockedTimes.includes(time)) {
    throw new Error("Ese horario está bloqueado.")
  }

  if (removePastSlots) {
    const pastTimes = getPastTimesForDate(date, [time])

    if (pastTimes.includes(time)) {
      throw new Error("Ese horario ya pasó. Selecciona una hora disponible.")
    }
  }

  const relevantAppointments = getRelevantAppointments(
    appointments,
    excludeAppointmentId
  )

  if (selectedService.category === "Pestañas") {
    const hasCapacity = hasCapacityForLashes(
      relevantAppointments,
      date,
      time,
      lashistas,
      Number(selectedService.duration_minutes ?? 120)
    )

    if (!hasCapacity) {
      throw new Error("Ese horario ya no tiene disponibilidad para pestañas.")
    }

    return
  }

  const hasConflict = relevantAppointments.some(
    (item) => item.time === time && item.serviceCategory !== "Pestañas"
  )

  if (hasConflict) {
    throw new Error("Ese horario ya está ocupado.")
  }
}