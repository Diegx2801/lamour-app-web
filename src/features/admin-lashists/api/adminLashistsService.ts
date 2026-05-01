import { supabase } from "../../../lib/supabase"

export async function fetchLashists() {
  const { data, error } = await supabase
    .from("lashists")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error("Error cargando lashistas")

  return data
}

export async function createLashist(payload: {
  name: string
  phone?: string
}) {
  const { error } = await supabase.from("lashists").insert([payload])

  if (error) throw new Error("Error creando lashista")
}

export async function updateLashist(
  id: string,
  payload: { name: string; phone?: string }
) {
  const { error } = await supabase
    .from("lashists")
    .update(payload)
    .eq("id", id)

  if (error) throw new Error("Error actualizando lashista")
}

export async function toggleLashist(id: string, is_active: boolean) {
  const { error } = await supabase
    .from("lashists")
    .update({ is_active })
    .eq("id", id)

  if (error) throw new Error("Error actualizando estado")
}