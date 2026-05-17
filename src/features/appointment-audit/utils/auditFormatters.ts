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

function getRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null
}

function isEmptyValue(value: unknown) {
  return value === null || value === undefined || value === ""
}

function sameValue(before: unknown, after: unknown) {
  return String(before ?? "") === String(after ?? "")
}

function labelStatus(value: unknown) {
  const status = String(value ?? "")
  if (!status) return "sin estado"
  return statusLabels[status] ?? status
}

function formatTextValue(value: unknown) {
  if (isEmptyValue(value)) return "vacío"
  return String(value)
}

function formatMoneyValue(value: unknown) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`
}

function formatDateValue(value: unknown) {
  const rawValue = String(value ?? "")
  if (!rawValue) return "sin fecha"

  const [year, month, day] = rawValue.slice(0, 10).split("-")
  if (!year || !month || !day) return rawValue

  return `${day}/${month}/${year}`
}

function formatTimeValue(value: unknown) {
  const rawValue = String(value ?? "")
  if (!rawValue) return "sin hora"

  return rawValue.slice(0, 5)
}

function formatBooleanValue(value: unknown) {
  return value ? "si" : "no"
}

function formatMinutesValue(value: unknown) {
  return `${Number(value ?? 0)} min`
}

function formatLashistValue(value: unknown) {
  const rawValue = String(value ?? "")
  if (!rawValue) return "sin asignar"

  const looksLikeUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      rawValue
    )

  return looksLikeUuid ? "lashista sin nombre registrado" : rawValue
}

function getChangeText(
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
  key: string,
  label: string,
  formatter: (value: unknown) => string = formatTextValue
) {
  const before = previous[key]
  const after = next[key]

  if (sameValue(before, after)) return ""

  return `Cambió ${label} de ${formatter(before)} a ${formatter(after)}.`
}

function getLashistChangeText(
  previous: Record<string, unknown>,
  next: Record<string, unknown>
) {
  const previousName = previous.lashistName
  const nextName = next.lashistName

  if (!sameValue(previousName, nextName)) {
    return getChangeText(
      previous,
      next,
      "lashistName",
      "lashista",
      formatLashistValue
    )
  }

  if (!sameValue(previous.lashistId, next.lashistId)) {
    const before = formatLashistValue(previousName ?? previous.lashistId)
    const after = formatLashistValue(nextName ?? next.lashistId)

    return `Cambió lashista de ${before} a ${after}.`
  }

  return ""
}

export function getAuditLabel(action: string) {
  switch (action) {
    case "status_updated":
      return "Cambio de estado"
    case "reservation_updated":
      return "Edición de reserva"
    case "payment_registered":
      return "Pago registrado"
    case "business_hours_updated":
      return "Horario actualizado"
    default:
      return action
  }
}

export function formatAuditDetails(details: AuditDetails) {
  if (!details) return "Cambio registrado sin detalle disponible."

  if ("newStatus" in details) {
    return `Cambió estado de ${labelStatus(details.previousStatus)} a ${labelStatus(
      details.newStatus
    )}.`
  }

  if ("paymentAmount" in details) {
    const paymentType = String(details.paymentType ?? "")
    const method = String(details.paymentMethod ?? "")
    const methodText = method ? ` por ${method}` : ""
    const remainingText =
      "remainingAmount" in details
        ? ` Saldo pendiente: ${formatMoneyValue(details.remainingAmount)}.`
        : ""

    return `Registró ${
      paymentTypeLabels[paymentType] ?? "pago"
    }${methodText} por ${formatMoneyValue(details.paymentAmount)}.${remainingText}`
  }

  const previous = getRecord(details.previous)
  const next = getRecord(details.next)

  if (previous && next) {
    if (
      "day_of_week" in previous ||
      "day_of_week" in next ||
      "open_time" in previous ||
      "open_time" in next ||
      "close_time" in previous ||
      "close_time" in next
    ) {
      const dayLabel = formatTextValue(next.day_label ?? previous.day_label)
      const changes = [
        getChangeText(previous, next, "is_closed", "cerrado", formatBooleanValue),
        getChangeText(previous, next, "open_time", "apertura", formatTimeValue),
        getChangeText(previous, next, "close_time", "cierre", formatTimeValue),
        getChangeText(
          previous,
          next,
          "slot_interval_minutes",
          "intervalo",
          formatMinutesValue
        ),
      ].filter(Boolean)

      if (changes.length > 0) {
        return `Cambió horario de ${dayLabel}. ${changes.join(" ")}`
      }

      return `Se guardó el horario de ${dayLabel} sin cambios visibles.`
    }

    const changes = [
      getChangeText(previous, next, "date", "fecha", formatDateValue),
      getChangeText(previous, next, "time", "hora", formatTimeValue),
      getChangeText(previous, next, "status", "estado", labelStatus),
      getLashistChangeText(previous, next),
      getChangeText(previous, next, "notes", "observaciones"),
    ].filter(Boolean)

    if (changes.length > 0) return changes.join(" ")

    return "Se guardó la reserva sin cambios visibles en fecha, hora, estado, lashista u observaciones."
  }

  return "Cambio registrado sin detalle disponible."
}
