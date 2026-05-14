import { supabase } from "../../../lib/supabase"

export type WhatsappTemplateRow = {
  id: string
  template_key: string
  title: string
  message: string
  is_active: boolean
  updated_at: string | null
}

export async function fetchWhatsappTemplates() {
  const { data, error } = await supabase
    .from("whatsapp_templates")
    .select("id, template_key, title, message, is_active, updated_at")
    .order("title", { ascending: true })

  if (error) {
    throw new Error("No se pudieron cargar las plantillas.")
  }

  return (data ?? []) as WhatsappTemplateRow[]
}

export async function updateWhatsappTemplate(payload: {
  id: string
  title: string
  message: string
  isActive: boolean
}) {
  const { error } = await supabase
    .from("whatsapp_templates")
    .update({
      title: payload.title.trim(),
      message: payload.message.trim(),
      is_active: payload.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.id)

  if (error) {
    throw new Error("No se pudo guardar la plantilla.")
  }
}
