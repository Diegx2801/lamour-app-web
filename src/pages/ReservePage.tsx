import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { supabase } from "../lib/supabase"
import { timeSlots } from "../data/timeSlots"
import { categories } from "../data/services"
import {
  getAvailableLashTimeSlots,
  hasCapacityForLashes,
} from "../lib/availability"

type ReservationForm = {
  serviceId: string
  fullName: string
  phone: string
  date: string
  time: string
  notes: string
}

type ServiceRow = {
  id: string
  name: string
  price: number
  category: string | null
  duration_minutes: number | null
  is_active?: boolean
}

type RelatedServiceRow =
  | {
      category: string | null
      duration_minutes: number | null
    }
  | {
      category: string | null
      duration_minutes: number | null
    }[]
  | null

type AppointmentAvailabilityRow = {
  date: string
  time: string
  status: string
  serviceCategory: string | null
  durationMinutes: number | null
}

type CategoryCardService = {
  id: string
  name: string
  description: string
  price: string
  retouch?: string
  category: string | null
  duration_minutes: number | null
}

type CategoryCard = {
  title: string
  subtitle: string
  services: CategoryCardService[]
}

type SubmittedReservation = {
  serviceName: string
  category: string | null
  date: string
  time: string
  fullName: string
  phone: string
  totalPrice: number
  depositAmount: number
  remainingAmount: number
}

const initialForm: ReservationForm = {
  serviceId: "",
  fullName: "",
  phone: "",
  date: "",
  time: "",
  notes: "",
}

const WHATSAPP_NUMBER = "51957230015"

function getRelatedService(service: RelatedServiceRow) {
  if (!service) return null
  return Array.isArray(service) ? service[0] ?? null : service
}

function normalizePeruvianPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "")

  if (/^9\d{8}$/.test(cleaned)) {
    return cleaned
  }

  if (/^(51)?9\d{8}$/.test(cleaned)) {
    return cleaned.slice(-9)
  }

  return null
}

function isSunday(dateString: string) {
  if (!dateString) return false
  const date = new Date(`${dateString}T12:00:00`)
  return date.getDay() === 0
}

function formatDateForMessage(dateString: string) {
  if (!dateString) return "-"
  const [year, month, day] = dateString.split("-")
  return `${day}/${month}/${year}`
}

