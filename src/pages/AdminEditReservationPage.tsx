import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { supabase } from "../lib/supabase"
import { timeSlots } from "../data/timeSlots"
import { getAvailableLashTimeSlots, hasCapacityForLashes } from "../lib/availability"

type ReservationData = {
  id: string
  date: string
  time: string
  status: string
  notes: string | null
  services: {
    id: string
    name: string
    category: string | null
    duration_minutes: number | null
  } | null
}

type AppointmentAvailabilityRow = {
  date: string
  time: string
  status: string
  serviceCategory: string | null
  durationMinutes: number | null
}

function AdminEditReservationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    date: "",
    time: "",
    status: "pending",
    notes: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots)
  const [selectedServiceData, setSelectedServiceData] = useState<ReservationData["services"] | null>(null)

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

        const reservation = data as any

        setForm({
          date: reservation.date ?? "",
          time: String(reservation.time).slice(0, 5),
          status: reservation.status ?? "pending",
          notes: reservation.notes ?? "",
        })

        setSelectedServiceData(reservation.services ?? null)
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
      if (!form.date || !id) {
        setAvailableSlots(timeSlots)
        return
      }

      try {
        const { data, error } = await supabase
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

        if (error) {
          throw new Error("No se pudieron cargar los horarios.")
        }

        const appointments: (AppointmentAvailabilityRow & { id?: string })[] = ((data ?? []) as any[]).map(
          (item) => ({
            id: item.id,
            date: item.date,
            time: String(item.time).slice(0, 5),
            status: item.status,
            serviceCategory: item.services?.category ?? null,
            durationMinutes: item.services?.duration_minutes ?? null,
          })
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

          filteredSlots = timeSlots.filter(
            (slot) => !occupiedTimes.includes(slot)
          )
        }

        const currentTime = form.time
        if (currentTime && !filteredSlots.includes(currentTime)) {
          filteredSlots = [...filteredSlots, currentTime].sort()
        }

        setAvailableSlots(filteredSlots)
      } catch {
        setAvailableSlots(timeSlots)
      }
    }

    fetchAvailableSlots()
  }, [form.date, id, selectedServiceData, form.time])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.date || !form.time || !form.status) {
      setError("Completa los campos obligatorios.")
      return
    }

    try {
      setSaving(true)

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

      const appointments: (AppointmentAvailabilityRow & { id?: string })[] = ((rawAppointments ?? []) as any[]).map(
        (item) => ({
          id: item.id,
          date: item.date,
          time: String(item.time).slice(0, 5),
          status: item.status,
          serviceCategory: item.services?.category ?? null,
          durationMinutes: item.services?.duration_minutes ?? null,
        })
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
          notes: form.notes,
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
          Actualiza fecha, hora, estado y observaciones.
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
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                >
                  <option value="">
                    {availableSlots.length === 0
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No show</option>
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