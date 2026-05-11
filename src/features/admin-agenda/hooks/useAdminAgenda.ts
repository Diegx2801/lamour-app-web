import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { timeSlots } from "../../../data/timeSlots"
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
}

type AgendaWeekReservation = {
  id: string
  date: string
  status: string
  remaining_amount: number | null
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

export function useAdminAgenda() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedLashistId, setSelectedLashistId] = useState("")
  const [lashists, setLashists] = useState<AgendaLashistRow[]>([])

  const [reservations, setReservations] = useState<AgendaReservation[]>([])
  const [weekReservations, setWeekReservations] = useState<
    AgendaWeekReservation[]
  >([])
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingLashists, setLoadingLashists] = useState(true)
  const [error, setError] = useState("")

  const refreshAgenda = async () => {
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
  }

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
        const data = await fetchAgendaLashists()
        setLashists(data)
      } catch {
        toast.error("No se pudieron cargar las lashistas.")
      } finally {
        setLoadingLashists(false)
      }
    }

    loadLashists()
  }, [])

  useEffect(() => {
    refreshAgenda()
  }, [selectedDate])

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

    timeSlots.forEach((slot) => {
      grouped[slot] = []
    })

    filteredReservations.forEach((reservation) => {
      const time = normalizeTime(reservation.time)

      if (!grouped[time]) grouped[time] = []
      grouped[time].push(reservation)
    })

    return grouped
  }, [filteredReservations])

  const blockedTimes = useMemo(() => {
    return blocks
      .filter((block) => !block.is_full_day && block.time)
      .map((block) => normalizeTime(block.time))
  }, [blocks])

  const fullDayBlock = useMemo(() => {
    return blocks.find((block) => block.is_full_day) ?? null
  }, [blocks])

  const isFullDayBlocked = !!fullDayBlock

  const selectedLashist = useMemo(() => {
    if (!selectedLashistId) return null
    return lashists.find((lashist) => lashist.id === selectedLashistId) ?? null
  }, [selectedLashistId, lashists])

  const lashCapacity = selectedLashistId ? 1 : lashists.length

  const getBlockByTime = (time: string) => {
    return blocks.find(
      (block) => !block.is_full_day && normalizeTime(block.time) === time
    )
  }

  const getLashOccupancy = (slot: string) => {
    return getOccupancyAtSlot(filteredReservations, slot)
  }

  const handleBlock = async (time: string) => {
    try {
      setError("")
      const reason = prompt("Motivo del bloqueo (opcional)") || undefined
      await blockTime(selectedDate, time, reason)
      toast.success("Horario bloqueado.")
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
      const reason =
        prompt("Motivo del bloqueo del dÃ­a (opcional)") || undefined

      await blockFullDay(selectedDate, reason)
      toast.success("DÃ­a bloqueado.")
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
    getLashOccupancy,

    handleBlock,
    handleUnblock,
    handleBlockFullDay,
    handleUnblockFullDay,
    updateStatus,
  }
}
