import { supabase } from "../../../lib/supabase"

export type PaymentMethodRow = {
  id: string
  name: string
  code: string
  is_active: boolean
  sort_order: number | null
  created_at?: string | null
  updated_at?: string | null
}

export type PaymentMethodInput = {
  name: string
  code: string
  is_active: boolean
  sort_order: number
}

export const fallbackPaymentMethods: PaymentMethodRow[] = [
  {
    id: "fallback-yape",
    name: "Yape",
    code: "yape",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "fallback-plin",
    name: "Plin",
    code: "plin",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "fallback-efectivo",
    name: "Efectivo",
    code: "efectivo",
    is_active: true,
    sort_order: 3,
  },
]

export function normalizePaymentMethodCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

export async function fetchActivePaymentMethods() {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("id, name, code, is_active, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    return fallbackPaymentMethods
  }

  return data && data.length > 0
    ? ((data ?? []) as PaymentMethodRow[])
    : fallbackPaymentMethods
}

export async function fetchAdminPaymentMethods() {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("id, name, code, is_active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      "No se pudieron cargar los métodos de pago. Revisa que el SQL de payment_methods esté aplicado."
    )
  }

  return (data ?? []) as PaymentMethodRow[]
}

export async function createPaymentMethod(input: PaymentMethodInput) {
  const { error } = await supabase.from("payment_methods").insert([
    {
      name: input.name,
      code: input.code,
      is_active: input.is_active,
      sort_order: input.sort_order,
    },
  ])

  if (error) {
    throw new Error(error.message || "No se pudo crear el método de pago.")
  }
}

export async function updatePaymentMethod(
  id: string,
  input: PaymentMethodInput
) {
  const { error } = await supabase
    .from("payment_methods")
    .update({
      name: input.name,
      code: input.code,
      is_active: input.is_active,
      sort_order: input.sort_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message || "No se pudo actualizar el método de pago.")
  }
}

export async function deactivatePaymentMethod(id: string) {
  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    throw new Error(error.message || "No se pudo desactivar el método de pago.")
  }
}
