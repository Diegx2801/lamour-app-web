import { supabase } from "../../../lib/supabase"

export type AdminServiceRow = {
  id: string
  name: string
  description: string | null
  price: number
  duration_minutes: number | null
  category: string | null
  is_active: boolean
  created_at?: string | null
}

export type AdminServicePayload = {
  name: string
  description: string | null
  price: number
  duration_minutes: number
  category: string
  is_active: boolean
}

export async function fetchAdminServices() {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, name, description, price, duration_minutes, category, is_active, created_at"
    )
    .order("name", { ascending: true })

  if (error) {
    throw new Error("No se pudieron cargar los servicios.")
  }

  return (data ?? []) as AdminServiceRow[]
}

export async function createAdminService(payload: AdminServicePayload) {
  const { error } = await supabase.from("services").insert([payload])

  if (error) {
    throw new Error("No se pudo crear el servicio.")
  }
}

export async function updateAdminService(
  id: string,
  payload: AdminServicePayload
) {
  const { error } = await supabase
    .from("services")
    .update(payload)
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo actualizar el servicio.")
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