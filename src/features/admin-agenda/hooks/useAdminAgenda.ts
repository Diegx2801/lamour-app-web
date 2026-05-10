import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { timeSlots } from "../../../data/timeSlots"
import {
  blockFullDay,
  blockTime,
  fetchAgendaByDate,
  fetchAgendaLashists,
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
    }
  | {
      name: string | null
      category: string | null
      duration_minutes: number | null
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

function getLashOccupancyAtSlot(reservations: AgendaReservation[], slot: string) {
  const slotStart = timeToMinutes(slot)

  return reservations.filter((reservation) => {
    if (reservation.status === "cancelled") return false

    const service = getServiceData(reservation.services)
    if (!service || service.category !== "Pestañas") return false

    const reservationStart = timeToMinutes(normalizeTime(reservation.time))
    const duration =
      service.category === "Pestañas"
        ? 120
        : Number(service.duration_minutes ?? 60)

    const reservationEnd = reservationStart + duration

    return slotStart >= reservationStart && slotStart < reservationEnd
  }).length
}

export function useAdminAgenda() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], [])

  const [selectedDate, setSelectedDate] = useState(today)
  const [selectedLashistId, setSelectedLashistId] = useState("")
  const [lashists, setLashists] = useState<AgendaLashistRow[]>([])

  const [reservations, setReservations] = useState<AgendaReservation[]>([])
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

  const getBlockByTime = (time: string) => {
    return blocks.find(
      (block) => !block.is_full_day && normalizeTime(block.time) === time
    )
  }

  const getLashOccupancy = (slot: string) => {
    return getLashOccupancyAtSlot(filteredReservations, slot)
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
        prompt("Motivo del bloqueo del día (opcional)") || undefined

      await blockFullDay(selectedDate, reason)
      toast.success("Día bloqueado.")
      await refreshAgenda()
    } catch {
      const message = "No se pudo bloquear el día completo."
      setError(message)
      toast.error(message)
    }
  }

  const handleUnblockFullDay = async () => {
    try {
      setError("")
      if (!fullDayBlock) return

      await unblockFullDay(fullDayBlock.id)
      toast.success("Día desbloqueado.")
      await refreshAgenda()
    } catch {
      const message = "No se pudo desbloquear el día completo."
      setError(message)
      toast.error(message)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      setError("")
      await updateAppointmentStatus(id, status)
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
    filteredReservations,
    reservationsByTime,
    blocks,
    blockedTimes,
    fullDayBlock,
    isFullDayBlocked,

    loading,
    loadingLashists,
    error,

    getLashOccupancy,

    handleBlock,
    handleUnblock,
    handleBlockFullDay,
    handleUnblockFullDay,
    updateStatus,
  }
}
