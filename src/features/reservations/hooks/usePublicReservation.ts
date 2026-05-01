import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { timeSlots } from "../../../data/timeSlots"
import { categories } from "../../../data/services"
import {
  getAvailableSlotsForService,
  getBlockedTimes,
  getFullDayBlock,
  mapAppointmentsForAvailability,
  validateSlotAvailability,
} from "../utils/reservationAvailability"
import { submitPublicReservation } from "../use-cases/submitPublicReservation"
import { reservationSchema } from "../validators/reservationSchema"
import {
  formatDateForMessage,
  isSunday,
  normalizePeruvianPhone,
} from "../utils/reservationUtils"
import {
  fetchActiveServices,
  fetchPublicAvailability,
  type ServiceRow,
} from "../api/reservationService"

type ReservationForm = {
  serviceId: string
  fullName: string
  phone: string
  date: string
  time: string
  notes: string
}

type SubmittedReservation = ReservationForm & {
  serviceName: string
  category: string | null
  totalPrice: number
  depositAmount: number
  remainingAmount: number
}

type RequestStatus = "idle" | "loading" | "success" | "error"

const initialForm: ReservationForm = {
  serviceId: "",
  fullName: "",
  phone: "",
  date: "",
  time: "",
  notes: "",
}

const WHATSAPP_NUMBER = "51957230015"

