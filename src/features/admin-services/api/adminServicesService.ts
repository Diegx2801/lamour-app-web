import { supabase } from "../../../lib/supabase"

export type AdminServiceRow = {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number | null
  category: string | null
  is_active: boolean
  allows_retouch: boolean
  retouch_price: number | null
  retouch_days: number | null
  is_package: boolean
  package_includes_lashes: boolean
  package_items: string[]
  sort_order: number
  created_at?: string | null
}

export type AdminServicePayload = {
  name: string
  description: string | null
  price: number
  duration_minutes: number
  category: string
  is_active: boolean
  allows_retouch: boolean
  retouch_price: number | null
  retouch_days: number
  is_package: boolean
  package_includes_lashes: boolean
  package_item_ids: string[]
  sort_order: number
}

type AdminServiceDbRow = Omit<AdminServiceRow, "package_items"> & {
  service_package_items?: { included_service_id: string; sort_order: number }[]
}

function normalizeServiceRow(row: Partial<AdminServiceDbRow>): AdminServiceRow {
  const packageItems = [...(row.service_package_items ?? [])].sort(
    (a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
  )

  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    description: row.description ?? null,
    price: Number(row.price ?? 0),
    duration_minutes: row.duration_minutes ?? null,
    category: row.category ?? null,
    is_active: Boolean(row.is_active),
    allows_retouch: Boolean(row.allows_retouch),
    retouch_price: row.retouch_price ?? null,
    retouch_days: row.retouch_days ?? null,
    is_package: Boolean(row.is_package),
    package_includes_lashes: Boolean(row.package_includes_lashes),
    package_items: packageItems.map((item) => item.included_service_id),
    sort_order: Number(row.sort_order ?? 0),
    created_at: row.created_at ?? null,
  }
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

function sortServicesForAdmin(services: AdminServiceRow[]) {
  return [...services].sort((a, b) => {
    if (a.is_active !== b.is_active) return a.is_active ? -1 : 1

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

function toServicePayload(
  payload: AdminServicePayload,
  options: { includePackageFields?: boolean; includeSortOrder?: boolean } = {}
) {
  const { includePackageFields = true, includeSortOrder = true } = options
  const servicePayload: Record<string, unknown> = {
    name: payload.name,
    description: payload.description,
    price: payload.price,
    duration_minutes: payload.duration_minutes,
    category: payload.category,
    is_active: payload.is_active,
    allows_retouch: payload.allows_retouch,
    retouch_price: payload.retouch_price,
    retouch_days: payload.retouch_days,
  }

  if (includeSortOrder) {
    servicePayload.sort_order = payload.sort_order
  }

  if (includePackageFields) {
    servicePayload.is_package = payload.is_package
    servicePayload.package_includes_lashes = payload.package_includes_lashes
  }

  return servicePayload
}

export async function fetchAdminServices() {
  const { data, error } = await supabase
    .from("services")
    .select(
      `
      id,
      name,
      description,
      price,
      duration_minutes,
      category,
      is_active,
      allows_retouch,
      retouch_price,
      retouch_days,
      is_package,
      package_includes_lashes,
      service_package_items (
        included_service_id,
        sort_order
      ),
      sort_order,
      created_at
    `
    )
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (!error) {
    return sortServicesForAdmin(
      ((data ?? []) as AdminServiceDbRow[]).map(normalizeServiceRow)
    )
  }

  const { data: fallbackData, error: fallbackError } = await supabase
    .from("services")
    .select(
      `
      id,
      name,
      description,
      price,
      duration_minutes,
      category,
      is_active,
      allows_retouch,
      retouch_price,
      retouch_days,
      created_at
    `
    )
    .order("name", { ascending: true })

  if (fallbackError) {
    throw new Error("No se pudieron cargar los servicios.")
  }

  return sortServicesForAdmin(
    ((fallbackData ?? []) as Partial<AdminServiceDbRow>[]).map(
      normalizeServiceRow
    )
  )
}

export async function createAdminService(payload: AdminServicePayload) {
  const { data, error } = await supabase
    .from("services")
    .insert([toServicePayload(payload)])
    .select("id")
    .single()

  if (!error && data?.id) {
    await syncPackageItems(data.id, payload)
    return
  }

  const { error: fallbackError } = await supabase
    .from("services")
    .insert([toServicePayload(payload, { includeSortOrder: false })])

  if (fallbackError) {
    throw new Error("No se pudo crear el servicio.")
  }
}

export async function updateAdminService(
  id: string,
  payload: AdminServicePayload
) {
  const { error } = await supabase
    .from("services")
    .update(toServicePayload(payload))
    .eq("id", id)

  if (!error) {
    await syncPackageItems(id, payload)
    return
  }

  const { error: fallbackError } = await supabase
    .from("services")
    .update(toServicePayload(payload, { includeSortOrder: false }))
    .eq("id", id)

  if (fallbackError) {
    throw new Error("No se pudo actualizar el servicio.")
  }
}

async function syncPackageItems(serviceId: string, payload: AdminServicePayload) {
  const { error: deleteError } = await supabase
    .from("service_package_items")
    .delete()
    .eq("package_service_id", serviceId)

  if (deleteError) {
    console.warn("No se pudieron limpiar servicios del paquete.", deleteError)
    return
  }

  if (!payload.is_package || payload.package_item_ids.length === 0) return

  const rows = payload.package_item_ids.map((includedServiceId, index) => ({
    package_service_id: serviceId,
    included_service_id: includedServiceId,
    sort_order: index,
  }))

  const { error } = await supabase.from("service_package_items").insert(rows)

  if (error) {
    console.warn("No se pudieron guardar servicios del paquete.", error)
  }
}

export async function updateAdminServiceStatus(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo actualizar el estado del servicio.")
  }
}
