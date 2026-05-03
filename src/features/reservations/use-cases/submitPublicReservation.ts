import {
  createAppointment,
  createClient,
  findClientByPhone,
  updateClient,
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
  servicePrice: number
  depositAmount: number
  remainingAmount: number
}

export async function submitPublicReservation({
  formData,
  selectedServiceData,
  servicePrice,
  depositAmount,
  remainingAmount,
}: SubmitPublicReservationParams) {
  const phone = normalizePeruvianPhone(formData.phone)

  if (!phone) {
    throw new Error("Celular inválido.")
  }

  const existingClient = await findClientByPhone(phone)
  let clientId = existingClient?.id

  if (!clientId) {
    const newClient = await createClient(formData.fullName.trim(), phone)
    clientId = newClient.id
  } else {
    await updateClient(clientId, formData.fullName.trim(), phone)
  }

  await createAppointment({
    clientId,
    serviceId: formData.serviceId,
    date: formData.date,
    time: formData.time,
    notes: formData.notes,
    totalPrice: servicePrice,
    depositAmount,
    remainingAmount,
  })

  return {
    ...formData,
    phone,
    serviceName: selectedServiceData.name,
    category: selectedServiceData.category,
    totalPrice: servicePrice,
    depositAmount,
    remainingAmount,
  }
}