import { supabase } from "../../../lib/supabase"
import { getRelatedService } from "../utils/reservationUtils"
import type {
  RawAppointmentForAvailability,
  ScheduleBlockRow,
} from "../utils/reservationAvailability"

export type ServiceRow = {
  id: string
  name: string
  price: number
  category: string | null
  duration_minutes: number | null
  is_active?: boolean
  is_package?: boolean
  package_includes_lashes?: boolean
  package_items?: PackageItemDetail[]
}

export type PackageItemDetail = {
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
}

export async function fetchActiveServices(): Promise<ServiceRow[]> {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, name, price, category, duration_minutes, is_active, is_package, package_includes_lashes"
    )
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (!error) {
    return withPackageDetails((data ?? []) as ServiceRow[])
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("services")
    .select("id, name, price, category, duration_minutes, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (fallbackError) {
    throw new Error("No se pudieron cargar los servicios.")
  }

  return (fallbackData ?? []) as ServiceRow[]
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
  const { count, error } = await supabase
    .from("lashists")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)

  if (error) {
    throw new Error("No se pudo cargar la capacidad de lashistas.")
  }

  return count ?? 0
}

async function fetchAppointmentsByDate(
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
