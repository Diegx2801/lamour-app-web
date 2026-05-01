import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { timeSlots } from "../../../data/timeSlots"
import { isSunday } from "../../reservations/utils/reservationUtils"
import {
  getAvailableSlotsForService,
  getBlockedTimes,
  getFullDayBlock,
  mapAppointmentsForAvailability,
  validateSlotAvailability,
} from "../../reservations/utils/reservationAvailability"
import {
  fetchEditAvailability,
  fetchEditLashists,
  fetchReservationById,
  updateReservationById,
  type EditLashistRow,
  type EditReservationService,
} from "../api/adminEditReservationService"

type EditReservationForm = {
  date: string
  time: string
  status: string
  notes: string
  lashistId: string
}

const initialForm: EditReservationForm = {
  date: "",
  time: "",
  status: "pending",
  notes: "",
  lashistId: "",
}

function getRelatedService(service: EditReservationService) {
  if (!service) return null
  return Array.isArray(service) ? service[0] ?? null : service
}

export function useAdminEditReservation() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState<EditReservationForm>(initialForm)
  const [lashists, setLashists] = useState<EditLashistRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots)
  const [selectedServiceData, setSelectedServiceData] = useState<
    ReturnType<typeof getRelatedService>
  >(null)
  const [blockedReason, setBlockedReason] = useState("")

  const currentReservationId = useMemo(() => id ?? "", [id])

  const selectedLashistData = useMemo(() => {
    if (!form.lashistId) return null
    return lashists.find((lashist) => lashist.id === form.lashistId) ?? null
  }, [form.lashistId, lashists])

  useEffect(() => {
    const loadReservation = async () => {
      if (!currentReservationId) {
        setError("Reserva no encontrada.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        const [reservation, lashistsData] = await Promise.all([
          fetchReservationById(currentReservationId),
          fetchEditLashists(),
        ])

        const service = getRelatedService(reservation.services)

        setLashists(lashistsData)

        setForm({
          date: reservation.date ?? "",
          time: String(reservation.time).slice(0, 5),
          status: reservation.status ?? "pending",
          notes: reservation.notes ?? "",
          lashistId: reservation.lashist_id ?? "",
        })

        setSelectedServiceData(service)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Ocurrió un error inesperado."

        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    loadReservation()
  }, [currentReservationId])

  useEffect(() => {
    const loadAvailableSlots = async () => {
      setBlockedReason("")
      setError("")

      if (!form.date || !currentReservationId) {
        setAvailableSlots(timeSlots)
        return
      }

      if (isSunday(form.date)) {
        setAvailableSlots([])
        setBlockedReason("No se atiende domingos.")
        return
      }

      try {
        setLoadingSlots(true)

        const { appointmentsData, blocks } = await fetchEditAvailability(
          form.date
        )

        const fullDayBlock = getFullDayBlock(blocks)

        if (fullDayBlock) {
          setAvailableSlots([])
          setBlockedReason(fullDayBlock.reason ?? "Día bloqueado.")
          return
        }

        const blockedTimes = getBlockedTimes(blocks)

        const appointments = mapAppointmentsForAvailability(
          appointmentsData as any[]
        )

        const slots = getAvailableSlotsForService({
          appointments,
          selectedService: selectedServiceData
            ? {
                category: selectedServiceData.category,
                duration_minutes:
                  selectedServiceData.category === "Pestañas"
                    ? 120
                    : selectedServiceData.duration_minutes,
              }
            : null,
          date: form.date,
          timeSlots,
          blockedTimes,
          excludeAppointmentId: currentReservationId,
          lashistas: 2,
        })

        const currentTime = form.time

        const normalizedSlots =
          currentTime && !slots.includes(currentTime)
            ? [...slots, currentTime].sort()
            : slots

        setAvailableSlots(normalizedSlots)

        if (currentTime && !normalizedSlots.includes(currentTime)) {
          setForm((prev) => ({ ...prev, time: "" }))
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error al cargar disponibilidad."

        setAvailableSlots(timeSlots)
        setBlockedReason("")
        setError(message)
        toast.error(message)
      } finally {
        setLoadingSlots(false)
      }
    }

    loadAvailableSlots()
  }, [form.date, form.time, currentReservationId, selectedServiceData])

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

      if (name === "date") {
        next.time = ""
        setBlockedReason("")
      }

      return next
    })
  }

  const validateForm = () => {
    if (!form.date || !form.time || !form.status) {
      return "Completa los campos obligatorios."
    }

    if (isSunday(form.date)) {
      return "No se atiende domingos."
    }

    if (blockedReason) {
      return blockedReason
    }

    return ""
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const loadingToastId = toast.loading("Guardando cambios...")

    try {
      setSaving(true)
      setError("")

      const validationMessage = validateForm()

      if (validationMessage) {
        setError(validationMessage)
        toast.dismiss(loadingToastId)
        toast.error(validationMessage)
        return
      }

      if (!currentReservationId) {
        throw new Error("Reserva no encontrada.")
      }

      if (!selectedServiceData) {
        throw new Error("Servicio no encontrado.")
      }

      const { appointmentsData, blocks } = await fetchEditAvailability(form.date)

      const fullDayBlock = getFullDayBlock(blocks)
      const blockedTimes = getBlockedTimes(blocks)

      if (fullDayBlock) {
        throw new Error(fullDayBlock.reason || "Ese día está bloqueado.")
      }

      if (blockedTimes.includes(form.time)) {
        throw new Error("Ese horario está bloqueado manualmente.")
      }

      const appointments = mapAppointmentsForAvailability(
        appointmentsData as any[]
      )

      validateSlotAvailability({
        appointments,
        selectedService: {
          category: selectedServiceData.category,
          duration_minutes:
            selectedServiceData.category === "Pestañas"
              ? 120
              : selectedServiceData.duration_minutes,
        },
        date: form.date,
        time: form.time,
        excludeAppointmentId: currentReservationId,
        lashistas: 2,
      })

      await updateReservationById(currentReservationId, {
        date: form.date,
        time: form.time,
        status: form.status,
        notes: form.notes,
        lashistId: selectedLashistData?.id ?? null,
        lashista: selectedLashistData?.name ?? null,
      })

      toast.dismiss(loadingToastId)
      toast.success("Reserva actualizada correctamente.")
      navigate("/admin/reservas")
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado."

      setError(message)
      toast.dismiss(loadingToastId)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return {
    form,
    lashists,
    selectedLashistData,
    loading,
    saving,
    loadingSlots,
    error,
    availableSlots,
    selectedServiceData,
    blockedReason,

    handleChange,
    handleSubmit,
  }
}