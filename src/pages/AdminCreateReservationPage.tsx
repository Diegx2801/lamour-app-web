import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { supabase } from "../lib/supabase"
import { timeSlots } from "../data/timeSlots"
import {
  getAvailableLashTimeSlots,
  hasCapacityForLashes,
} from "../lib/availability"

type ServiceRow = {
  id: string
  name: string
  price: number
  category: string | null
  duration_minutes: number | null
}

type AppointmentAvailabilityRow = {
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

function getRelatedService(
  service:
    | {
        category: string | null
        duration_minutes: number | null
      }
    | {
        category: string | null
        duration_minutes: number | null
      }[]
    | null
    | undefined
) {
  if (!service) return null
  return Array.isArray(service) ? service[0] ?? null : service
}

function isSunday(dateString: string) {
  if (!dateString) return false
  const date = new Date(`${dateString}T12:00:00`)
  return date.getDay() === 0
}

function AdminCreateReservationPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    service: "",
    date: "",
    time: "",
    notes: "",
    lashista: "" as LashistaOption,
  })

  const [services, setServices] = useState<ServiceRow[]>([])
  const [selectedServiceData, setSelectedServiceData] = useState<ServiceRow | null>(null)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [blockedReason, setBlockedReason] = useState("")

  const [loading, setLoading] = useState(false)
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true)
        setError("")

        const { data, error } = await supabase
          .from("services")
          .select("id, name, price, category, duration_minutes")
          .eq("is_active", true)
          .order("name", { ascending: true })

        if (error) {
          throw new Error("No se pudieron cargar los servicios.")
        }

        setServices((data ?? []) as ServiceRow[])
      } catch {
        setError("Error al cargar servicios.")
      } finally {
        setLoadingServices(false)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    if (!form.service) {
      setSelectedServiceData(null)
      return
    }

    const selected = services.find((service) => service.id === form.service) ?? null
    setSelectedServiceData(selected)
  }, [form.service, services])

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      setBlockedReason("")

      if (!form.date || !selectedServiceData) {
        setAvailableSlots([])
        return
      }

      if (isSunday(form.date)) {
        setAvailableSlots([])
        setBlockedReason("No se atiende domingos.")
        return
      }

      try {
        setLoadingSlots(true)

        const [
          { data: appointmentsData, error: appointmentsError },
          { data: blocksData, error: blocksError },
        ] = await Promise.all([
          supabase
            .from("appointments")
            .select(`
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
              date: item.date,
              time: String(item.time).slice(0, 5),
              status: item.status,
              serviceCategory: relatedService?.category ?? null,
              durationMinutes: relatedService?.duration_minutes ?? null,
            }
          }
        )

        let filteredSlots: string[] = []

        if (selectedServiceData.category === "Pestañas") {
          filteredSlots = getAvailableLashTimeSlots(
            appointments,
            form.date,
            timeSlots,
            2,
            Number(selectedServiceData.duration_minutes ?? 120)
          )
        } else {
          const occupiedTimes = appointments
            .filter((item) => item.time)
            .map((item) => item.time)

          filteredSlots = timeSlots.filter((slot) => !occupiedTimes.includes(slot))
        }

        filteredSlots = filteredSlots.filter((slot) => !blockedTimes.includes(slot))

        setAvailableSlots(filteredSlots)

        if (form.time && !filteredSlots.includes(form.time)) {
          setForm((prev) => ({ ...prev, time: "" }))
        }
      } catch (err) {
        setAvailableSlots([])
        setBlockedReason("")
        setError(
          err instanceof Error ? err.message : "Error al cargar disponibilidad."
        )
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailableSlots()
  }, [form.date, form.time, selectedServiceData])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setForm((prev) => {
      const next = { ...prev, [name]: value }

      if (name === "service") {
        next.date = ""
        next.time = ""
        setBlockedReason("")
      }

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

    if (!form.fullName || !form.phone || !form.service || !form.date || !form.time) {
      setError("Completa todos los campos.")
      return
    }

    if (isSunday(form.date)) {
      setError("No se atiende domingos.")
      return
    }

    if (!availableSlots.includes(form.time)) {
      setError("La hora seleccionada ya no tiene disponibilidad.")
      return
    }

    try {
      setLoading(true)

      const selectedService = services.find((service) => service.id === form.service)

      if (!selectedService) {
        throw new Error("Servicio no encontrado.")
      }

      const [{ data: blocksData, error: blocksError }] = await Promise.all([
        supabase
          .from("schedule_blocks")
          .select("id, date, time, reason, is_full_day")
          .eq("date", form.date),
      ])

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

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, full_name, phone")
        .eq("phone", form.phone)
        .maybeSingle()

      if (clientError) {
        throw new Error("Error al buscar cliente.")
      }

      let clientId = clientData?.id

      if (!clientId) {
        const { data: newClient, error: newClientError } = await supabase
          .from("clients")
          .insert([
            {
              full_name: form.fullName,
              phone: form.phone,
            },
          ])
          .select("id")
          .single()

        if (newClientError || !newClient) {
          throw new Error("No se pudo crear el cliente.")
        }

        clientId = newClient.id
      } else {
        const { error: updateClientError } = await supabase
          .from("clients")
          .update({
            full_name: form.fullName,
          })
          .eq("id", clientId)

        if (updateClientError) {
          throw new Error("No se pudo actualizar el cliente.")
        }
      }

      const { data: rawAppointments, error: appointmentCheckError } =
        await supabase
          .from("appointments")
          .select(`
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
            date: item.date,
            time: String(item.time).slice(0, 5),
            status: item.status,
            serviceCategory: relatedService?.category ?? null,
            durationMinutes: relatedService?.duration_minutes ?? null,
          }
        }
      )

      if (selectedService.category === "Pestañas") {
        const hasCapacity = hasCapacityForLashes(
          appointments,
          form.date,
          form.time,
          2,
          Number(selectedService.duration_minutes ?? 120)
        )

        if (!hasCapacity) {
          throw new Error("Ese horario ya no tiene disponibilidad para pestañas.")
        }
      } else {
        const existingAppointments = appointments.filter(
          (item) => item.time === form.time
        )

        if (existingAppointments.length > 0) {
          throw new Error("Este horario ya está ocupado.")
        }
      }

      const totalPrice = Number(selectedService.price)
      const deposit = 10

      const { data: insertedAppointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert([
          {
            client_id: clientId,
            service_id: selectedService.id,
            date: form.date,
            time: form.time,
            status: "confirmed",
            notes: form.notes || null,
            lashista: form.lashista || null,
            total_price: totalPrice,
            deposit_amount: deposit,
            remaining_amount: totalPrice - deposit,
          },
        ])
        .select("id")
        .single()

      if (appointmentError || !insertedAppointment) {
        throw new Error("No se pudo crear la reserva.")
      }

      const { error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            appointment_id: insertedAppointment.id,
            amount: deposit,
            payment_method: "efectivo",
            payment_type: "deposit",
            status: "completed",
          },
        ])

      if (paymentError) {
        throw new Error("Se creó la reserva, pero no se pudo registrar el abono.")
      }

      navigate("/admin/reservas")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la reserva.")
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

          <select
            name="lashista"
            value={form.lashista}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          >
            <option value="">Sin asignar</option>
            <option value="Melissa">Melissa</option>
            <option value="Katy">Katy</option>
          </select>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3"
          />

          {form.date && isSunday(form.date) && (
            <p className="text-sm text-red-500">
              No se atiende domingos.
            </p>
          )}

          {blockedReason && !isSunday(form.date) && (
            <p className="text-sm text-red-500">
              {blockedReason}
            </p>
          )}

          <select
            name="time"
            value={form.time}
            onChange={handleChange}
            disabled={
              !form.date ||
              !form.service ||
              loadingSlots ||
              isSunday(form.date) ||
              !!blockedReason
            }
            className="w-full rounded-xl border px-4 py-3 disabled:bg-stone-100"
          >
            <option value="">
              {!form.service
                ? "Primero selecciona un servicio"
                : !form.date
                ? "Primero selecciona una fecha"
                : isSunday(form.date)
                ? "Domingo no disponible"
                : blockedReason
                ? "Día bloqueado"
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

          <textarea
            rows={4}
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Observaciones"
            className="w-full rounded-xl border px-4 py-3"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Crear reserva"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminCreateReservationPage