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
}

export async function fetchActivePromos(): Promise<PromoRow[]> {
  const { data, error } = await supabase
    .from("promos")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  if (error) throw error
  return data ?? []
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
  const { error } = await supabase.from("promos").insert(values)

  if (error) throw error
}

export async function updatePromo(id: string, values: PromoFormValues) {
  const { error } = await supabase
    .from("promos")
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) throw error
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