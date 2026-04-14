import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { supabase } from "../lib/supabase"
import { timeSlots } from "../data/timeSlots"
import { getAvailableLashTimeSlots, hasCapacityForLashes } from "../lib/availability"

type ReservationService =
  | {
      id: string
      name: string
      category: string | null
      duration_minutes: number | null
    }
  | {
      id: string
      name: string
      category: string | null
      duration_minutes: number | null
    }[]
  | null

type ReservationData = {
  id: string
  date: string
  time: string
  status: string
  notes: string | null
  lashista: string | null
  services: ReservationService
}

type AppointmentAvailabilityRow = {
  id?: string
  date: string
  time: string
  status: string
  serviceCategory: string | null
  durationMinutes: number | null
}

type ScheduleBlockRow = {
  id: string
  date: string
  time: string | null
  reason: string | null
  is_full_day: boolean
}

type LashistaOption = "Melissa" | "Katy" | ""

function getRelatedService(service: ReservationService) {
  if (!service) return null
  return Array.isArray(service) ? service[0] ?? null : service
}

function isSunday(dateString: string) {
  if (!dateString) return false
  const date = new Date(`${dateString}T12:00:00`)
  return date.getDay() === 0
}

function AdminEditReservationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    date: "",
    time: "",
    status: "pending",
    notes: "",
    lashista: "" as LashistaOption,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots)
  const [selectedServiceData, setSelectedServiceData] = useState<ReturnType<typeof getRelatedService>>(null)
  const [blockedReason, setBlockedReason] = useState("")

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true)
        setError("")

        const { data, error } = await supabase
          .from("appointments")
          .select(`
            id,
            date,
            time,
            status,
            notes,
            lashista,
            services (
              id,
              name,
              category,
              duration_minutes
            )
          `)
          .eq("id", id)
          .single()

        if (error || !data) {
          throw new Error("No se pudo cargar la reserva.")
        }

        const reservation = data as ReservationData
        const service = getRelatedService(reservation.services)

        setForm({
          date: reservation.date ?? "",
          time: String(reservation.time).slice(0, 5),
          status: reservation.status ?? "pending",
          notes: reservation.notes ?? "",
          lashista: (reservation.lashista as LashistaOption) ?? "",
        })

        setSelectedServiceData(service)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchReservation()
    }
  }, [id])

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setBlockedReason("")

      if (!form.date || !id) {
        setAvailableSlots(timeSlots)
        return
      }

      if (isSunday(form.date)) {
        setAvailableSlots([])
        setBlockedReason("No se atiende domingos.")
        return
      }

      try {
        const [
          { data: appointmentsData, error: appointmentsError },
          { data: blocksData, error: blocksError },
        ] = await Promise.all([
          supabase
            .from("appointments")
            .select(`
              id,
              date,
              time,
              status,
              services (
                category,
                duration_minutes
              )
            `)
            .eq("date", form.date)
            .neq("status", "cancelled"),
          supabase
            .from("schedule_blocks")
            .select("id, date, time, reason, is_full_day")
            .eq("date", form.date),
        ])

        if (appointmentsError) {
          throw new Error("No se pudieron cargar las reservas del día.")
        }

        if (blocksError) {
          throw new Error("No se pudieron cargar los bloqueos del día.")
        }

        const blocks = (blocksData ?? []) as ScheduleBlockRow[]
        const fullDayBlock = blocks.find((block) => block.is_full_day)

        if (fullDayBlock) {
          setAvailableSlots([])
          setBlockedReason(fullDayBlock.reason ?? "Día bloqueado.")
          return
        }

        const blockedTimes = blocks
          .filter((block) => !block.is_full_day && block.time)
          .map((block) => String(block.time).slice(0, 5))

        const appointments: AppointmentAvailabilityRow[] = ((appointmentsData ?? []) as any[]).map(
          (item) => {
            const relatedService = getRelatedService(item.services)

            return {
              id: item.id,
              date: item.date,
              time: String(item.time).slice(0, 5),
              status: item.status,
              serviceCategory: relatedService?.category ?? null,
              durationMinutes: relatedService?.duration_minutes ?? null,
            }
          }
        )

        const otherAppointments = appointments.filter((item) => item.id !== id)

        let filteredSlots = timeSlots

        if (selectedServiceData?.category === "Pestañas") {
          filteredSlots = getAvailableLashTimeSlots(
            otherAppointments,
            form.date,
            timeSlots,
            2,
            Number(selectedServiceData.duration_minutes ?? 120)
          )
        } else {
          const occupiedTimes = otherAppointments
            .filter((item) => item.serviceCategory !== "Pestañas")
            .map((item) => item.time)

          filteredSlots = timeSlots.filter((slot) => !occupiedTimes.includes(slot))
        }

        filteredSlots = filteredSlots.filter((slot) => !blockedTimes.includes(slot))

        const currentTime = form.time
        if (currentTime && !filteredSlots.includes(currentTime)) {
          filteredSlots = [...filteredSlots, currentTime].sort()
        }

        setAvailableSlots(filteredSlots)
      } catch {
        setAvailableSlots(timeSlots)
        setBlockedReason("")
      }
    }

    fetchAvailableSlots()
  }, [form.date, id, selectedServiceData, form.time])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setForm((prev) => {
      const next = { ...prev, [name]: value }

      if (name === "date") {
        next.time = ""
        setBlockedReason("")
      }

      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.date || !form.time || !form.status) {
      setError("Completa los campos obligatorios.")
      return
    }

    if (isSunday(form.date)) {
      setError("No se atiende domingos.")
      return
    }

    if (blockedReason) {
      setError(blockedReason)
      return
    }

    try {
      setSaving(true)

      const { data: blocksData, error: blocksError } = await supabase
        .from("schedule_blocks")
        .select("id, date, time, reason, is_full_day")
        .eq("date", form.date)

      if (blocksError) {
        throw new Error("No se pudieron verificar los bloqueos.")
      }

      const blocks = (blocksData ?? []) as ScheduleBlockRow[]
      const fullDayBlock = blocks.find((block) => block.is_full_day)
      const blockedTimes = blocks
        .filter((block) => !block.is_full_day && block.time)
        .map((block) => String(block.time).slice(0, 5))

      if (fullDayBlock) {
        throw new Error(fullDayBlock.reason || "Ese día está bloqueado.")
      }

      if (blockedTimes.includes(form.time)) {
        throw new Error("Ese horario está bloqueado manualmente.")
      }

      const { data: rawAppointments, error: appointmentCheckError } =
        await supabase
          .from("appointments")
          .select(`
            id,
            date,
            time,
            status,
            services (
              category,
              duration_minutes
            )
          `)
          .eq("date", form.date)
          .neq("status", "cancelled")

      if (appointmentCheckError) {
        throw new Error("Error al verificar disponibilidad del horario.")
      }

      const appointments: AppointmentAvailabilityRow[] = ((rawAppointments ?? []) as any[]).map(
        (item) => {
          const relatedService = getRelatedService(item.services)

          return {
            id: item.id,
            date: item.date,
            time: String(item.time).slice(0, 5),
            status: item.status,
            serviceCategory: relatedService?.category ?? null,
            durationMinutes: relatedService?.duration_minutes ?? null,
          }
        }
      )

      const otherAppointments = appointments.filter((item) => item.id !== id)

      if (selectedServiceData?.category === "Pestañas") {
        const hasCapacity = hasCapacityForLashes(
          otherAppointments,
          form.date,
          form.time,
          2,
          Number(selectedServiceData.duration_minutes ?? 120)
        )

        if (!hasCapacity) {
          throw new Error("Ese horario ya no tiene disponibilidad para pestañas.")
        }
      } else {
        const conflicting = otherAppointments.filter(
          (item) => item.time === form.time && item.serviceCategory !== "Pestañas"
        )

        if (conflicting.length > 0) {
          throw new Error("Ese horario ya está ocupado.")
        }
      }

      const { error } = await supabase
        .from("appointments")
        .update({
          date: form.date,
          time: form.time,
          status: form.status,
          notes: form.notes || null,
          lashista: form.lashista || null,
        })
        .eq("id", id)

      if (error) {
        throw new Error("No se pudo actualizar la reserva.")
      }

      navigate("/admin/reservas")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-8 shadow-sm">
          Cargando reserva...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin/reservas"
          className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
        >
          ← Volver a reservas
        </Link>

        <h1 className="mt-4 text-4xl font-semibold text-stone-950">
          Editar reserva
        </h1>

        <p className="mt-3 text-sm leading-7 text-stone-600">
          Actualiza fecha, hora, estado, lashista y observaciones.
        </p>

        <div className="mt-8 rounded-[2rem] bg-white p-8 shadow-sm">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-800">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-800">
                  Hora *
                </label>
                <select
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  disabled={isSunday(form.date) || !!blockedReason}
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none disabled:bg-stone-100"
                >
                  <option value="">
                    {isSunday(form.date)
                      ? "Domingo no disponible"
                      : blockedReason
                      ? "Día bloqueado"
                      : availableSlots.length === 0
                      ? "No hay horarios disponibles"
                      : "Selecciona una hora"}
                  </option>

                  {availableSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {form.date && isSunday(form.date) && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                No se atiende domingos.
              </div>
            )}

            {blockedReason && !isSunday(form.date) && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {blockedReason}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Estado *
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="completed">Completada</option>
                <option value="cancelled">Cancelada</option>
                <option value="no_show">No show</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Lashista
              </label>
              <select
                name="lashista"
                value={form.lashista}
                onChange={handleChange}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
              >
                <option value="">Sin asignar</option>
                <option value="Melissa">Melissa</option>
                <option value="Katy">Katy</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Observaciones
              </label>
              <textarea
                rows={4}
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Escribe algún detalle adicional"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminEditReservationPage