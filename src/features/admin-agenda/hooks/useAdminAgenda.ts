import { useEffect, useMemo, useState } from "react"
import { useCallback } from "react"
import { toast } from "sonner"
import { supabase } from "../../../lib/supabase"
import { fetchBusinessHours } from "../../business-hours/api/businessHoursService"
import {
  getBusinessHourForDate,
  getTimeSlotsForBusinessHour,
  type BusinessHour,
} from "../../business-hours/utils/businessHoursUtils"
import { createAppointmentAuditLog } from "../../appointment-audit/api/appointmentAuditService"
import {
  blockFullDay,
  blockTime,
  fetchAgendaByDate,
  fetchAgendaLashists,
  fetchAgendaWeek,
  unblockFullDay,
  unblockTime,
  updateAppointmentStatus,
  type AgendaLashistRow,
} from "../api/adminAgendaService"

export type { AgendaLashistRow } from "../api/adminAgendaService"

export type AgendaClientRelation =
  | { full_name: string | null; phone: string | null }
  | { full_name: string | null; phone: string | null }[]
  | null

export type AgendaServiceRelation =
  | {
      name: string | null
      category: string | null
      duration_minutes: number | null
      package_includes_lashes?: boolean | null
    }
  | {
      name: string | null
      category: string | null
      duration_minutes: number | null
      package_includes_lashes?: boolean | null
    }[]
  | null

export type AgendaReservation = {
  id: string
  date: string
  time: string
  status: string
  notes: string | null
  lashista: string | null
  lashist_id: string | null
  appointment_type: "normal" | "retouch" | null
  total_price: number | null
  deposit_amount: number | null
  remaining_amount: number | null
  clients: AgendaClientRelation
  services: AgendaServiceRelation
}

type ScheduleBlock = {
  id: string
  date: string
  time: string | null
  reason: string | null
  is_full_day: boolean
  lashist_id?: string | null
}

type AgendaWeekReservation = {
  id: string
  date: string
  time: string | null
  status: string
  remaining_amount: number | null
  created_at?: string | null
  lashista?: string | null
  lashist_id?: string | null
  clients?: AgendaClientRelation
  services?: AgendaServiceRelation
}

function normalizeTime(time: string | null | undefined) {
  return String(time ?? "").slice(0, 5)
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

function getServiceData(services: AgendaServiceRelation) {
  if (!services) return null
  return Array.isArray(services) ? services[0] ?? null : services
}

function getServiceDuration(service: ReturnType<typeof getServiceData>) {
  if (!service) return 60
  return service.category === "Pestañas"
    ? 120
    : Number(service.duration_minutes ?? 60)
}

function getCurrentMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

function getOccupancyAtSlot(reservations: AgendaReservation[], slot: string) {
  const slotStart = timeToMinutes(slot)

  return reservations.filter((reservation) => {
    if (reservation.status === "cancelled") return false
    if (reservation.status === "no_show") return false

    const service = getServiceData(reservation.services)
    if (!service) return false

    const reservationStart = timeToMinutes(normalizeTime(reservation.time))
    const reservationEnd = reservationStart + getServiceDuration(service)

    return slotStart >= reservationStart && slotStart < reservationEnd
  }).length
}

function getClientData(clients: AgendaClientRelation | undefined) {
  if (!clients) return null
  return Array.isArray(clients) ? clients[0] ?? null : clients
}

function formatDateLabel(date: string) {
  const [year, month, day] = date.split("-")
  return `${day}/${month}/${year}`
}

function normalizePhone(phone: string | null | undefined) {
  const digits = String(phone ?? "").replace(/\D/g, "")
  if (!digits) return ""
  return digits.startsWith("51") ? digits : `51${digits}`
}

export function useAdminAgenda() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedLashistId, setSelectedLashistId] = useState("")
  const [lashists, setLashists] = useState<AgendaLashistRow[]>([])
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([])

  const [reservations, setReservations] = useState<AgendaReservation[]>([])
  const [weekReservations, setWeekReservations] = useState<
    AgendaWeekReservation[]
  >([])
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingLashists, setLoadingLashists] = useState(true)
  const [error, setError] = useState("")
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [noticeRefreshKey, setNoticeRefreshKey] = useState(0)

  const refreshAgenda = useCallback(async () => {
    try {
      setLoading(true)
      setError("")

      const data = await fetchAgendaByDate(selectedDate)

      setReservations(data.reservations as AgendaReservation[])
      setBlocks(data.blocks as ScheduleBlock[])
    } catch {
      const message = "No se pudo actualizar la agenda."
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  const weekRange = useMemo(() => {
    const selected = new Date(`${selectedDate}T12:00:00`)
    const day = selected.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const monday = new Date(selected)
    monday.setDate(selected.getDate() + mondayOffset)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10),
    }
  }, [selectedDate])

  useEffect(() => {
    const loadLashists = async () => {
      try {
        setLoadingLashists(true)
        const [lashistsData, businessHoursData] = await Promise.all([
          fetchAgendaLashists(),
          fetchBusinessHours(),
        ])
        setLashists(lashistsData)
        setBusinessHours(businessHoursData)
      } catch {
        toast.error("No se pudieron cargar las lashistas.")
      } finally {
        setLoadingLashists(false)
      }
    }

    loadLashists()
  }, [])

  useEffect(() => {
    const loadRole = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) return

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single()

      setAdminRole(data?.role ?? null)
    }

    loadRole()
  }, [])

  useEffect(() => {
    refreshAgenda()
  }, [refreshAgenda])

  useEffect(() => {
    const channel = supabase
      .channel(`admin-agenda-${selectedDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `date=eq.${selectedDate}`,
        },
        () => {
          refreshAgenda()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedule_blocks",
          filter: `date=eq.${selectedDate}`,
        },
        () => {
          refreshAgenda()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshAgenda, selectedDate])

  useEffect(() => {
    const loadWeek = async () => {
      try {
        const data = await fetchAgendaWeek(weekRange.start, weekRange.end)
        setWeekReservations(data as AgendaWeekReservation[])
      } catch {
        toast.error("No se pudo cargar el resumen semanal.")
      }
    }

    loadWeek()
  }, [weekRange.start, weekRange.end])

  const filteredReservations = useMemo(() => {
    if (!selectedLashistId) return reservations

    return reservations.filter(
      (reservation) => reservation.lashist_id === selectedLashistId
    )
  }, [reservations, selectedLashistId])

  const reservationsByTime = useMemo(() => {
    const grouped: Record<string, AgendaReservation[]> = {}

    const scheduleSlots = getTimeSlotsForBusinessHour(
      getBusinessHourForDate(businessHours, selectedDate)
    )

    scheduleSlots.forEach((slot) => {
      grouped[slot] = []
    })

    filteredReservations.forEach((reservation) => {
      const time = normalizeTime(reservation.time)

      if (!grouped[time]) grouped[time] = []
      grouped[time].push(reservation)
    })

    return grouped
  }, [businessHours, filteredReservations, selectedDate])

  const scheduleSlots = useMemo(() => {
    return getTimeSlotsForBusinessHour(
      getBusinessHourForDate(businessHours, selectedDate)
    )
  }, [businessHours, selectedDate])

  const blockedTimes = useMemo(() => {
    return blocks
      .filter(
        (block) =>
          !block.is_full_day &&
          block.time &&
          (!block.lashist_id ||
            (selectedLashistId && block.lashist_id === selectedLashistId))
      )
      .map((block) => normalizeTime(block.time))
  }, [blocks, selectedLashistId])

  const fullDayBlock = useMemo(() => {
    return (
      blocks.find(
        (block) =>
          block.is_full_day &&
          (!block.lashist_id ||
            (selectedLashistId && block.lashist_id === selectedLashistId))
      ) ?? null
    )
  }, [blocks, selectedLashistId])

  const isFullDayBlocked = !!fullDayBlock

  const selectedLashist = useMemo(() => {
    if (!selectedLashistId) return null
    return lashists.find((lashist) => lashist.id === selectedLashistId) ?? null
  }, [selectedLashistId, lashists])

  const lashCapacity = selectedLashistId ? 1 : lashists.length
  const canManageBlocks = adminRole === "owner" || adminRole === "admin"

  const overdueOpenReservations = useMemo(() => {
    if (selectedDate !== today) return []

    const currentMinutes = getCurrentMinutes()

    return filteredReservations
      .filter(
        (reservation) =>
          reservation.status === "pending" || reservation.status === "confirmed"
      )
      .filter((reservation) => {
        const service = getServiceData(reservation.services)
        const endMinutes =
          timeToMinutes(normalizeTime(reservation.time)) +
          getServiceDuration(service)

        return endMinutes <= currentMinutes
      })
      .sort((a, b) => normalizeTime(a.time).localeCompare(normalizeTime(b.time)))
  }, [filteredReservations, selectedDate, today])

  const lastNotifyKey = useMemo(
    () => `lamour_lashist_week_notice_${weekRange.start}_${weekRange.end}`,
    [weekRange.end, weekRange.start]
  )

  const lashistNoticeState = useMemo(() => {
    const refreshKey = noticeRefreshKey
    void refreshKey

    return lashists.map((lashist) => {
      const raw = localStorage.getItem(`${lastNotifyKey}_${lashist.id}`)
      const lastSentAt = raw ? Number(raw) : 0
      const weeklyAppointments = weekReservations.filter(
        (reservation) => reservation.lashist_id === lashist.id
      )
      const changedAfterSend =
        lastSentAt > 0
          ? weeklyAppointments.filter((reservation) => {
              const createdAt = reservation.created_at
                ? new Date(reservation.created_at).getTime()
                : 0
              return createdAt > lastSentAt
            }).length
          : weeklyAppointments.length

      return {
        lashist,
        total: weeklyAppointments.length,
        lastSentAt,
        changedAfterSend,
      }
    })
  }, [lashists, lastNotifyKey, noticeRefreshKey, weekReservations])

  const sendWeeklyWhatsappToLashist = (lashistId: string) => {
    const lashist = lashists.find((item) => item.id === lashistId)

    if (!lashist) return

    const phone = normalizePhone(lashist.phone)
    if (!phone) {
      toast.error("Esta lashista no tiene WhatsApp registrado.")
      return
    }

    const weeklyAppointments = weekReservations.filter(
      (reservation) => reservation.lashist_id === lashist.id
    )

    const lines =
      weeklyAppointments.length > 0
        ? weeklyAppointments.map((reservation) => {
            const client = getClientData(reservation.clients)
            const service = getServiceData(reservation.services ?? null)

            return `• ${formatDateLabel(reservation.date)} ${normalizeTime(
              reservation.time
            )} - ${client?.full_name ?? "Cliente"} - ${
              service?.name ?? "Servicio"
            }`
          })
        : ["No tienes citas asignadas esta semana."]

    const message = `Hola ${lashist.name}, esta es tu agenda de L'AMOUR para la semana ${formatDateLabel(
      weekRange.start
    )} al ${formatDateLabel(weekRange.end)}:

${lines.join("\n")}

Si aparece un cambio nuevo, te enviaremos una actualización.`

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      "_blank"
    )
    localStorage.setItem(`${lastNotifyKey}_${lashist.id}`, String(Date.now()))
    setNoticeRefreshKey((current) => current + 1)
    toast.success(`Agenda enviada a ${lashist.name}.`)
  }

  const getBlockByTime = (time: string) => {
    return blocks.find(
      (block) =>
        !block.is_full_day &&
        normalizeTime(block.time) === time &&
        (!block.lashist_id ||
          (selectedLashistId && block.lashist_id === selectedLashistId))
    )
  }

  const getLashOccupancy = (slot: string) => {
    return getOccupancyAtSlot(filteredReservations, slot)
  }

  const handleBlock = async (time: string) => {
    try {
      setError("")

      if (!canManageBlocks) {
        toast.error("Solo la dueña puede bloquear horarios.")
        return
      }

      const reason =
        prompt(
          selectedLashist
            ? `Motivo del bloqueo para ${selectedLashist.name} (opcional)`
            : "Motivo del bloqueo general (opcional)"
        ) || undefined
      await blockTime(selectedDate, time, reason, selectedLashistId || null)
      toast.success(
        selectedLashist
          ? `Horario bloqueado para ${selectedLashist.name}.`
          : "Horario bloqueado."
      )
      await refreshAgenda()
    } catch {
      const message = "No se pudo bloquear el horario."
      setError(message)
      toast.error(message)
    }
  }

  const handleUnblock = async (time: string) => {
    try {
      setError("")

      if (!canManageBlocks) {
        toast.error("Solo la dueña puede desbloquear horarios.")
        return
      }

      const block = getBlockByTime(time)
      if (!block) return

      await unblockTime(block.id)
      toast.success("Horario desbloqueado.")
      await refreshAgenda()
    } catch {
      const message = "No se pudo desbloquear el horario."
      setError(message)
      toast.error(message)
    }
  }

  const handleBlockFullDay = async () => {
    try {
      setError("")

      if (!canManageBlocks) {
        toast.error("Solo la dueña puede bloquear días.")
        return
      }

      const reason =
        prompt(
          selectedLashist
            ? `Motivo del bloqueo del día para ${selectedLashist.name} (opcional)`
            : "Motivo del bloqueo del día (opcional)"
        ) || undefined

      await blockFullDay(selectedDate, reason, selectedLashistId || null)
      toast.success(
        selectedLashist
          ? `Día bloqueado para ${selectedLashist.name}.`
          : "Día bloqueado."
      )
      await refreshAgenda()
    } catch {
      const message = "No se pudo bloquear el dÃ­a completo."
      setError(message)
      toast.error(message)
    }
  }

  const handleUnblockFullDay = async () => {
    try {
      setError("")

      if (!canManageBlocks) {
        toast.error("Solo la dueña puede desbloquear días.")
        return
      }

      if (!fullDayBlock) return

      await unblockFullDay(fullDayBlock.id)
      toast.success("DÃ­a desbloqueado.")
      await refreshAgenda()
    } catch {
      const message = "No se pudo desbloquear el dÃ­a completo."
      setError(message)
      toast.error(message)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      setError("")
      const reservation = reservations.find((item) => item.id === id)

      if (
        (status === "cancelled" || status === "no_show") &&
        !window.confirm(
          status === "cancelled"
            ? "Â¿Seguro que quieres cancelar esta cita?"
            : "Â¿Seguro que quieres marcar esta cita como No show?"
        )
      ) {
        return
      }

      if (
        status === "completed" &&
        Number(reservation?.remaining_amount ?? 0) > 0
      ) {
        const message =
          "Primero registra el pago completo antes de marcar como completada."
        setError(message)
        toast.error(message)
        return
      }

      await updateAppointmentStatus(id, status)
      await createAppointmentAuditLog({
        appointmentId: id,
        action: "status_updated",
        details: {
          previousStatus: reservation?.status ?? null,
          newStatus: status,
          source: "agenda",
        },
      })
      toast.success("Estado actualizado.")
      await refreshAgenda()
    } catch {
      const message = "No se pudo actualizar el estado."
      setError(message)
      toast.error(message)
    }
  }

  return {
    selectedDate,
    setSelectedDate,

    selectedLashistId,
    setSelectedLashistId,
    selectedLashist,
    lashists,
    scheduleSlots,

    reservations,
    weekReservations,
    weekRange,
    filteredReservations,
    reservationsByTime,
    blocks,
    blockedTimes,
    fullDayBlock,
    isFullDayBlocked,

    loading,
    loadingLashists,
    error,

    lashCapacity,
    canManageBlocks,
    overdueOpenReservations,
    lashistNoticeState,
    getLashOccupancy,
    sendWeeklyWhatsappToLashist,

    handleBlock,
    handleUnblock,
    handleBlockFullDay,
    handleUnblockFullDay,
    updateStatus,
    refreshAgenda,
  }
}
