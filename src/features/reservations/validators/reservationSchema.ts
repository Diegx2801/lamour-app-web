import { z } from "zod"

export const reservationSchema = z.object({
  serviceId: z.string().min(1, "Selecciona un servicio"),

  fullName: z
    .string()
    .trim()
    .min(5, "Ingresa tu nombre y apellido")
    .refine((value) => value.split(/\s+/).length >= 2, {
      message: "Ingresa al menos nombre y apellido",
    }),

  phone: z
    .string()
    .min(9, "Ingresa un celular válido")
    .refine((value) => {
      const digits = value.replace(/\D/g, "")

      const phone = digits.startsWith("51")
        ? digits.slice(2)
        : digits

      return /^9\d{8}$/.test(phone)
    }, "Debe ser un número peruano válido"),

  date: z.string().min(1, "Selecciona una fecha"),
  time: z.string().min(1, "Selecciona una hora"),
  notes: z.string().optional(),
})