import { supabase } from "../../../lib/supabase"

export type SiteContentSection = "hero" | "gallery"

export type SiteContentItem = {
  id: string
  section: SiteContentSection
  title: string
  subtitle: string | null
  category: string | null
  image_url: string
  is_active: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export type SiteContentFormValues = {
  section: SiteContentSection
  title: string
  subtitle: string
  category: string
  image_url: string
  is_active: boolean
  sort_order: number
}

function toPayload(values: SiteContentFormValues) {
  return {
    section: values.section,
    title: values.title.trim(),
    subtitle: values.subtitle.trim() || null,
    category: values.category.trim() || null,
    image_url: values.image_url.trim(),
    is_active: values.is_active,
    sort_order: values.sort_order,
    updated_at: new Date().toISOString(),
  }
}

export async function fetchPublicSiteContent(section: SiteContentSection) {
  const { data, error } = await supabase
    .from("site_content_items")
    .select("*")
    .eq("section", section)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    console.warn("No se pudo cargar contenido web:", error.message)
    return []
  }

  return (data ?? []) as SiteContentItem[]
}

export async function fetchAdminSiteContent() {
  const { data, error } = await supabase
    .from("site_content_items")
    .select("*")
    .order("section", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error("No se pudo cargar el contenido web.")
  }

  return (data ?? []) as SiteContentItem[]
}

export async function createSiteContentItem(values: SiteContentFormValues) {
  const { error } = await supabase
    .from("site_content_items")
    .insert(toPayload(values))

  if (error) {
    throw new Error("No se pudo crear el contenido.")
  }
}

export async function updateSiteContentItem(
  id: string,
  values: SiteContentFormValues
) {
  const { error } = await supabase
    .from("site_content_items")
    .update(toPayload(values))
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo actualizar el contenido.")
  }
}

export async function toggleSiteContentItem(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("site_content_items")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo cambiar el estado.")
  }
}

export async function deleteSiteContentItem(id: string) {
  const { error } = await supabase
    .from("site_content_items")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo eliminar el contenido.")
  }
}

export async function uploadSiteContentImage(file: File) {
  const fileExt = file.name.split(".").pop() || "jpg"
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9-_]+/gi, "-")
    .toLowerCase()
  const fileName = `${Date.now()}-${safeName}.${fileExt}`

  const { error } = await supabase.storage
    .from("site-content")
    .upload(fileName, file)

  if (error) {
    throw new Error("No se pudo subir la imagen.")
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("site-content").getPublicUrl(fileName)

  return publicUrl
}
