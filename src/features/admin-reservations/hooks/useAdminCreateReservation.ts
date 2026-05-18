import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
import { fetchBusinessHours } from "../../business-hours/api/businessHoursService"
import {
  getBusinessHourForDate,
  getTimeSlotsForBusinessHour,
  type BusinessHour,
} from "../../business-hours/utils/businessHoursUtils"
import { normalizePeruvianPhone } from "../../reservations/utils/reservationUtils"
import {
  getBlockedTimes,
  getFullDayBlock,
  getAvailableSlotsForService,
  mapAppointmentsForAvailability,
  validateSlotAvailability,
  type RawAppointmentForAvailability,
} from "../../reservations/utils/reservationAvailability"
import {
  createAdminReservationWithPayment,
  fetchAdminAvailability,
  fetchAdminLashists,
  fetchAdminServices,
  findOrCreateAdminClient,
  type AdminLashistRow,
  type AdminServiceRow,
} from "../api/adminCreateReservationService"

type AppointmentType = "normal" | "retouch"

type AdminCreateReservationForm = {
  fullName: string
  phone: string
  service: string
  appointmentType: AppointmentType
  date: string
  time: string
  notes: string
  lashistId: string
}

type RequestStatus = "idle" | "loading" | "success" | "error"

const initialForm: AdminCreateReservationForm = {
  fullName: "",
  phone: "",
  service: "",
  appointmentType: "normal",
  date: "",
  time: "",
  notes: "",
  lashistId: "",
}

function getLocalDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function isPastDate(date: string) {
  if (!date) return false
  return date < getLocalDateString()
}