export function usePublicReservation() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<ReservationForm>(initialForm)
  const [services, setServices] = useState<ServiceRow[]>([])
  const [submittedReservation, setSubmittedReservation] =
    useState<SubmittedReservation | null>(null)

  const [activeCategory, setActiveCategory] = useState("")
  const [error, setError] = useState("")
  const [blockedReason, setBlockedReason] = useState("")
  const [submitStatus, setSubmitStatus] = useState<RequestStatus>("idle")
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true)
        setError("")

        const data = await fetchActiveServices()
        setServices(data)
      } catch {
        const message = "Error cargando servicios."
        setError(message)
        toast.error(message)
      } finally {
        setLoadingServices(false)
      }
    }

    loadServices()
  }, [])

  const categoryCards = useMemo(() => {
    const categoryNames = Array.from(
      new Set(
        services
          .map((service) => service.category)
          .filter((category): category is string => Boolean(category))
      )
    )

    return categoryNames.map((categoryName) => {
      const localCategory = categories.find((c) => c.title === categoryName)

      return {
        title: categoryName,
        subtitle: localCategory?.subtitle ?? "Servicios disponibles",
        services: services.filter(
          (service) => service.category === categoryName
        ),
      }
    })
  }, [services])

  useEffect(() => {
    const firstCategoryWithServices = categoryCards.find(
      (category) => category.services.length > 0
    )

    if (!activeCategory && firstCategoryWithServices) {
      setActiveCategory(firstCategoryWithServices.title)
    }
  }, [activeCategory, categoryCards])

  const selectedServiceData = useMemo(() => {
    return services.find((service) => service.id === formData.serviceId) ?? null
  }, [formData.serviceId, services])

  useEffect(() => {
    const loadSlots = async () => {
      setBlockedReason("")
      setError("")

      if (!formData.date || !selectedServiceData) {
        setAvailableSlots([])
        return
      }

      if (isSunday(formData.date)) {
        setAvailableSlots([])
        setBlockedReason("No atendemos los domingos.")
        return
      }

      try {
        setLoadingSlots(true)

        const { appointments, blocks } = await fetchPublicAvailability(
          formData.date
        )

        const fullDayBlock = getFullDayBlock(blocks)

        if (fullDayBlock) {
          setAvailableSlots([])
          setBlockedReason(fullDayBlock.reason || "Día bloqueado.")
          return
        }

        const blockedTimes = getBlockedTimes(blocks)

        const mappedAppointments = mapAppointmentsForAvailability(
          appointments as any[]
        )

        const slots = getAvailableSlotsForService({
          appointments: mappedAppointments,
          selectedService: {
            category: selectedServiceData.category,
            duration_minutes:
              selectedServiceData.category === "Pestañas"
                ? 120
                : selectedServiceData.duration_minutes,
          },
          date: formData.date,
          timeSlots,
          blockedTimes,
          lashistas: 2,
          removePastSlots: true,
        })

        setAvailableSlots(slots)

        if (formData.time && !slots.includes(formData.time)) {
          setFormData((prev) => ({ ...prev, time: "" }))
        }
      } catch {
        const message = "Error cargando horarios disponibles."
        setError(message)
        setAvailableSlots([])
        toast.error(message)
      } finally {
        setLoadingSlots(false)
      }
    }

    loadSlots()
  }, [formData.date, selectedServiceData])

  const servicePrice = Number(selectedServiceData?.price ?? 0)
  const depositAmount = 10
  const remainingAmount = Math.max(servicePrice - depositAmount, 0)

  const whatsappUrl = useMemo(() => {
    if (!submittedReservation) return ""

    const message = `Hola, hice una reserva.
Servicio: ${submittedReservation.serviceName}
Fecha: ${formatDateForMessage(submittedReservation.date)}
Hora: ${submittedReservation.time}`

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`
  }, [submittedReservation])

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
  }

  const handleSelectService = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      serviceId,
      date: "",
      time: "",
    }))

    setBlockedReason("")
    setError("")
  }

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "date" ? { time: "" } : {}),
    }))

    setBlockedReason("")
    setError("")
  }

  const handleSelectTime = (slot: string) => {
    if (!availableSlots.includes(slot)) {
      const message = "Ese horario ya no está disponible."
      setError(message)
      toast.error(message)
      return
    }

    setFormData((prev) => ({
      ...prev,
      time: slot,
    }))

    setError("")
  }

  const handleNewReservation = () => {
    setSubmittedReservation(null)
    setFormData(initialForm)
    setStep(1)
    setError("")
    setBlockedReason("")
    setSubmitStatus("idle")
    setAvailableSlots([])
  }

  const goToNextStep = () => {
    setError("")

    if (step === 1 && !formData.serviceId) {
      const message = "Selecciona un servicio para continuar."
      setError(message)
      toast.error(message)
      return
    }

    if (step === 2) {
      if (!formData.date) {
        const message = "Selecciona una fecha."
        setError(message)
        toast.error(message)
        return
      }

      if (isSunday(formData.date)) {
        const message = "No atendemos los domingos."
        setError(message)
        toast.error(message)
        return
      }

      if (blockedReason) {
        setError(blockedReason)
        toast.error(blockedReason)
        return
      }

      if (!formData.time || !availableSlots.includes(formData.time)) {
        const message = "Selecciona un horario disponible."
        setError(message)
        toast.error(message)
        return
      }
    }

    if (step === 3) {
      if (!formData.fullName.trim()) {
        const message = "Ingresa tu nombre completo."
        setError(message)
        toast.error(message)
        return
      }

      if (!normalizePeruvianPhone(formData.phone)) {
        const message = "Ingresa un celular peruano válido."
        setError(message)
        toast.error(message)
        return
      }
    }

    setStep((prev) => Math.min(prev + 1, 4))
  }

  const goToPreviousStep = () => {
    setError("")
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    const loadingToastId = toast.loading("Registrando reserva...")

    try {
      setSubmitStatus("loading")
      setError("")

      const parsed = reservationSchema.safeParse(formData)

      if (!parsed.success) {
        const message = parsed.error.issues[0].message
        setError(message)
        setSubmitStatus("error")
        toast.dismiss(loadingToastId)
        toast.error(message)
        return
      }

      if (!selectedServiceData) {
        const message = "Selecciona un servicio válido."
        setError(message)
        setSubmitStatus("error")
        toast.dismiss(loadingToastId)
        toast.error(message)
        return
      }

      if (isSunday(formData.date)) {
        const message = "No atendemos los domingos."
        setError(message)
        setSubmitStatus("error")
        toast.dismiss(loadingToastId)
        toast.error(message)
        return
      }

      const { appointments, blocks } = await fetchPublicAvailability(
        formData.date
      )

      const fullDayBlock = getFullDayBlock(blocks)

      if (fullDayBlock) {
        const message = fullDayBlock.reason || "Ese día está bloqueado."
        setError(message)
        setSubmitStatus("error")
        toast.dismiss(loadingToastId)
        toast.error(message)
        return
      }

      const blockedTimes = getBlockedTimes(blocks)

      const mappedAppointments = mapAppointmentsForAvailability(
        appointments as any[]
      )

      validateSlotAvailability({
        appointments: mappedAppointments,
        selectedService: {
          category: selectedServiceData.category,
          duration_minutes:
            selectedServiceData.category === "Pestañas"
              ? 120
              : selectedServiceData.duration_minutes,
        },
        date: formData.date,
        time: formData.time,
        blockedTimes,
        lashistas: 2,
        removePastSlots: true,
      })

      const latestSlots = getAvailableSlotsForService({
        appointments: mappedAppointments,
        selectedService: {
          category: selectedServiceData.category,
          duration_minutes:
            selectedServiceData.category === "Pestañas"
              ? 120
              : selectedServiceData.duration_minutes,
        },
        date: formData.date,
        timeSlots,
        blockedTimes,
        lashistas: 2,
        removePastSlots: true,
      })

      if (!latestSlots.includes(formData.time)) {
        const message = "Ese horario ya no está disponible."
        setError(message)
        setSubmitStatus("error")
        toast.dismiss(loadingToastId)
        toast.error(message)
        return
      }

      const result = await submitPublicReservation({
        formData,
        selectedServiceData,
        servicePrice,
        depositAmount,
        remainingAmount,
      })

      setSubmittedReservation(result)
      setSubmitStatus("success")

      toast.dismiss(loadingToastId)
      toast.success("Reserva registrada correctamente.")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al registrar la reserva."

      setError(message)
      setSubmitStatus("error")

      toast.dismiss(loadingToastId)
      toast.error(message)
    }
  }

  return {
    step,
    formData,
    setFormData,

    services,
    selectedServiceData,
    categoryCards,
    activeCategory,

    availableSlots,
    blockedReason,
    loading: submitStatus === "loading",
    submitStatus,
    loadingServices,
    loadingSlots,
    error,

    submittedReservation,
    whatsappUrl,

    today,
    timeSlots,
    isSunday,

    servicePrice,
    depositAmount,
    remainingAmount,

    handleCategoryChange,
    handleSelectService,
    handleChange,
    handleSelectTime,
    handleNewReservation,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
  }
}