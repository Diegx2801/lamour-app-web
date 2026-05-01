import {
  createAppointment,
  createClient,
  findClientByPhone,
  updateClient,
} from "../api/reservationService"
import { normalizePeruvianPhone } from "../utils/reservationUtils"

export async function submitPublicReservation(params: {
  formData: any
  selectedServiceData: any
  servicePrice: number
  depositAmount: number
  remainingAmount: number
}) {
  const { formData, selectedServiceData, servicePrice, depositAmount, remainingAmount } = params

  const phone = normalizePeruvianPhone(formData.phone)
  if (!phone) throw new Error("Celular inválido")

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