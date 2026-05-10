import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  clearFollowUpContacted,
  fetchCompletedAppointmentsForFollowUp,
  markFollowUpAsContacted,
  type FollowUpAppointmentRow,
} from "../api/adminFollowUpService"

const RETOUCH_DAYS = 15
const FOLLOW_UP_WINDOW_DAYS = 7

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

function buildWhatsappPhone(phone: string) {
  let cleanPhone = String(phone).replace(/\D/g, "")

  if (!cleanPhone.startsWith("51")) {
    cleanPhone = `51${cleanPhone}`
  }

  return cleanPhone
}

function buildWhatsAppLink(
  phone: string,
  clientName: string,
  serviceName: string,
  suggestedDate: string
) {
  const message = `Hola ${clientName}, te escribimos de L'AMOUR Beauty Studio.

Según tu última atención de ${serviceName}, ya corresponde realizar tu retoque.

Fecha sugerida: ${formatDate(suggestedDate)}

¿Te gustaría agendar una cita?`

  return `https://wa.me/${buildWhatsappPhone(phone)}?text=${encodeURIComponent(
    message
  )}`
}

export type FollowUpStatus = "upcoming" | "today" | "overdue"

export type FollowUpItem = {
  id: string
  clientId: string
  serviceId: string
  clientName: string
  phone: string
  serviceName: string
  lastDate: string
  suggestedDate: string
  daysRemaining: number
  status: FollowUpStatus
  contactedAt: string | null
  contactedChannel: string | null
  contacted: boolean
  whatsappUrl: string
}

export function useAdminFollowUp() {
  const [appointments, setAppointments] = useState<FollowUpAppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const loadFollowUp = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await fetchCompletedAppointmentsForFollowUp()
      setAppointments(data)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Ocurrió un error cargando el seguimiento."

      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFollowUp()
  }, [])

  const followUps = useMemo<FollowUpItem[]>(() => {
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

        let status: FollowUpStatus = "upcoming"

        if (daysRemaining === 0) status = "today"
        if (daysRemaining < 0) status = "overdue"

        const clientName = client?.full_name ?? "Sin nombre"
        const phone = client?.phone ?? ""
        const serviceName = service?.name ?? "Sin servicio"

        return {
          id: appointment.id,
          clientId: appointment.client_id,
          serviceId: appointment.service_id,
          clientName,
          phone,
          serviceName,
          lastDate: appointment.date,
          suggestedDate,
          daysRemaining,
          status,
          contactedAt: appointment.follow_up_contacted_at,
          contactedChannel: appointment.follow_up_contacted_channel,
          contacted: Boolean(appointment.follow_up_contacted_at),
          whatsappUrl: phone
            ? buildWhatsAppLink(phone, clientName, serviceName, suggestedDate)
            : "",
        }
      })
      .filter((item) => item.daysRemaining <= FOLLOW_UP_WINDOW_DAYS)
      .sort((a, b) => {
        if (a.contacted !== b.contacted) return a.contacted ? 1 : -1
        return a.daysRemaining - b.daysRemaining
      })
  }, [appointments])

  const pendingFollowUps = followUps.filter((item) => !item.contacted)
  const contactedFollowUps = followUps.filter((item) => item.contacted)

  const overdueCount = followUps.filter(
    (item) => item.status === "overdue" && !item.contacted
  ).length

  const todayCount = followUps.filter(
    (item) => item.status === "today" && !item.contacted
  ).length

  const handleMarkAsContacted = async (appointmentId: string) => {
    try {
      setUpdatingId(appointmentId)
      await markFollowUpAsContacted(appointmentId)
      await loadFollowUp()
      toast.success("Seguimiento marcado como contactado.")
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo marcar el seguimiento."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const handleClearContacted = async (appointmentId: string) => {
    try {
      setUpdatingId(appointmentId)
      await clearFollowUpContacted(appointmentId)
      await loadFollowUp()
      toast.success("Seguimiento revertido.")
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudo revertir el seguimiento."
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return {
    followUps,
    pendingFollowUps,
    contactedFollowUps,
    overdueCount,
    todayCount,
    loading,
    updatingId,
    error,
    reload: loadFollowUp,
    markAsContacted: handleMarkAsContacted,
    clearContacted: handleClearContacted,
  }
}
