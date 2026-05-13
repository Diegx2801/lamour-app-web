type RelatedAvailabilityService =
  | {
      category: string | null
      duration_minutes: number | null
      package_includes_lashes?: boolean | null
    }
  | {
      category: string | null
      duration_minutes: number | null
      package_includes_lashes?: boolean | null
    }[]
  | null
  | undefined

export type AppointmentAvailabilityRow = {
  id?: string
  date: string
  time: string
  status: string
  lashistId?: string | null
  serviceCategory: string | null
  durationMinutes: number | null
  requiresLash?: boolean | null
}

export type ScheduleBlockRow = {
  id: string
  date: string
  time: string | null
  reason: string | null
  is_full_day: boolean
  lashist_id?: string | null
}

export type BasicServiceForAvailability = {
  category: string | null
  duration_minutes: number | null
  package_includes_lashes?: boolean | null
}

export type RawAppointmentForAvailability = {
  id?: string
  date: string
  time: string
  status: string
  lashist_id?: string | null
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
  selectedLashistId?: string | null
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
  selectedLashistId?: string | null
  removePastSlots?: boolean
}

type ComputeAvailabilityInput = {
  appointments: AppointmentAvailabilityRow[]
  blocks: ScheduleBlockRow[]
  selectedService: BasicServiceForAvailability
  date: string
  timeSlots: string[]
  lashistas?: number
  removePastSlots?: boolean
  selectedLashistId?: string | null
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

function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
) {
  return startA < endB && startB < endA
}

function getServiceDuration(service: BasicServiceForAvailability) {
  return service.category === "Pestañas"
    ? 120
    : Number(service.duration_minutes ?? 60)
}

function getAppointmentDuration(appointment: AppointmentAvailabilityRow) {
  return appointment.serviceCategory === "Pestañas"
    ? 120
    : Number(appointment.durationMinutes ?? 60)
}

function appointmentConsumesCapacity(appointment: AppointmentAvailabilityRow) {
  return appointment.status !== "cancelled" && appointment.status !== "no_show"
}

function hasCapacityForService({
  appointments,
  date,
  time,
  capacity,
  duration,
  selectedLashistId,
}: {
  appointments: AppointmentAvailabilityRow[]
  date: string
  time: string
  capacity: number
  duration: number
  selectedLashistId?: string | null
}) {
  if (capacity <= 0) return false

  const newStart = timeToMinutes(time)
  const newEnd = newStart + duration

  const overlappingAppointments = appointments.filter((appointment) => {
    if (appointment.date !== date) return false
    if (!appointmentConsumesCapacity(appointment)) return false
    if (!appointment.time) return false
    if (selectedLashistId && appointment.lashistId !== selectedLashistId) {
      return false
    }

    const appointmentStart = timeToMinutes(appointment.time)
    const appointmentEnd = appointmentStart + getAppointmentDuration(appointment)

    return rangesOverlap(newStart, newEnd, appointmentStart, appointmentEnd)
  })

  return overlappingAppointments.length < (selectedLashistId ? 1 : capacity)
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
      lashistId:
        "lashistId" in item
          ? item.lashistId
          : "lashist_id" in item
          ? item.lashist_id ?? null
          : null,
      serviceCategory:
        "serviceCategory" in item
          ? item.serviceCategory
          : relatedService?.category ?? null,
      durationMinutes:
        "durationMinutes" in item
          ? item.durationMinutes
          : relatedService?.category === "Pestañas"
          ? 120
          : relatedService?.duration_minutes ?? null,
      requiresLash:
        "requiresLash" in item
          ? item.requiresLash
          : relatedService?.category === "Pestañas" ||
            Boolean(relatedService?.package_includes_lashes),
    }
  })
}

function blockAppliesToLashist(
  block: ScheduleBlockRow,
  selectedLashistId?: string | null
) {
  if (!block.lashist_id) return true
  return Boolean(selectedLashistId) && block.lashist_id === selectedLashistId
}

export function getFullDayBlock(
  blocks: ScheduleBlockRow[],
  selectedLashistId?: string | null
) {
  return (
    blocks.find(
      (block) =>
        block.is_full_day && blockAppliesToLashist(block, selectedLashistId)
    ) ?? null
  )
}

export function getBlockedTimes(
  blocks: ScheduleBlockRow[],
  selectedLashistId?: string | null
) {
  return blocks
    .filter(
      (block) =>
        !block.is_full_day &&
        block.time &&
        blockAppliesToLashist(block, selectedLashistId)
    )
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
  selectedLashistId,
  removePastSlots = false,
}: GetAvailableSlotsInput) {
  if (!selectedService || !date) return []

  const relevantAppointments = getRelevantAppointments(
    appointments,
    excludeAppointmentId
  )

  const serviceDuration = getServiceDuration(selectedService)
  const filteredSlots = timeSlots.filter((slot) =>
    hasCapacityForService({
      appointments: relevantAppointments,
      date,
      time: slot,
      capacity: lashistas,
      duration: serviceDuration,
      selectedLashistId,
    })
  )

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
  selectedLashistId,
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

  const hasConflict = !hasCapacityForService({
    appointments: relevantAppointments,
    date,
    time,
    capacity: lashistas,
    duration: getServiceDuration(selectedService),
    selectedLashistId,
  })

  if (hasConflict) {
    throw new Error("Ese horario ya no tiene disponibilidad.")
  }
}

export function computeAvailability({
  appointments,
  blocks,
  selectedService,
  date,
  timeSlots,
  lashistas = 2,
  removePastSlots = true,
  selectedLashistId,
}: ComputeAvailabilityInput) {
  const fullDayBlock = getFullDayBlock(blocks, selectedLashistId)

  if (fullDayBlock) {
    return {
      slots: [],
      blockedReason: fullDayBlock.reason || "Día bloqueado.",
    }
  }

  const blockedTimes = getBlockedTimes(blocks, selectedLashistId)
  const mappedAppointments = mapAppointmentsForAvailability(appointments)

  const slots = getAvailableSlotsForService({
    appointments: mappedAppointments,
    selectedService,
    date,
    timeSlots,
    blockedTimes,
    lashistas,
    removePastSlots,
    selectedLashistId,
  })

  return {
    slots,
    blockedReason: "",
  }
}
