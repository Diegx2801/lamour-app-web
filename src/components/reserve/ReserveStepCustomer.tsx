type ReservationForm = {
  fullName: string
  phone: string
  notes: string
}

type ReserveStepCustomerProps = {
  formData: ReservationForm
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
}

function ReserveStepCustomer({
  formData,
  onChange,
}: ReserveStepCustomerProps) {
  return (
    <>
      <div>
        <label
          htmlFor="reserve-full-name"
          className="mb-2 block text-sm font-medium text-stone-800"
        >
          Nombre completo *
        </label>
        <input
          id="reserve-full-name"
          type="text"
          name="fullName"
          autoComplete="name"
          value={formData.fullName}
          onChange={onChange}
          placeholder="Ingresa tu nombre"
          className="w-full rounded-2xl border border-stone-300 px-4 py-4 text-base outline-none focus:border-stone-600"
        />
      </div>

      <div>
        <label
          htmlFor="reserve-phone"
          className="mb-2 block text-sm font-medium text-stone-800"
        >
          Teléfono *
        </label>
        <input
          id="reserve-phone"
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          value={formData.phone}
          onChange={onChange}
          placeholder="Ejemplo: 957230015 o +51957230015"
          className="w-full rounded-2xl border border-stone-300 px-4 py-4 text-base outline-none focus:border-stone-600"
        />
        <p className="mt-2 text-xs text-stone-500">
          Aceptamos números peruanos móviles de 9 dígitos.
        </p>
      </div>

      <div>
        <label
          htmlFor="reserve-notes"
          className="mb-2 block text-sm font-medium text-stone-800"
        >
          Observaciones
        </label>
        <textarea
          id="reserve-notes"
          rows={4}
          name="notes"
          value={formData.notes}
          onChange={onChange}
          placeholder="Escribe algún detalle adicional"
          className="w-full rounded-2xl border border-stone-300 px-4 py-4 text-base outline-none focus:border-stone-600"
        />
      </div>
    </>
  )
}

export default ReserveStepCustomer
