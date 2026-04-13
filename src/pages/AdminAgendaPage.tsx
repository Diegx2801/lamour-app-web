import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { supabase } from "../lib/supabase"
import { timeSlots } from "../data/timeSlots"

type AgendaReservation = {
  id: string
  date: string
  time: string
  status: string
  notes: string | null
  clients: any
  services: any
}

type ScheduleBlock = {
  id: string
  date: string
  time: string | null
  reason: string | null
  is_full_day: boolean
}

function getClientData(clients: any) {
  if (!clients) return null
  return Array.isArray(clients) ? clients[0] : clients
}

function getServiceData(services: any) {
  if (!services) return null
  return Array.isArray(services) ? services[0] : services
}

function getStatusClasses(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700"
    case "completed":
      return "bg-blue-100 text-blue-700"
    case "cancelled":
      return "bg-red-100 text-red-700"
    case "pending":
      return "bg-amber-100 text-amber-700"
    default:
      return "bg-stone-100 text-stone-700"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "confirmed":
      return "Confirmada"
    case "completed":
      return "Completada"
    case "cancelled":
      return "Cancelada"
    case "pending":
      return "Pendiente"
    default:
      return status
  }
}

function AdminAgendaPage() {
  const today = new Date().toISOString().split("T")[0]

  const [selectedDate, setSelectedDate] = useState(today)
  const [reservations, setReservations] = useState<AgendaReservation[]>([])
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refreshAgenda = async () => {
    try {
      setLoading(true)
      setError("")

      const [
        { data: reservationsData, error: resError },
        { data: blocksData, error: blockError },
      ] = await Promise.all([
        supabase
          .from("appointments")
          .select(`
            id,
            date,
            time,
            status,
            notes,
            clients (full_name, phone),
            services (name, category)
          `)
          .eq("date", selectedDate)
          .order("time"),
        supabase
          .from("schedule_blocks")
          .select("*")
          .eq("date", selectedDate),
      ])

      if (resError || blockError) {
        throw new Error("Error actualizando agenda.")
      }

      setReservations((reservationsData ?? []) as AgendaReservation[])
      setBlocks((blocksData ?? []) as ScheduleBlock[])
    } catch {
      setError("No se pudo actualizar la agenda.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAgenda()
  }, [selectedDate])

  const reservationsByTime = useMemo(() => {
    const grouped: Record<string, AgendaReservation[]> = {}

    timeSlots.forEach((slot) => {
      grouped[slot] = []
    })

    reservations.forEach((reservation) => {
      const time = String(reservation.time).slice(0, 5)

      if (!grouped[time]) {
        grouped[time] = []
      }

      grouped[time].push(reservation)
    })

    return grouped
  }, [reservations])

  const blockedTimes = useMemo(() => {
    return blocks
      .filter((block) => !block.is_full_day && block.time)
      .map((block) => String(block.time).slice(0, 5))
  }, [blocks])

  const fullDayBlock = useMemo(() => {
    return blocks.find((block) => block.is_full_day) ?? null
  }, [blocks])

  const isFullDayBlocked = !!fullDayBlock

  const handleBlock = async (time: string) => {
    try {
      setError("")
      const reason = prompt("Motivo del bloqueo (opcional)") || null

      const { error } = await supabase.from("schedule_blocks").insert([
        {
          date: selectedDate,
          time,
          reason,
          is_full_day: false,
        },
      ])

      if (error) {
        throw new Error()
      }

      await refreshAgenda()
    } catch {
      setError("No se pudo bloquear el horario.")
    }
  }

  const handleUnblock = async (time: string) => {
    try {
      setError("")

      const block = blocks.find(
        (b) => !b.is_full_day && String(b.time).slice(0, 5) === time
      )

      if (!block) return

      const { error } = await supabase
        .from("schedule_blocks")
        .delete()
        .eq("id", block.id)

      if (error) {
        throw new Error()
      }

      await refreshAgenda()
    } catch {
      setError("No se pudo desbloquear el horario.")
    }
  }

  const handleBlockFullDay = async () => {
    try {
      setError("")
      const reason = prompt("Motivo del bloqueo del día (opcional)") || null

      const { error } = await supabase.from("schedule_blocks").insert([
        {
          date: selectedDate,
          time: null,
          reason,
          is_full_day: true,
        },
      ])

      if (error) {
        throw new Error()
      }

      await refreshAgenda()
    } catch {
      setError("No se pudo bloquear el día completo.")
    }
  }

  const handleUnblockFullDay = async () => {
    try {
      setError("")

      if (!fullDayBlock) return

      const { error } = await supabase
        .from("schedule_blocks")
        .delete()
        .eq("id", fullDayBlock.id)

      if (error) {
        throw new Error()
      }

      await refreshAgenda()
    } catch {
      setError("No se pudo desbloquear el día completo.")
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      setError("")

      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id)

      if (error) {
        throw new Error()
      }

      await refreshAgenda()
    } catch {
      setError("No se pudo actualizar el estado.")
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-stone-950">Agenda</h1>

          <div className="flex flex-wrap gap-2">
            {!isFullDayBlocked ? (
              <button
                onClick={handleBlockFullDay}
                className="rounded bg-red-500 px-4 py-2 text-sm text-white"
              >
                Bloquear día
              </button>
            ) : (
              <button
                onClick={handleUnblockFullDay}
                className="rounded bg-green-600 px-4 py-2 text-sm text-white"
              >
                Desbloquear día
              </button>
            )}

            <Link
              to="/admin/reservas"
              className="rounded border px-4 py-2 text-sm"
            >
              Ver reservas
            </Link>

            <Link
              to="/admin/dashboard"
              className="rounded border px-4 py-2 text-sm"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="mb-6 rounded border px-4 py-2"
        />

        {isFullDayBlocked && (
          <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-700">
            Este día está completamente bloqueado.
            {fullDayBlock?.reason ? ` Motivo: ${fullDayBlock.reason}` : ""}
          </div>
        )}

        {loading && <p>Cargando...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && (
          <div className="space-y-4">
            {timeSlots.map((slot) => {
              const slotReservations = reservationsByTime[slot] ?? []
              const isBlocked = blockedTimes.includes(slot)

              if (isFullDayBlocked) {
                return (
                  <div
                    key={slot}
                    className="rounded bg-white p-4 shadow opacity-60"
                  >
                    <strong>{slot}</strong>
                    <p className="mt-1 text-sm text-red-500">Día bloqueado</p>
                  </div>
                )
              }

              return (
                <div key={slot} className="rounded bg-white p-4 shadow">
                  <div className="mb-2 flex justify-between">
                    <strong>{slot}</strong>

                    {!isBlocked ? (
                      <button
                        onClick={() => handleBlock(slot)}
                        className="text-xs text-red-500"
                      >
                        Bloquear
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnblock(slot)}
                        className="text-xs text-green-600"
                      >
                        Desbloquear
                      </button>
                    )}
                  </div>

                  {isBlocked && (
                    <div className="mb-2 text-sm text-red-600">
                      Horario bloqueado
                    </div>
                  )}

                  {slotReservations.length > 0 && (
                    <div className="space-y-2">
                      {slotReservations.map((reservation) => {
                        const client = getClientData(reservation.clients)
                        const service = getServiceData(reservation.services)

                        return (
                          <div
                            key={reservation.id}
                            className="rounded border p-3"
                          >
                            <p className="font-semibold">
                              {client?.full_name ?? "Sin nombre"}
                            </p>

                            <p className="text-sm">
                              {service?.name ?? "Sin servicio"}
                            </p>

                            <p className="text-xs text-stone-500">
                              {client?.phone ?? "Sin teléfono"}
                            </p>

                            {reservation.notes ? (
                              <p className="mt-1 text-xs text-stone-500">
                                Nota: {reservation.notes}
                              </p>
                            ) : null}

                            <div className="mt-3 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClasses(
                                  reservation.status
                                )}`}
                              >
                                {getStatusLabel(reservation.status)}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {reservation.status !== "confirmed" && (
                                <button
                                  onClick={() =>
                                    updateStatus(reservation.id, "confirmed")
                                  }
                                  className="rounded bg-green-100 px-2 py-1 text-xs text-green-700"
                                >
                                  Confirmar
                                </button>
                              )}

                              {reservation.status !== "completed" && (
                                <button
                                  onClick={() =>
                                    updateStatus(reservation.id, "completed")
                                  }
                                  className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700"
                                >
                                  Completar
                                </button>
                              )}

                              {reservation.status !== "cancelled" && (
                                <button
                                  onClick={() =>
                                    updateStatus(reservation.id, "cancelled")
                                  }
                                  className="rounded bg-red-100 px-2 py-1 text-xs text-red-700"
                                >
                                  Cancelar
                                </button>
                              )}

                              <Link
                                to={`/admin/reservas/${reservation.id}`}
                                className="rounded border px-2 py-1 text-xs text-stone-700"
                              >
                                Editar
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {!isBlocked && slotReservations.length === 0 && (
                    <p className="text-sm text-gray-400">Disponible</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminAgendaPage