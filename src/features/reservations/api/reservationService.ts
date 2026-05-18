import { supabase } from "../../../lib/supabase"
import { getRelatedService } from "../utils/reservationUtils"
import type {
  RawAppointmentForAvailability,
  ScheduleBlockRow,
} from "../utils/reservationAvailability"

export type ServiceRow = {
  id: string
  name: string
  description?: string | null
  price: number
  category: string | null
  duration_minutes: number | null
  retouch_price?: number | null
  allows_retouch?: boolean | null
  sort_order?: number | null
  is_active?: boolean
  is_package?: boolean
  package_includes_lashes?: boolean
  package_items?: PackageItemDetail[]
}

type PackageItemDetail = {
  id: string
  name: string
  price: number
  category: string | null
  duration_minutes: number | null
}

type PackageItemRow = {
  package_service_id: string
  included_service_id: string
  sort_order: number | null
}

type AppointmentAvailabilityRow = {
  date: string
  time: string
  status: string
  serviceCategory: string | null
  durationMinutes: number | null
  requiresLash?: boolean | null
  appointment_date?: string | null
  appointment_time?: string | null
  service_category?: string | null
  duration_minutes?: number | null
  package_includes_lashes?: boolean | null
}

type PublicScheduleBlockRow = ScheduleBlockRow & {
  block_date?: string | null
  block_time?: string | null
}

function normalizeCategory(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function getCategoryPriority(category: string | null | undefined) {
  const normalized = normalizeCategory(category)

  if (normalized === "pestanas") return 0
  if (normalized === "cejas") return 1
  if (normalized === "depilacion") return 2
  if (normalized === "faciales") return 3
  if (normalized === "labios") return 4
  if (normalized === "paquetes") return 5

  return 20
}

function sortPublicServices(services: ServiceRow[]) {
  return [...services].sort((a, b) => {
    const categoryPriority =
      getCategoryPriority(a.category) - getCategoryPriority(b.category)
    if (categoryPriority !== 0) return categoryPriority

    const categoryCompare = String(a.category ?? "").localeCompare(
      String(b.category ?? ""),
      "es"
    )
    if (categoryCompare !== 0) return categoryCompare

    const orderCompare = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
    if (orderCompare !== 0) return orderCompare

    return a.name.localeCompare(b.name, "es")
  })
}

export async function fetchActiveServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, name, description, price, category, duration_minutes, retouch_price, allows_retouch, sort_order, is_active, is_package, package_includes_lashes"
    )
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (!error) {
    const services = await withPackageDetails((data ?? []) as ServiceRow[])
    return sortPublicServices(services)
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("services")
    .select("id, name, description, price, category, duration_minutes, retouch_price, allows_retouch, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (fallbackError) {
    throw new Error("No se pudieron cargar los servicios.")
  }

  return sortPublicServices((fallbackData ?? []) as ServiceRow[])
}

async function withPackageDetails(services: ServiceRow[]) {
  const packageIds = services
    .filter((service) => service.is_package)
    .map((service) => service.id)

  if (packageIds.length === 0) return services

  const { data, error } = await supabase
    .from("service_package_items")
    .select("package_service_id, included_service_id, sort_order")
    .in("package_service_id", packageIds)
    .order("sort_order", { ascending: true })

  if (error) return services

  const packageItems = (data ?? []) as PackageItemRow[]

  return services.map((service) => {
    if (!service.is_package) return service

    const items = packageItems
      .filter((item) => item.package_service_id === service.id)
      .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
      .map((item) => {
        const includedService = services.find(
          (candidate) => candidate.id === item.included_service_id
        )

        if (!includedService) return null

        return {
          id: includedService.id,
          name: includedService.name,
          price: includedService.price,
          category: includedService.category,
          duration_minutes: includedService.duration_minutes,
        }
      })
      .filter((item): item is PackageItemDetail => Boolean(item))

    return {
      ...service,
      package_items: items,
    }
  })
}

export async function fetchActiveLashistCount() {
  const { data, error } = await supabase.rpc("get_active_lashist_count")

  if (error) {
    throw new Error("No se pudo cargar la capacidad de lashistas.")
  }

  return Number(data ?? 0)
}

async function fetchAppointmentsByDate(
  date: string
): Promise<AppointmentAvailabilityRow[]> {
  return fetchPublicAppointmentsByDate(date)

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      date,
      time,
      status,
      services (
        category,
        duration_minutes,
        package_includes_lashes
      )
    `)
    .eq("date", date)
    .neq("status", "cancelled")

  let appointmentRows: RawAppointmentForAvailability[] =
    (data ?? []) as RawAppointmentForAvailability[]

  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase
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

    if (fallbackError) {
      throw new Error("Error al verificar disponibilidad del horario.")
    }

    appointmentRows = (fallbackData ?? []) as RawAppointmentForAvailability[]
  }

  return appointmentRows.map((item) => {
    const relatedService = getRelatedService(item.services ?? null)

    return {
      date: item.date,
      time: String(item.time).slice(0, 5),
      status: item.status,
      serviceCategory: relatedService?.category ?? null,
      durationMinutes:
        relatedService?.category === "Pestañas"
          ? 120
          : relatedService?.duration_minutes ?? null,
      requiresLash:
        relatedService?.category === "Pestañas" ||
        Boolean(relatedService?.package_includes_lashes),
    }
  })
}

async function fetchPublicAppointmentsByDate(
  date: string
): Promise<AppointmentAvailabilityRow[]> {
  const { data, error } = await supabase.rpc(
    "get_public_appointments_by_date",
    { p_date: date }
  )

  if (error) {
    throw new Error("Error al verificar disponibilidad del horario.")
  }

  return ((data ?? []) as AppointmentAvailabilityRow[]).map((item) => ({
    date: item.date ?? item.appointment_date ?? "",
    time: String(item.time ?? item.appointment_time ?? "").slice(0, 5),
    status: item.status,
    serviceCategory: item.service_category ?? null,
    durationMinutes:
      item.service_category === "PestaÃ±as" ? 120 : item.duration_minutes ?? null,
    requiresLash:
      item.service_category === "PestaÃ±as" ||
      Boolean(item.package_includes_lashes),
    service_category: item.service_category,
    duration_minutes: item.duration_minutes,
    package_includes_lashes: item.package_includes_lashes,
  }))
}

async function fetchScheduleBlocksByDate(
  date: string
): Promise<ScheduleBlockRow[]> {
  const { data, error } = await supabase
    .rpc("get_public_schedule_blocks_by_date", { p_date: date })

  if (error) {
    throw new Error("Error al verificar bloqueos de agenda.")
  }

  return ((data ?? []) as PublicScheduleBlockRow[]).map((block) => ({
    id: block.id,
    date: block.date ?? block.block_date ?? "",
    time: block.time ?? block.block_time ?? null,
    reason: block.reason,
    is_full_day: block.is_full_day,
    lashist_id: block.lashist_id ?? null,
  }))
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

type PublicReservationResult = {
  appointment_id: string
  client_id: string
  total_price: number
  deposit_amount: number
  remaining_amount: number
}

export async function createPublicReservation(input: {
  fullName: string
  phone: string
  serviceId: string
  date: string
  time: string
  notes: string
}) {
  const { data, error } = await supabase
    .rpc("create_public_reservation", {
      p_full_name: input.fullName,
      p_phone: input.phone,
      p_service_id: input.serviceId,
      p_date: input.date,
      p_time: input.time,
      p_notes: input.notes || null,
    })
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo registrar la reserva.")
  }

  return data as PublicReservationResult
}
