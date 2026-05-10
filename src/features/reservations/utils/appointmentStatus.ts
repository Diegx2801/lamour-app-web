function isPastAppointment(date: string, time: string) {
  const now = new Date()
  const appointmentDate = new Date(`${date}T${String(time).slice(0, 5)}`)

  return appointmentDate < now
}

export function isNoShowCandidate(
  date: string,
  time: string,
  status: string
) {
  return isPastAppointment(date, time) && status === "confirmed"
}

export function isReminderCandidate(
  date: string,
  time: string,
  status: string
) {
  if (status !== "confirmed") return false

  const now = new Date()
  const appointmentDate = new Date(`${date}T${String(time).slice(0, 5)}`)

  const diffMs = appointmentDate.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  return diffHours > 0 && diffHours <= 24
}

export function buildWhatsappPhone(phone: string) {
  let cleanPhone = String(phone).replace(/\D/g, "")

  if (!cleanPhone.startsWith("51")) {
    cleanPhone = `51${cleanPhone}`
  }

  return cleanPhone
}
