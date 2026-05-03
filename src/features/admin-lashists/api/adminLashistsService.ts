import { supabase } from "../../../lib/supabase"

export type LashistRow = {
  id: string
  name: string
  phone: string | null
  is_active: boolean
  created_at: string
}

export type LashistInput = {
  name: string
  phone: string
  isActive: boolean
}

export async function fetchLashists(): Promise<LashistRow[]> {
  const { data, error } = await supabase
    .from("lashists")
    .select("id, name, phone, is_active, created_at")
    .order("is_active", { ascending: false })
    .order("name", { ascending: true })

  if (error) {
    throw new Error("No se pudieron cargar las lashistas.")
  }

  return (data ?? []) as LashistRow[]
}

export async function createLashist(input: LashistInput) {
  const { error } = await supabase.from("lashists").insert([
    {
      name: input.name.trim(),
      phone: input.phone.trim() || null,
      is_active: input.isActive,
    },
  ])

  if (error) {
    throw new Error("No se pudo crear la lashista.")
  }
}

export async function updateLashist(id: string, input: LashistInput) {
  const { error } = await supabase
    .from("lashists")
    .update({
      name: input.name.trim(),
      phone: input.phone.trim() || null,
      is_active: input.isActive,
    })
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo actualizar la lashista.")
  }
}

export async function toggleLashistStatus(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("lashists")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo actualizar el estado de la lashista.")
  }
}