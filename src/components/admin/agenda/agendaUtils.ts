import type {
  AgendaClientRelation,
  AgendaReservation,
  AgendaServiceRelation,
} from "../../../features/admin-agenda/hooks/useAdminAgenda"

export function normalizeTime(time: string | null | undefined) {
  return String(time ?? "").slice(0, 5)
}

export function getClientData(clients: AgendaClientRelation) {
  if (!clients) return null
  return Array.isArray(clients) ? clients[0] ?? null : clients
}

export function getServiceData(services: AgendaServiceRelation) {
  if (!services) return null
  return Array.isArray(services) ? services[0] ?? null : services
}

export function formatMoney(value: number | null | undefined) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`
}

export function getStatusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "border-green-200 bg-green-50 text-green-950"
    case "completed":
      return "border-blue-200 bg-blue-50 text-blue-950"
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-950"
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-950"
    case "no_show":
      return "border-stone-300 bg-stone-100 text-stone-700"
    default:
      return "border-stone-200 bg-white text-stone-700"
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return "Confirmada"
    case "completed":
      return "Completada"
    case "cancelled":
      return "Cancelada"
    case "pending":
      return "Pendiente"
    case "no_show":
      return "No show"
    default:
      return status
  }
}

export function getOccupancyBadgeClasses(occupied: number, capacity: number) {
  if (occupied >= capacity) return "bg-red-100 text-red-700"
  if (occupied > 0) return "bg-amber-100 text-amber-700"
  return "bg-green-100 text-green-700"
}

export function getPaymentBadge(reservation: AgendaReservation) {
  const remaining = Number(reservation.remaining_amount ?? 0)

  if (remaining <= 0) {
    return {
      label: "Pagado",
      className: "bg-green-100 text-green-700",
    }
  }

  return {
    label: `Saldo ${formatMoney(remaining)}`,
    className: "bg-red-100 text-red-700",
  }
}

export function getDisplayDuration(reservation: AgendaReservation) {
  const service = getServiceData(reservation.services)

  if (service?.category === "Pestañas") return "120 min"

  return service?.duration_minutes
    ? `${service.duration_minutes} min`
    : "No definida"
}
