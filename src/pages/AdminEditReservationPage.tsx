import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { supabase } from "../lib/supabase"
import { timeSlots } from "../data/timeSlots"

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

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoading(true)
        setError("")

        const { data, error } = await supabase
          .from("appointments")
          .select("id, date, time, status, notes")
          .eq("id", id)
          .single()

        if (error || !data) {
          throw new Error("No se pudo cargar la reserva.")
        }

        setForm({
          date: data.date ?? "",
          time: String(data.time).slice(0, 5),
          status: data.status ?? "pending",
          notes: data.notes ?? "",
        })
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
          .select("id, time, status")
          .eq("date", form.date)
          .neq("status", "cancelled")

        if (error) {
          throw new Error("No se pudieron cargar los horarios.")
        }

        const occupiedTimes = (data ?? [])
          .filter((item) => item.id !== id)
          .map((item) => String(item.time).slice(0, 5))

        const filteredSlots = timeSlots.filter(
          (slot) => !occupiedTimes.includes(slot)
        )

        setAvailableSlots(filteredSlots)

        if (form.time && occupiedTimes.includes(form.time)) {
          setForm((prev) => ({ ...prev, time: "" }))
        }
      } catch {
        setAvailableSlots(timeSlots)
      }
    }

    fetchAvailableSlots()
  }, [form.date, id])

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

      const { data: existingAppointments, error: appointmentCheckError } =
        await supabase
          .from("appointments")
          .select("id")
          .eq("date", form.date)
          .eq("time", form.time)
          .neq("status", "cancelled")

      if (appointmentCheckError) {
        throw new Error("Error al verificar disponibilidad del horario.")
      }

      const conflicting = (existingAppointments ?? []).filter(
        (item) => item.id !== id
      )

      if (conflicting.length > 0) {
        throw new Error("Ese horario ya está ocupado.")
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