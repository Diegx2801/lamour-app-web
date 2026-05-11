import { supabase } from "../../../lib/supabase"

export type PromoRow = {
  id: string
  title: string
  description: string
  price: string
  tag: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number | null
  start_date?: string | null
  end_date?: string | null
  service_id?: string | null
  created_at?: string
  updated_at?: string
}

export type PromoFormValues = {
  title: string
  description: string
  price: string
  tag: string
  image_url: string
  is_active: boolean
  sort_order: number
  start_date: string
  end_date: string
  service_id: string
}

export type PromoServiceOption = {
  id: string
  name: string
  price: number
  category: string | null
}

function getTodayLocalDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function isPromoCurrentlyVisible(promo: PromoRow) {
  const today = getTodayLocalDate()
  const startsOk = !promo.start_date || promo.start_date <= today
  const endsOk = !promo.end_date || promo.end_date >= today

  return promo.is_active && startsOk && endsOk
}

function toDatabasePayload(values: PromoFormValues, includeSmartFields = true) {
  const payload: Record<string, unknown> = {
    title: values.title,
    description: values.description,
    price: values.price,
    tag: values.tag,
    image_url: values.image_url,
    is_active: values.is_active,
    sort_order: values.sort_order,
  }

  if (includeSmartFields) {
    payload.start_date = values.start_date || null
    payload.end_date = values.end_date || null
    payload.service_id = values.service_id || null
  }

  return payload
}

export async function fetchPromoServiceOptions(): Promise<PromoServiceOption[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id,name,price,category")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function fetchActivePromos(): Promise<PromoRow[]> {
  const { data, error } = await supabase
    .from("promos")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return ((data ?? []) as PromoRow[]).filter(isPromoCurrentlyVisible)
}

export async function fetchAdminPromos(): Promise<PromoRow[]> {
  const { data, error } = await supabase
    .from("promos")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createPromo(values: PromoFormValues) {
  const { error } = await supabase.from("promos").insert(toDatabasePayload(values))

  if (!error) return

  const { error: fallbackError } = await supabase
    .from("promos")
    .insert(toDatabasePayload(values, false))

  if (fallbackError) throw fallbackError
}

export async function updatePromo(id: string, values: PromoFormValues) {
  const { error } = await supabase
    .from("promos")
    .update({
      ...toDatabasePayload(values),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (!error) return

  const { error: fallbackError } = await supabase
    .from("promos")
    .update({
      ...toDatabasePayload(values, false),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (fallbackError) throw fallbackError
}

export async function togglePromoStatus(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("promos")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw error
}

export async function deletePromo(id: string) {
  const { error } = await supabase.from("promos").delete().eq("id", id)

  if (error) throw error
}
export async function uploadPromoImage(file: File) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from("promos")
    .upload(fileName, file)

  if (error) throw error

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("promos")
    .getPublicUrl(fileName)

  return publicUrl
}
