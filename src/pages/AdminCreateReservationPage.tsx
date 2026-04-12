import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router"
import { supabase } from "../lib/supabase"
import { timeSlots } from "../data/timeSlots"

type Service = {
  id: string
  name: string
  price: number
}

function AdminCreateReservationPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    service: "",
    date: "",
    time: "",
  })

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true)

        const { data, error } = await supabase
          .from("services")
          .select("id, name, price")
          .eq("is_active", true)
          .order("name", { ascending: true })

        if (error) {
          throw new Error("No se pudieron cargar los servicios.")
        }

        setServices(data ?? [])
      } catch (err) {
        setError("Error al cargar servicios")
      } finally {
        setLoadingServices(false)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!form.date) {
        setAvailableSlots(timeSlots)
        return
      }

      try {
        setLoadingSlots(true)

        const { data, error } = await supabase
          .from("appointments")
          .select("time, status")
          .eq("date", form.date)
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

        if (form.time && occupiedTimes.includes(form.time)) {
          setForm((prev) => ({ ...prev, time: "" }))
        }
      } catch (err) {
        setAvailableSlots(timeSlots)
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailableSlots()
  }, [form.date])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.fullName || !form.phone || !form.service || !form.date || !form.time) {
      setError("Completa todos los campos")
      return
    }

    try {
      setLoading(true)

      const selectedService = services.find((service) => service.id === form.service)

      if (!selectedService) {
        throw new Error("Servicio no encontrado")
      }

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("*")
        .eq("phone", form.phone)

      if (clientError) {
        throw new Error("Error al buscar cliente")
      }

      let clientId = clientData?.[0]?.id

      if (!clientId) {
        const { data: newClient, error: newClientError } = await supabase
          .from("clients")
          .insert([
            {
              full_name: form.fullName,
              phone: form.phone,
            },
          ])
          .select()

        if (newClientError || !newClient?.[0]) {
          throw new Error("No se pudo crear el cliente")
        }

        clientId = newClient[0].id
      }

      const { data: existingAppointments, error: appointmentCheckError } =
        await supabase
          .from("appointments")
          .select("*")
          .eq("date", form.date)
          .eq("time", form.time)
          .neq("status", "cancelled")

      if (appointmentCheckError) {
        throw new Error("Error al verificar disponibilidad del horario")
      }

      if (existingAppointments && existingAppointments.length > 0) {
        throw new Error("Este horario ya está ocupado")
      }

      const totalPrice = Number(selectedService.price)
      const deposit = 10

      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert([
          {
            client_id: clientId,
            service_id: selectedService.id,
            date: form.date,
            time: form.time,
            status: "confirmed",
            total_price: totalPrice,
            deposit_amount: deposit,
            remaining_amount: totalPrice - deposit,
          },
        ])

      if (appointmentError) {
        throw new Error("No se pudo crear la reserva")
      }

      navigate("/admin/reservas")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la reserva")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-12">
      <div className="mx-auto max-w-xl">
        <Link to="/admin/reservas" className="text-sm text-stone-600">
  ← Volver a reservas
</Link>
        <h1 className="mt-4 mb-6 text-3xl font-semibold">
          Nueva reserva manual
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
        >
          <input
            name="fullName"
            placeholder="Nombre"
            value={form.fullName}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />

          <input
            name="phone"
            placeholder="Teléfono"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />

          <select
            name="service"
            value={form.service}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
            disabled={loadingServices}
          >
            <option value="">
              {loadingServices ? "Cargando servicios..." : "Selecciona un servicio"}
            </option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} — S/ {Number(service.price).toFixed(2)}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />

          <select
            name="time"
            value={form.time}
            onChange={handleChange}
            disabled={!form.date || loadingSlots}
            className="w-full rounded-xl border px-4 py-3 disabled:bg-stone-100"
          >
            <option value="">
              {!form.date
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

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button className="w-full rounded-xl bg-black py-3 text-white">
            {loading ? "Guardando..." : "Crear reserva"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminCreateReservationPage