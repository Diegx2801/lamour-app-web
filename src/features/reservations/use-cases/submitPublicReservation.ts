import {
  createPublicReservation,
  type ServiceRow,
} from "../api/reservationService"
import { normalizePeruvianPhone } from "../utils/reservationUtils"

export type PublicReservationForm = {
  serviceId: string
  fullName: string
  phone: string
  date: string
  time: string
  notes: string
}

type SubmitPublicReservationParams = {
  formData: PublicReservationForm
  selectedServiceData: ServiceRow
}

export async function submitPublicReservation({
  formData,
  selectedServiceData,
}: SubmitPublicReservationParams) {
  const phone = normalizePeruvianPhone(formData.phone)

  if (!phone) {
    throw new Error("Celular inválido.")
  }

  const reservation = await createPublicReservation({
    fullName: formData.fullName.trim(),
    phone,
    serviceId: formData.serviceId,
    date: formData.date,
    time: formData.time,
    notes: formData.notes,
  })

  return {
    ...formData,
    phone,
    serviceName: selectedServiceData.name,
    category: selectedServiceData.category,
    totalPrice: Number(reservation.total_price ?? 0),
    depositAmount: Number(reservation.deposit_amount ?? 0),
    remainingAmount: Number(reservation.remaining_amount ?? 0),
  }
}
