import { useEffect, useMemo, useState } from "react"
import {
  fetchCompletedAppointmentsForFollowUp,
  type FollowUpAppointmentRow,
} from "../api/adminFollowUpService"

const RETOUCH_DAYS = 15

function getSingle<T>(value: T | T[] | null): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function diffDays(dateString: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(`${dateString}T00:00:00`)
  const diff = target.getTime() - today.getTime()

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
export function formatDate(dateString: string) {
  if (!dateString) return "-"
  const [year, month, day] = dateString.split("-")
  return `${day}/${month}/${year}`
}

export function buildWhatsAppLink(
  phone: string,
  clientName: string,
  suggestedDate: string
) {
  const message = `Hola ${clientName}, te escribimos de L'AMOUR Beauty Studio. Según tu última atención, ya corresponde realizar tu retoque. Tenemos como fecha sugerida el ${formatDate(
    suggestedDate
  )}. ¿Te gustaría agendar una cita?`

  return `https://wa.me/51${phone}?text=${encodeURIComponent(message)}`
}
export function useAdminFollowUp() {
  const [appointments, setAppointments] = useState<FollowUpAppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadFollowUp = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await fetchCompletedAppointmentsForFollowUp()
      setAppointments(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error cargando el seguimiento."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFollowUp()
  }, [])

  const followUps = useMemo(() => {
    const latestByClient = new Map<string, FollowUpAppointmentRow>()

    appointments.forEach((appointment) => {
      const service = getSingle(appointment.services)

      const isLashService =
        service?.category?.toLowerCase().includes("pesta") ||
        service?.name?.toLowerCase().includes("pesta")

      if (!isLashService) return

      if (!latestByClient.has(appointment.client_id)) {
        latestByClient.set(appointment.client_id, appointment)
      }
    })

    return Array.from(latestByClient.values())
      .map((appointment) => {
        const client = getSingle(appointment.clients)
        const service = getSingle(appointment.services)

        const suggestedDate = addDays(appointment.date, RETOUCH_DAYS)
        const daysRemaining = diffDays(suggestedDate)

        let status: "upcoming" | "today" | "overdue" = "upcoming"

        if (daysRemaining === 0) status = "today"
        if (daysRemaining < 0) status = "overdue"

        return {
          id: appointment.id,
          clientId: appointment.client_id,
          clientName: client?.full_name ?? "Sin nombre",
          phone: client?.phone ?? "",
          serviceName: service?.name ?? "Sin servicio",
          lastDate: appointment.date,
          suggestedDate,
          daysRemaining,
          status,
        }
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
  }, [appointments])

  return {
    followUps,
    loading,
    error,
    reload: loadFollowUp,
  }
}