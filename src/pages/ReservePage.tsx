import { useEffect, useState } from "react"
import { Link } from "react-router"
import { supabase } from "../lib/supabase"
import { timeSlots } from "../data/timeSlots"

type ReservationForm = {
  service: string
  fullName: string
  phone: string
  date: string
  time: string
  notes: string
}

const services = [
  "Clásicas Rimel",
  "Efecto Aura",
  "Rimel Matte",
  "Efecto Lamour",
  "Visión Premium",
  "Volumen Mojado",
  "Clásicas Rimel Marrón",
  "Lash Lifting",
  "Volumen Clásico",
  "Volumen Glow",
  "Volumen Deluxe",
  "Volumen Brasilero",
  "Hawaianas",
  "Extensiones Wispy",
  "Extensiones Anime",
  "Mega Volumen",
  "Hydra Gloss Lips",
  "Pack Cejas Chick",
  "Pack Cejas Glow",
  "Pack Cejas Lamour",
  "Facial Básico",
  "Facial Profundo",
  "Bozo",
  "Patillas",
  "Axilas",
  "Rostro completo",
  "Bikini",
  "Bikini + línea de alba",
]

const initialForm: ReservationForm = {
  service: "",
  fullName: "",
  phone: "",
  date: "",
  time: "",
  notes: "",
}

function ReservePage() {
  const [formData, setFormData] = useState<ReservationForm>(initialForm)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots)
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.date) {
        setAvailableSlots(timeSlots)
        return
      }

      try {
        setLoadingSlots(true)

        const { data, error } = await supabase
          .from("appointments")
          .select("time, status")
          .eq("date", formData.date)
          .neq("status", "cancelled")

        if (error) {
          throw new Error("No se pudieron cargar los horarios.")
        }

        const occupiedTimes = (data ?? []).map((item) =>
          String(item.time).slice(0, 5)
        )

        const filteredSlots = timeSlots.filter(
          (slot) => !occupiedTimes.includes(slot)
        )

        setAvailableSlots(filteredSlots)

        if (formData.time && occupiedTimes.includes(formData.time)) {
          setFormData((prev) => ({ ...prev, time: "" }))
        }
      } catch (err) {
        setAvailableSlots(timeSlots)
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailableSlots()
  }, [formData.date])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError("")
    setSuccessMessage("")

    if (
      !formData.service ||
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.date ||
      !formData.time
    ) {
      setError("Completa los campos obligatorios para continuar.")
      return
    }

    try {
      setLoading(true)

      const { data: serviceRows, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("name", formData.service)

      const serviceData = serviceRows?.[0]

      if (serviceError || !serviceData) {
        throw new Error("No se encontró el servicio seleccionado.")
      }

      const { data: existingClient, error: clientFetchError } = await supabase
        .from("clients")
        .select("*")
        .eq("phone", formData.phone)
        .maybeSingle()

      if (clientFetchError) {
        throw new Error("Error al verificar cliente.")
      }

      let clientId = existingClient?.id

      if (!clientId) {
        const { data: newClient, error: clientInsertError } = await supabase
          .from("clients")
          .insert([
            {
              full_name: formData.fullName,
              phone: formData.phone,
            },
          ])
          .select()
          .single()

        if (clientInsertError || !newClient) {
          throw new Error("No se pudo registrar el cliente.")
        }

        clientId = newClient.id
      }

      const { data: existingAppointments, error: appointmentCheckError } =
        await supabase
          .from("appointments")
          .select("*")
          .eq("date", formData.date)
          .eq("time", formData.time)
          .neq("status", "cancelled")

      if (appointmentCheckError) {
        throw new Error("Error al verificar disponibilidad del horario.")
      }

      if (existingAppointments && existingAppointments.length > 0) {
        throw new Error("Este horario ya está ocupado.")
      }

      const totalPrice = Number(serviceData.price)
      const depositAmount = 10
      const remainingAmount = totalPrice - depositAmount

      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert([
          {
            client_id: clientId,
            service_id: serviceData.id,
            date: formData.date,
            time: formData.time,
            status: "pending",
            notes: formData.notes,
            total_price: totalPrice,
            deposit_amount: depositAmount,
            remaining_amount: remainingAmount,
          },
        ])

      if (appointmentError) {
        throw new Error("No se pudo registrar la reserva.")
      }

      setSuccessMessage(
        "Reserva registrada correctamente. Para confirmar tu cita, realiza un abono de S/ 10 y envía tu comprobante."
      )

      setFormData(initialForm)
      setAvailableSlots(timeSlots)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <Link
            to="/"
            className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
          >
            ← Volver al inicio
          </Link>
        </div>

        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
          Reserva
        </p>

        <h1 className="mt-3 text-4xl font-semibold text-stone-950">
          Agenda tu cita
        </h1>

        <p className="mt-4 leading-7 text-stone-600">
          Completa el formulario para solicitar tu reserva en L’AMOUR Beauty Studio.
        </p>

        <div className="mt-10 rounded-[2rem] bg-white p-8 shadow-sm">
          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Servicio *
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
              >
                <option value="">Selecciona un servicio</option>
                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Nombre completo *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ingresa tu nombre"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Teléfono *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ingresa tu número"
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-800">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
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
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!formData.date || loadingSlots}
                  className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none disabled:bg-stone-100"
                >
                  <option value="">
                    {!formData.date
                      ? "Primero selecciona una fecha"
                      : loadingSlots
                      ? "Cargando horarios..."
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

            <div>
              <label className="mb-2 block text-sm font-medium text-stone-800">
                Observaciones
              </label>
              <textarea
                rows={4}
                name="notes"
                value={formData.notes}
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

            {successMessage && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Registrando..." : "Solicitar reserva"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReservePage