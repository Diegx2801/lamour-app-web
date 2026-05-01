type SelectedServiceData = {
  name: string
} | null

type ReserveStepConfirmProps = {
  selectedServiceData: SelectedServiceData
  date: string
  time: string
  fullName: string
  phone: string
  phonePreview: string | null
  formatDateForMessage: (date: string) => string
}

function ReserveStepConfirm({
  selectedServiceData,
  date,
  time,
  fullName,
  phone,
  phonePreview,
  formatDateForMessage,
}: ReserveStepConfirmProps) {
  return (
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
        {formatDateForMessage(date)}
      </p>
      <p>
        <span className="font-medium">Hora:</span>{" "}
        {time || "-"}
      </p>
      <p>
        <span className="font-medium">Cliente:</span>{" "}
        {fullName || "-"}
      </p>
      <p>
        <span className="font-medium">Teléfono:</span>{" "}
        {phonePreview ?? phone ?? "-"}
      </p>
      <p>
        <span className="font-medium">Abono requerido:</span> S/ 10.00
      </p>

      <div className="mt-4 rounded-2xl bg-white p-4 text-stone-600">
        Al finalizar, podrás tocar un botón para ir a WhatsApp y enviar tu
        comprobante de abono.
      </div>
    </div>
  )
}

export default ReserveStepConfirm