import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  fetchRetentionAppointments,
  type RetentionAppointmentRow,
} from "../api/adminRetentionService"

function getSingle<T>(value: T | T[] | null | undefined) {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function daysBetween(date: string) {
  const today = new Date()
  const last = new Date(`${date}T12:00:00`)
  const diff = today.getTime() - last.getTime()
  return Math.max(Math.floor(diff / 86_400_000), 0)
}

function normalizePhone(phone: string | null | undefined) {
  const digits = String(phone ?? "").replace(/\D/g, "")
  if (!digits) return ""
  return digits.startsWith("51") ? digits : `51${digits}`
}

type RetentionClient = {
  clientId: string
  clientName: string
  phone: string
  lastDate: string
  lastService: string
  visits: number
  daysInactive: number
}

export function useAdminRetention() {
  const [appointments, setAppointments] = useState<RetentionAppointmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [minDays, setMinDays] = useState(45)

  const loadRetention = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await fetchRetentionAppointments()
      setAppointments(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar fidelización."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRetention()
  }, [])

  const clients = useMemo(() => {
    const grouped = new Map<string, RetentionClient>()

    appointments.forEach((appointment) => {
      if (!appointment.client_id || !appointment.date) return

      const client = getSingle(appointment.clients)
      const service = getSingle(appointment.services)
      const current = grouped.get(appointment.client_id)

      if (!current) {
        grouped.set(appointment.client_id, {
          clientId: appointment.client_id,
          clientName: client?.full_name ?? "Sin nombre",
          phone: client?.phone ?? "",
          lastDate: appointment.date,
          lastService: service?.name ?? "Sin servicio",
          visits: 1,
          daysInactive: daysBetween(appointment.date),
        })
        return
      }

      current.visits += 1

      if (appointment.date > current.lastDate) {
        current.lastDate = appointment.date
        current.lastService = service?.name ?? "Sin servicio"
        current.daysInactive = daysBetween(appointment.date)
      }
    })

    return Array.from(grouped.values())
      .filter((client) => client.daysInactive >= minDays)
      .sort((a, b) => b.daysInactive - a.daysInactive)
  }, [appointments, minDays])

  const openWhatsapp = (client: RetentionClient) => {
    const phone = normalizePhone(client.phone)
    if (!phone) {
      toast.error("Esta clienta no tiene WhatsApp registrado.")
      return
    }

    const firstName = client.clientName.split(" ")[0] || "linda"
    const message = `Hola ${firstName}, te saludamos de L'AMOUR Beauty Studio. Notamos que hace un tiempo no vienes y queríamos saber cómo estás.

Nos encantaría volver a atenderte. Si hubo algo que podamos mejorar, también nos gustaría escucharte.`

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank")
  }

  return {
    clients,
    loading,
    error,
    minDays,
    setMinDays,
    refresh: loadRetention,
    openWhatsapp,
  }
}
