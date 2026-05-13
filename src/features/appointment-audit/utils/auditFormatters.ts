type AuditDetails = Record<string, unknown> | null

const statusLabels: Record<string, string> = {
  pending: "pendiente",
  confirmed: "confirmada",
  completed: "completada",
  cancelled: "cancelada",
  no_show: "no show",
}

const paymentTypeLabels: Record<string, string> = {
  deposit: "abono",
  remaining: "pago restante",
  full: "pago completo",
  adjustment: "ajuste",
}

function labelStatus(value: unknown) {
  const status = String(value ?? "-")
  return statusLabels[status] ?? status
}

function getRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "vacío"
  return String(value)
}

export function getAuditLabel(action: string) {
  switch (action) {
    case "status_updated":
      return "Estado actualizado"
    case "reservation_updated":
      return "Reserva editada"
    case "payment_registered":
      return "Pago registrado"
    default:
      return action
  }
}

export function formatAuditDetails(details: AuditDetails) {
  if (!details) return "Cambio registrado."

  if ("newStatus" in details) {
    return `Cambió estado de ${labelStatus(
      details.previousStatus
    )} a ${labelStatus(details.newStatus)}.`
  }

  if ("paymentAmount" in details) {
    const paymentType = String(details.paymentType ?? "")
    return `Registró ${
      paymentTypeLabels[paymentType] ?? "pago"
    } por S/ ${Number(details.paymentAmount ?? 0).toFixed(2)}.`
  }

  const previous = getRecord(details.previous)
  const next = getRecord(details.next)

  if (previous && next) {
    const changes = [
      getChangeText(previous, next, "date", "fecha"),
      getChangeText(previous, next, "time", "hora"),
      getChangeText(previous, next, "status", "estado", labelStatus),
      getChangeText(previous, next, "lashistId", "lashista"),
      getChangeText(previous, next, "notes", "observaciones"),
    ].filter(Boolean)

    if (changes.length > 0) return changes.join(" ")
  }

  return "Cambio registrado."
}

function getChangeText(
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
  key: string,
  label: string,
  formatter: (value: unknown) => string = formatValue
) {
  const before = previous[key]
  const after = next[key]

  if (String(before ?? "") === String(after ?? "")) return ""

  return `Cambió ${label} de ${formatter(before)} a ${formatter(after)}.`
}