export function useAdminCreateReservation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState<AdminCreateReservationForm>(initialForm)
  const [services, setServices] = useState<AdminServiceRow[]>([])
  const [lashists, setLashists] = useState<AdminLashistRow[]>([])
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [blockedReason, setBlockedReason] = useState("")

  const [error, setError] = useState("")
  const [submitStatus, setSubmitStatus] = useState<RequestStatus>("idle")
  const [loadingServices, setLoadingServices] = useState(true)
  const [loadingLashists, setLoadingLashists] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const preselectedServiceId = searchParams.get("serviceId") ?? ""
  const preselectedType =
    searchParams.get("type") === "retouch" ? "retouch" : "normal"
  const preselectedFullName = searchParams.get("fullName") ?? ""
  const preselectedPhone = searchParams.get("phone") ?? ""

  const selectedServiceData = useMemo(() => {
    if (!form.service) return null
    return services.find((service) => service.id === form.service) ?? null
  }, [form.service, services])

  const selectedLashistData = useMemo(() => {
    if (!form.lashistId) return null
    return lashists.find((lashist) => lashist.id === form.lashistId) ?? null
  }, [form.lashistId, lashists])

  const isRetouch = form.appointmentType === "retouch"

  const servicePrice = useMemo(() => {
    if (!selectedServiceData) return 0

    if (isRetouch) {
      return Number(selectedServiceData.retouch_price ?? 0)
    }

    return Number(selectedServiceData.price ?? 0)
  }, [selectedServiceData, isRetouch])

  const depositAmount = 10
  const remainingAmount = Math.max(servicePrice - depositAmount, 0)

  const loading = submitStatus === "loading"
  const lashCapacity = lashists.length
  const minReservationDate = getLocalDateString()

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError("")
        setLoadingServices(true)
        setLoadingLashists(true)

        const [servicesData, lashistsData, businessHoursData] = await Promise.all([
          fetchAdminServices(),
          fetchAdminLashists(),
          fetchBusinessHours(),
        ])

        setServices(servicesData)
        setLashists(lashistsData)
        setBusinessHours(businessHoursData)

        setForm((prev) => ({
          ...prev,
          fullName: preselectedFullName || prev.fullName,
          phone: preselectedPhone || prev.phone,
          service: preselectedServiceId || prev.service,
          appointmentType: preselectedType,
        }))
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al cargar datos."

        setError(message)
        toast.error(message)
      } finally {
        setLoadingServices(false)
        setLoadingLashists(false)
      }
    }

    loadInitialData()
  }, [
    preselectedServiceId,
    preselectedType,
    preselectedFullName,
    preselectedPhone,
  ])

  useEffect(() => {
    const loadAvailableSlots = async () => {
      setBlockedReason("")
      setError("")

      if (!form.date || !selectedServiceData) {
        setAvailableSlots([])
        return
      }

      if (isPastDate(form.date)) {
        setAvailableSlots([])
        setBlockedReason("No se puede crear una reserva en una fecha pasada.")
        return
      }

      const businessHour = getBusinessHourForDate(businessHours, form.date)
      const dateTimeSlots = getTimeSlotsForBusinessHour(businessHour)

      if (businessHour?.is_closed || dateTimeSlots.length === 0) {
        setAvailableSlots([])
        setBlockedReason("No se atiende ese día.")
        return
      }

      try {
        setLoadingSlots(true)

        const { appointmentsData, blocks } = await fetchAdminAvailability(
          form.date
        )

        const selectedLashistId = form.lashistId || null
        const fullDayBlock = getFullDayBlock(blocks, selectedLashistId)

        if (fullDayBlock) {
          setAvailableSlots([])
          setBlockedReason(fullDayBlock.reason ?? "Día bloqueado.")
          return
        }

        const blockedTimes = getBlockedTimes(blocks, selectedLashistId)

        const appointments = mapAppointmentsForAvailability(
          appointmentsData as RawAppointmentForAvailability[]
        )

        const filteredSlots = getAvailableSlotsForService({
          appointments,
          selectedService: selectedServiceData,
          date: form.date,
          timeSlots: dateTimeSlots,
          blockedTimes,
          lashistas: lashCapacity,
          selectedLashistId: form.lashistId || null,
          removePastSlots: true,
        })

        setAvailableSlots(filteredSlots)

        if (form.time && !filteredSlots.includes(form.time)) {
          setForm((prev) => ({ ...prev, time: "" }))
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error al cargar disponibilidad."

        setAvailableSlots([])
        setBlockedReason("")
        setError(message)
        toast.error(message)
      } finally {
        setLoadingSlots(false)
      }
    }

    loadAvailableSlots()
  }, [businessHours, form.date, form.time, form.lashistId, lashCapacity, selectedServiceData])

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target

    setError("")

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      }

      if (name === "service") {
        next.date = ""
        next.time = ""
        next.appointmentType = "normal"
        setBlockedReason("")
      }

      if (name === "date") {
        next.time = ""
        setBlockedReason("")
      }

      if (name === "lashistId") {
        next.time = ""
        setBlockedReason("")
      }

      return next
    })
  }

  const validateForm = () => {
    if (!form.fullName.trim()) {
      return "Ingresa el nombre del cliente."
    }

    if (!form.phone.trim()) {
      return "Ingresa el teléfono del cliente."
    }

    if (!form.service || !form.date || !form.time) {
      return "Completa todos los campos obligatorios."
    }

    if (isPastDate(form.date)) {
      return "No se puede crear una reserva en una fecha pasada."
    }

    const businessHour = getBusinessHourForDate(businessHours, form.date)
    const dateTimeSlots = getTimeSlotsForBusinessHour(businessHour)

    if (businessHour?.is_closed || dateTimeSlots.length === 0) {
      return "No se atiende ese día."
    }

    if (!availableSlots.includes(form.time)) {
      return "La hora seleccionada ya no tiene disponibilidad."
    }

    const normalizedPhone = normalizePeruvianPhone(form.phone)

    if (!normalizedPhone) {
      return "Ingresa un celular peruano válido. Ejemplo: 957230015 o +51957230015"
    }

    if (!selectedServiceData) {
      return "Servicio no encontrado."
    }

      if (form.appointmentType === "retouch") {
      if (!selectedServiceData.allows_retouch) {
        return "Este servicio no tiene retoque configurado."
      }

      if (
        !selectedServiceData.retouch_price ||
        Number(selectedServiceData.retouch_price) <= 0
      ) {
        return "Este servicio no tiene precio de retoque válido."
      }
    }

    if (servicePrice <= 0) {
      return "El precio de la reserva no es válido."
    }

    return ""
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const loadingToastId = toast.loading("Creando reserva...")

    try {
      setSubmitStatus("loading")
      setError("")

      const validationMessage = validateForm()

      if (validationMessage) {
        setError(validationMessage)
        setSubmitStatus("error")
        toast.dismiss(loadingToastId)
        toast.error(validationMessage)
        return
      }

      if (!selectedServiceData) {
        throw new Error("Servicio no encontrado.")
      }

      const normalizedPhone = normalizePeruvianPhone(form.phone)

      if (!normalizedPhone) {
        throw new Error(
          "Ingresa un celular peruano válido. Ejemplo: 957230015 o +51957230015"
        )
      }

      const { appointmentsData, blocks } = await fetchAdminAvailability(
        form.date
      )

      const selectedLashistId = form.lashistId || null
      const fullDayBlock = getFullDayBlock(blocks, selectedLashistId)
      const blockedTimes = getBlockedTimes(blocks, selectedLashistId)

      if (fullDayBlock) {
        throw new Error(fullDayBlock.reason || "Ese día está bloqueado.")
      }

      if (blockedTimes.includes(form.time)) {
        throw new Error("Ese horario está bloqueado manualmente.")
      }

      const appointments = mapAppointmentsForAvailability(
        appointmentsData as RawAppointmentForAvailability[]
      )

      validateSlotAvailability({
        appointments,
        selectedService: selectedServiceData,
        date: form.date,
        time: form.time,
        timeSlots: getTimeSlotsForBusinessHour(
          getBusinessHourForDate(businessHours, form.date)
        ),
        lashistas: lashCapacity,
        selectedLashistId: form.lashistId || null,
        removePastSlots: true,
      })

      const clientId = await findOrCreateAdminClient(
        form.fullName.trim(),
        normalizedPhone
      )

      await createAdminReservationWithPayment({
        clientId,
        serviceId: selectedServiceData.id,
        date: form.date,
        time: form.time,
        notes: form.notes,
        lashistId: selectedLashistData?.id ?? null,
        lashista: selectedLashistData?.name ?? null,
        totalPrice: servicePrice,
        deposit: depositAmount,
        appointmentType: form.appointmentType,
      })

      setSubmitStatus("success")
      toast.dismiss(loadingToastId)
      toast.success(
        form.appointmentType === "retouch"
          ? "Retoque creado correctamente."
          : "Reserva creada correctamente."
      )

      navigate("/admin/reservas")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al crear la reserva."

      setError(message)
      setSubmitStatus("error")
      toast.dismiss(loadingToastId)
      toast.error(message)
    }
  }

  return {
    form,
    services,
    lashists,
    selectedServiceData,
    selectedLashistData,
    availableSlots,
    blockedReason,

    isRetouch,
    servicePrice,
    depositAmount,
    remainingAmount,

    error,
    loading,
    submitStatus,
    loadingServices,
    loadingLashists,
    loadingSlots,
    minReservationDate,

    handleChange,
    handleSubmit,
  }
}
