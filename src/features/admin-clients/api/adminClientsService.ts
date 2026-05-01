import { supabase } from "../../../lib/supabase"

export type ClientRow = {
  id: string
  full_name: string | null
  phone: string | null
  created_at: string
  is_active: boolean
}

export async function fetchClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error("No se pudieron cargar los clientes.")
  }

  return (data ?? []) as ClientRow[]
}

export async function updateClient(id: string, payload: {
  full_name: string
  phone: string
}) {
  const { error } = await supabase
    .from("clients")
    .update(payload)
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo actualizar el cliente.")
  }
}
export async function activateClient(id: string) {
  const { error } = await supabase
    .from("clients")
    .update({ is_active: true })
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo reactivar el cliente.")
  }
}
export async function deactivateClient(id: string) {
  const { error } = await supabase
    .from("clients")
    .update({ is_active: false })
    .eq("id", id)

  if (error) {
    throw new Error("No se pudo desactivar el cliente.")
  }
}