function ReservePage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<ReservationForm>(initialForm)
  const [services, setServices] = useState<ServiceRow[]>([])
  const [selectedServiceData, setSelectedServiceData] = useState<ServiceRow | null>(null)
  const [submittedReservation, setSubmittedReservation] = useState<SubmittedReservation | null>(null)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true)

        const { data, error } = await supabase
          .from("services")
          .select("id, name, price, category, duration_minutes, is_active")
          .eq("is_active", true)
          .order("name", { ascending: true })

        if (error) {
          throw new Error("No se pudieron cargar los servicios.")
        }

        setServices((data ?? []) as ServiceRow[])
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error al cargar los servicios."
        )
      } finally {
        setLoadingServices(false)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    if (!formData.serviceId) {
      setSelectedServiceData(null)
      return
    }

    const selected =
      services.find((service) => service.id === formData.serviceId) ?? null

    setSelectedServiceData(selected)
  }, [formData.serviceId, services])

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.date || !selectedServiceData) {
        setAvailableSlots([])
        return
      }

      if (isSunday(formData.date)) {
        setAvailableSlots([])
        return
      }

      try {
        setLoadingSlots(true)

        const { data, error } = await supabase
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
          .eq("date", formData.date)
          .neq("status", "cancelled")

        if (error) {
          throw new Error("No se pudieron cargar los horarios.")
        }

        const appointments: AppointmentAvailabilityRow[] = ((data ?? []) as any[]).map(
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
            formData.date,
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

        setAvailableSlots(filteredSlots)

        if (formData.time && !filteredSlots.includes(formData.time)) {
          setFormData((prev) => ({ ...prev, time: "" }))
        }
      } catch {
        setAvailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailableSlots()
  }, [formData.date, formData.time, selectedServiceData])

  const servicePrice = useMemo(() => {
    return Number(selectedServiceData?.price ?? 0)
  }, [selectedServiceData])

  const depositAmount = 10
  const remainingAmount = Math.max(servicePrice - depositAmount, 0)

  const today = new Date().toISOString().split("T")[0]

  const phonePreview = useMemo(() => {
    return normalizePeruvianPhone(formData.phone)
  }, [formData.phone])

  const serviceIdsByName = useMemo(() => {
    const map = new Map<string, string>()
    services.forEach((service) => {
      map.set(service.name.trim().toLowerCase(), service.id)
    })
    return map
  }, [services])

  const categoryCards = useMemo<CategoryCard[]>(() => {
    return categories
      .map((category): CategoryCard => {
        const categoryServices: CategoryCardService[] =
          category.services.reduce<CategoryCardService[]>((acc, item) => {
            const id = serviceIdsByName.get(item.name.trim().toLowerCase())
            const fullService = services.find((service) => service.id === id)

            if (!id || !fullService) {
              return acc
            }

            acc.push({
              id,
              name: item.name,
              description: item.description,
              price: item.price,
              retouch: item.retouch,
              category: fullService.category,
              duration_minutes: fullService.duration_minutes,
            })

            return acc
          }, [])

        return {
          title: category.title,
          subtitle: category.subtitle ?? "",
          services: categoryServices,
        }
      })
      .filter((category) => category.services.length > 0)
  }, [services, serviceIdsByName])

  const whatsappMessage = useMemo(() => {
    const reservation = submittedReservation

    if (!reservation) {
      return ""
    }

    return `Hola, hice una solicitud de reserva en L’AMOUR Beauty Studio. Te envío mi comprobante de abono de S/ 10 para confirmar mi cita.

Servicio: ${reservation.serviceName}
Fecha: ${formatDateForMessage(reservation.date)}
Hora: ${reservation.time}
Nombre: ${reservation.fullName}
Teléfono: ${reservation.phone}`
  }, [submittedReservation])

  const whatsappUrl = useMemo(() => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      whatsappMessage
    )}`
  }, [whatsappMessage])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      }

      if (name === "date") {
        next.time = ""
      }

      return next
    })
  }

  const handleSelectService = (serviceId: string) => {
    setError("")
    setFormData((prev) => ({
      ...prev,
      serviceId,
      date: "",
      time: "",
    }))
  }

  const handleNewReservation = () => {
    setSubmittedReservation(null)
    setFormData(initialForm)
    setSelectedServiceData(null)
    setAvailableSlots([])
    setError("")
    setStep(1)
  }

  const goToNextStep = () => {
    setError("")

    if (step === 1) {
      if (!formData.serviceId) {
        setError("Selecciona un servicio para continuar.")
        return
      }
    }

    if (step === 2) {
      if (!formData.date) {
        setError("Selecciona una fecha para continuar.")
        return
      }

      if (isSunday(formData.date)) {
        setError("No atendemos domingos. Selecciona otra fecha.")
        return
      }

      if (!formData.time) {
        setError("Selecciona una hora para continuar.")
        return
      }

      if (!availableSlots.includes(formData.time)) {
        setError("La hora seleccionada ya no tiene disponibilidad.")
        return
      }
    }

    if (step === 3) {
      if (!formData.fullName.trim()) {
        setError("Ingresa tu nombre completo.")
        return
      }

      if (!formData.phone.trim()) {
        setError("Ingresa tu teléfono.")
        return
      }

      if (!normalizePeruvianPhone(formData.phone)) {
        setError("Ingresa un celular peruano válido. Ejemplo: 957230015 o +51957230015")
        return
      }
    }

    setStep((prev) => Math.min(prev + 1, 4))
  }

  const goToPreviousStep = () => {
    setError("")
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (
      !formData.serviceId ||
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.date ||
      !formData.time
    ) {
      setError("Completa los campos obligatorios para continuar.")
      return
    }

    if (isSunday(formData.date)) {
      setError("No atendemos domingos. Selecciona otra fecha.")
      return
    }

    if (!availableSlots.includes(formData.time)) {
      setError("La hora seleccionada ya no tiene disponibilidad.")
      return
    }

    const normalizedPhone = normalizePeruvianPhone(formData.phone)

    if (!normalizedPhone) {
      setError("Ingresa un celular peruano válido. Ejemplo: 957230015 o +51957230015")
      return
    }

    try {
      setLoading(true)

      const selectedService = services.find(
        (service) => service.id === formData.serviceId
      )

      if (!selectedService) {
        throw new Error("No se encontró el servicio seleccionado.")
      }

      const { data: existingClient, error: clientFetchError } = await supabase
        .from("clients")
        .select("id, full_name, phone")
        .eq("phone", normalizedPhone)
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
              full_name: formData.fullName.trim(),
              phone: normalizedPhone,
            },
          ])
          .select("id")
          .single()

        if (clientInsertError || !newClient) {
          throw new Error("No se pudo registrar el cliente.")
        }

        clientId = newClient.id
      } else {
        const { error: clientUpdateError } = await supabase
          .from("clients")
          .update({
            full_name: formData.fullName.trim(),
            phone: normalizedPhone,
          })
          .eq("id", clientId)

        if (clientUpdateError) {
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
          .eq("date", formData.date)
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
          formData.date,
          formData.time,
          2,
          Number(selectedService.duration_minutes ?? 120)
        )

        if (!hasCapacity) {
          throw new Error("Ese horario ya no tiene disponibilidad para pestañas.")
        }
      } else {
        const existingAppointments = appointments.filter(
          (item) => item.time === formData.time
        )

        if (existingAppointments.length > 0) {
          throw new Error("Este horario ya está ocupado.")
        }
      }

      const totalPrice = Number(selectedService.price)
      const deposit = 10
      const remaining = totalPrice - deposit

      const { error: appointmentError } = await supabase
        .from("appointments")
        .insert([
          {
            client_id: clientId,
            service_id: selectedService.id,
            date: formData.date,
            time: formData.time,
            status: "pending",
            notes: formData.notes || null,
            total_price: totalPrice,
            deposit_amount: deposit,
            remaining_amount: remaining,
          },
        ])

      if (appointmentError) {
        throw new Error("No se pudo registrar la reserva.")
      }

      setSubmittedReservation({
        serviceName: selectedService.name,
        category: selectedService.category,
        date: formData.date,
        time: formData.time,
        fullName: formData.fullName.trim(),
        phone: normalizedPhone,
        totalPrice,
        depositAmount: deposit,
        remainingAmount: remaining,
      })

      setFormData(initialForm)
      setSelectedServiceData(null)
      setAvailableSlots([])
      setError("")
      setStep(1)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const stepTitle =
    step === 1
      ? "Elige tu servicio"
      : step === 2
      ? "Selecciona fecha y hora"
      : step === 3
      ? "Completa tus datos"
      : "Confirma tu reserva"

  if (submittedReservation) {
    return (
      <div className="min-h-screen bg-[#f6f1e9] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">
              Reserva registrada
            </p>

            <h1 className="mt-3 text-4xl font-semibold text-stone-950">
              Solicitud enviada con éxito
            </h1>

            <p className="mt-4 leading-7 text-stone-600">
              Tu reserva quedó registrada correctamente. El siguiente paso es
              enviar tu comprobante de abono por WhatsApp para completar la
              confirmación.
            </p>

            <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700">
              <p className="mb-3 text-base font-semibold text-stone-950">
                Resumen de tu reserva
              </p>
              <p>
                <span className="font-medium">Servicio:</span>{" "}
                {submittedReservation.serviceName}
              </p>
              <p>
                <span className="font-medium">Categoría:</span>{" "}
                {submittedReservation.category ?? "Sin categoría"}
              </p>
              <p>
                <span className="font-medium">Fecha:</span>{" "}
                {formatDateForMessage(submittedReservation.date)}
              </p>
              <p>
                <span className="font-medium">Hora:</span>{" "}
                {submittedReservation.time}
              </p>
              <p>
                <span className="font-medium">Nombre:</span>{" "}
                {submittedReservation.fullName}
              </p>
              <p>
                <span className="font-medium">Teléfono:</span>{" "}
                {submittedReservation.phone}
              </p>
              <p className="mt-3">
                <span className="font-medium">Precio total:</span> S/{" "}
                {submittedReservation.totalPrice.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Abono:</span> S/{" "}
                {submittedReservation.depositAmount.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Saldo:</span> S/{" "}
                {submittedReservation.remainingAmount.toFixed(2)}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-stone-950 px-6 py-3 text-center text-sm font-medium text-white transition hover:opacity-90"
              >
                Enviar comprobante por WhatsApp
              </a>

              <button
                type="button"
                onClick={handleNewReservation}
                className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800"
              >
                Nueva reserva
              </button>

              <Link
                to="/"
                className="rounded-full border border-stone-300 px-6 py-3 text-center text-sm font-medium text-stone-800"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f1e9] px-6 py-16">
      <div className="mx-auto max-w-6xl">
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
          Reserva tu atención en L’AMOUR Beauty Studio siguiendo cada paso.
        </p>

        <div className="mt-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
          Horario de atención: lunes a sábado, de 9:00 am a 7:00 pm.
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-medium text-stone-500">
                Paso {step} de 4
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                {stepTitle}
              </h2>
            </div>

            <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-stone-950 transition-all"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  {loadingServices && (
                    <p className="text-sm text-stone-500">Cargando servicios...</p>
                  )}

                  {!loadingServices &&
                    categoryCards.map((category) => (
                      <div key={category.title}>
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-stone-950">
                            {category.title}
                          </h3>
                          <p className="text-sm text-stone-500">
                            {category.subtitle}
                          </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {category.services.map((service) => {
                            const isSelected = formData.serviceId === service.id

                            return (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() => handleSelectService(service.id)}
                                className={`rounded-2xl border p-4 text-left transition ${
                                  isSelected
                                    ? "border-stone-950 bg-stone-950 text-white"
                                    : "border-stone-200 bg-white hover:border-stone-400"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-semibold">
                                      {service.name}
                                    </p>
                                    <p
                                      className={`mt-1 text-sm ${
                                        isSelected
                                          ? "text-stone-200"
                                          : "text-stone-500"
                                      }`}
                                    >
                                      {service.description}
                                    </p>
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                                      isSelected
                                        ? "bg-white text-stone-950"
                                        : "bg-stone-100 text-stone-700"
                                    }`}
                                  >
                                    {service.price}
                                  </span>
                                </div>

                                <div
                                  className={`mt-3 flex flex-wrap gap-2 text-xs ${
                                    isSelected ? "text-stone-200" : "text-stone-500"
                                  }`}
                                >
                                  {service.duration_minutes ? (
                                    <span>Duración: {service.duration_minutes} min</span>
                                  ) : null}
                                  {service.retouch ? (
                                    <span>Retoque: {service.retouch}</span>
                                  ) : null}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                  {selectedServiceData && (
                    <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
                      <p>
                        <span className="font-semibold">Servicio:</span>{" "}
                        {selectedServiceData.name}
                      </p>
                      <p>
                        <span className="font-semibold">Precio:</span> S/{" "}
                        {Number(selectedServiceData.price).toFixed(2)}
                      </p>
                      <p>
                        <span className="font-semibold">Categoría:</span>{" "}
                        {selectedServiceData.category ?? "Sin categoría"}
                      </p>
                      <p>
                        <span className="font-semibold">Duración:</span>{" "}
                        {selectedServiceData.duration_minutes ?? 0} min
                      </p>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-stone-800">
                        Fecha *
                      </label>
                      <input
                        type="date"
                        name="date"
                        min={today}
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                      />
                    </div>

                    <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                      <p className="font-medium text-stone-900">Horario</p>
                      <p className="mt-1">Lunes a sábado</p>
                      <p>9:00 am a 7:00 pm</p>
                      <p className="mt-2 text-red-600">Domingos: no disponible</p>
                    </div>
                  </div>

                  {formData.date && isSunday(formData.date) && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      No atendemos domingos. Selecciona otra fecha.
                    </div>
                  )}

                  <div>
                    <label className="mb-3 block text-sm font-medium text-stone-800">
                      Hora *
                    </label>

                    {!selectedServiceData ? (
                      <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-4 text-sm text-stone-500">
                        Primero selecciona un servicio.
                      </div>
                    ) : !formData.date ? (
                      <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-4 text-sm text-stone-500">
                        Primero selecciona una fecha.
                      </div>
                    ) : loadingSlots ? (
                      <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-4 text-sm text-stone-500">
                        Cargando horarios...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {timeSlots.map((slot) => {
                          const isAvailable = availableSlots.includes(slot)
                          const isSelected = formData.time === slot

                          return (
                            <button
                              key={slot}
                              type="button"
                              disabled={!isAvailable || isSunday(formData.date)}
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, time: slot }))
                              }
                              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                                isSelected
                                  ? "border-stone-950 bg-stone-950 text-white"
                                  : isAvailable && !isSunday(formData.date)
                                  ? "border-stone-300 bg-white text-stone-800 hover:border-stone-500"
                                  : "cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 line-through"
                              }`}
                            >
                              {slot}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {!loadingSlots &&
                      formData.date &&
                      !isSunday(formData.date) &&
                      availableSlots.length === 0 && (
                        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                          No quedan horarios disponibles para esa fecha.
                        </div>
                      )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <>
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
                      placeholder="Ejemplo: 957230015 o +51957230015"
                      className="w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none"
                    />
                    <p className="mt-2 text-xs text-stone-500">
                      Aceptamos números peruanos móviles de 9 dígitos.
                    </p>
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
                </>
              )}

              {step === 4 && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700">
                  <p className="mb-2 text-base font-semibold text-stone-950">
                    Revisa tu reserva
                  </p>
                  <p>
                    <span className="font-medium">Servicio:</span>{" "}
                    {selectedServiceData?.name ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium">Fecha:</span>{" "}
                    {formatDateForMessage(formData.date)}
                  </p>
                  <p>
                    <span className="font-medium">Hora:</span>{" "}
                    {formData.time || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Cliente:</span>{" "}
                    {formData.fullName || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Teléfono:</span>{" "}
                    {phonePreview ?? formData.phone ?? "-"}
                  </p>
                  <p>
                    <span className="font-medium">Abono requerido:</span> S/ 10.00
                  </p>

                  <div className="mt-4 rounded-2xl bg-white p-4 text-stone-600">
                    Al finalizar, podrás tocar un botón para ir a WhatsApp y
                    enviar tu comprobante de abono.
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  disabled={step === 1 || loading}
                  className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800 disabled:opacity-40"
                >
                  Anterior
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={loading}
                    className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    Continuar
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "Registrando..." : "Solicitar reserva"}
                  </button>
                )}
              </div>
            </form>
          </div>

          <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-950">
              Resumen de reserva
            </p>

            <div className="mt-4 space-y-3 text-sm text-stone-600">
              <div>
                <p className="font-medium text-stone-900">Servicio</p>
                <p>{selectedServiceData?.name ?? "Aún no seleccionado"}</p>
              </div>

              <div>
                <p className="font-medium text-stone-900">Categoría</p>
                <p>{selectedServiceData?.category ?? "Pendiente"}</p>
              </div>

              <div>
                <p className="font-medium text-stone-900">Fecha</p>
                <p>{formData.date ? formatDateForMessage(formData.date) : "Pendiente"}</p>
              </div>

              <div>
                <p className="font-medium text-stone-900">Hora</p>
                <p>{formData.time || "Pendiente"}</p>
              </div>

              <div>
                <p className="font-medium text-stone-900">Precio total</p>
                <p>S/ {servicePrice.toFixed(2)}</p>
              </div>

              <div>
                <p className="font-medium text-stone-900">Abono</p>
                <p>S/ {depositAmount.toFixed(2)}</p>
              </div>

              <div>
                <p className="font-medium text-stone-900">Saldo</p>
                <p>S/ {remainingAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              Tu cita queda registrada como solicitud. Luego podrás enviar tu
              comprobante por WhatsApp para terminar la confirmación.
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default ReservePage