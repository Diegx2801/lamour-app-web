type RelatedServiceRow =
  | {
      category: string | null
      duration_minutes: number | null
    }
  | {
      category: string | null
      duration_minutes: number | null
    }[]
  | null

export function getRelatedService(service: RelatedServiceRow) {
  if (!service) return null
  return Array.isArray(service) ? service[0] ?? null : service
}

export function normalizePeruvianPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "")

  if (/^9\d{8}$/.test(cleaned)) {
    return cleaned
  }

  if (/^(51)?9\d{8}$/.test(cleaned)) {
    return cleaned.slice(-9)
  }

  return null
}

export function isSunday(dateString: string) {
  if (!dateString) return false
  const date = new Date(`${dateString}T12:00:00`)
  return date.getDay() === 0
}

export function formatDateForMessage(dateString: string) {
  if (!dateString) return "-"
  const [year, month, day] = dateString.split("-")
  return `${day}/${month}/${year}`
}
